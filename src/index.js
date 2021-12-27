const scrollableComponentTemplate = document.createElement('template');
scrollableComponentTemplate.innerHTML = `<style>{{COMPONENT_CSS}}</style>{{COMPONENT_HTML}}`;

const orientations = ['vertical', 'horizontal'];
const sizes = {
  vertical: 'height',
  horizontal: 'width',
};
const offsetSizes = {
  vertical: 'offsetHeight',
  horizontal: 'offsetWidth',
};
const positions = {
  vertical: 'top',
  horizontal: 'left',
};
const scrollSizes = {
  vertical: 'scrollHeight',
  horizontal: 'scrollWidth',
}
const scrollPositions = {
  vertical: 'scrollTop',
  horizontal: 'scrollLeft',
}
const overflows = {
  vertical: 'overflow-y',
  horizontal: 'overflow-x',
};
const clientCoordinates = {
  vertical: 'clientY',
  horizontal: 'clientX',
};
const pageCoordinates = {
  vertical: 'pageY',
  horizontal: 'pageX',
};

export class ScrollableComponentElement extends HTMLElement {

  #elements = {
    vertical: {
      scrollbar: null,
      scrollbarTrack: null,
      scrollbarThumb: null,
    },
    horizontal: {
      scrollbar: null,
      scrollbarTrack: null,
      scrollbarThumb: null,
    },
  };
  #restrictContentSize = {
    vertical: false,
    horizontal: false,
  };
  #viewportSize = {
    vertical: 0,
    horizontal: 0,
  };
  #scrollbarTrackSize = {
    vertical: 0,
    horizontal: 0,
  };
  #viewportToScrollbarRatios = {
    vertical: 1,
    horizontal: 1,
  };
  #isOverflowing = {
    vertical: false,
    horizontal: false,
  };
  #isScrollingWithThumb = {
    vertical: false,
    horizontal: false,
  };
  #scrollingWithThumbOrigin = {
    pageX: 0,
    pageY: 0,
    scrollTop: 0,
    scrollLeft: 0,
  };
  #scrollingWithThumbRatios = {
    vertical: 1,
    horizontal: 1,
  };
  #animationFrame = null;

  constructor() {
    super();
    this.#initializeLayout();
    this.#initializeEventListeners();
  }

  #initializeLayout() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(scrollableComponentTemplate.content.cloneNode(true));
    this.viewport = this.shadowRoot.querySelector('.viewport');
    this.content = this.viewport.querySelector('.content');
    for (let orientation of orientations) {
      this.#elements[orientation].scrollbar = this.shadowRoot.querySelector(`.${[orientation]}-scrollbar`);
      this.#elements[orientation].scrollbarTrack = this.#elements[orientation].scrollbar.querySelector('.scrollbar-track');
      this.#elements[orientation].scrollbarThumb = this.#elements[orientation].scrollbarTrack.querySelector('.scrollbar-thumb');
    }
  }

  #initializeEventListeners() {
    for (let orientation of orientations) {
      // Scroll to pointer position in scrollbar's track
      this.#elements[orientation].scrollbarTrack.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.#onScrollWithTrack(orientation, event);
      });

      // Scrolling with thumb
      const onScrollWithThumbMove = (event) => {
        this.#onScrollWithThumbMove(orientation, event);
      };

      // Start of scrolling with thumb
      this.#elements[orientation].scrollbarThumb.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.#elements[orientation].scrollbarThumb.addEventListener('pointermove', onScrollWithThumbMove, { passive: true });
        this.#elements[orientation].scrollbarThumb.setPointerCapture(event.pointerId);
        this.#onScrollWithThumbStart(orientation, event);
      });

      // End of scrolling with thumb
      this.#elements[orientation].scrollbarThumb.addEventListener('pointerup', (event) => {
        this.#elements[orientation].scrollbarThumb.removeEventListener('pointermove', onScrollWithThumbMove, { passive: true });
        this.#elements[orientation].scrollbarThumb.releasePointerCapture(event.pointerId);
        this.#onScrollWithThumbEnd(orientation);
      }, { passive: true });
    }

    // Update scrollbar's thumb position when scrolling
    this.viewport.addEventListener('scroll', () => {
      this.#onScrollEvent();
    }, { passive: true });

    // Show scrollbars when start scrolling with touch gestures
    this.viewport.addEventListener('touchstart', () => {
      this.#onTouchStart();
    }, { passive: true });

    // Hide scrollbars at the end of scrolling with touch gestures
    this.viewport.addEventListener('touchend', () => {
      this.#onTouchEnd();
    }, { passive: true });

    // Update entire scrollbar when resizing the viewport or the content
    const resizeObserver = new ResizeObserver(() => {
      this.#onResizeEvent();
    });
    resizeObserver.observe(this.viewport);
    resizeObserver.observe(this.content);
    for (let orientation of orientations) {
      resizeObserver.observe(this.#elements[orientation].scrollbarTrack);
    }
  }

  #onScrollWithTrack(orientation, event) {
    // When scrolling using the custom scrollbar's track, we need to use "fresh" bounding client rects to ensure correct results,
    // as the scrollbar's track & thumb may have their size and position changed without triggering the resize observer,
    // i.e: position after scrolling or size after CSS scale transform
    const scrollbarTrackBoundingBox = this.#elements[orientation].scrollbarTrack.getBoundingClientRect();
    const scrollbarThumbBoundingBox = this.#elements[orientation].scrollbarThumb.getBoundingClientRect();
    const newScrollbarThumbPosition = event[clientCoordinates[orientation]] - scrollbarTrackBoundingBox[positions[orientation]] - scrollbarThumbBoundingBox[sizes[orientation]] / 2;
    const scrollingRatios = this.#scrollbarTrackSize[orientation] / scrollbarTrackBoundingBox[sizes[orientation]];
    const newViewportScollPosition = newScrollbarThumbPosition / this.#viewportToScrollbarRatios[orientation] * scrollingRatios;

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.viewport.scrollTo({
        [positions[orientation]]: newViewportScollPosition,
        behavior: 'smooth',
      });

      // Gives back the focus to the viewport after clicking the scrollbar's track,
      // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
      this.viewport.focus({preventScroll: true});
    });
  }

  #onScrollWithThumbStart(orientation, event) {
    // When scrolling using the custom scrollbar's thumb, we need to use "fresh" bounding client rects to ensure correct results,
    // as the scrollbar's track may have its size and position changed without triggering the resize observer,
    // i.e: after CSS scale transform
    const scrollbarTrackBoundingBox = this.#elements[orientation].scrollbarTrack.getBoundingClientRect();
    this.#scrollingWithThumbRatios[orientation] = this.#scrollbarTrackSize[orientation] / scrollbarTrackBoundingBox[sizes[orientation]];
    this.#scrollingWithThumbOrigin[pageCoordinates[orientation]] = event.touches ? event.touches[0][pageCoordinates[orientation]] : event[pageCoordinates[orientation]];
    this.#scrollingWithThumbOrigin[scrollPositions[orientation]] = this.viewport[scrollPositions[orientation]];
    this.#isScrollingWithThumb[orientation] = true;

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.viewport.classList.add(`scrolling-with-${orientation}-thumb`);
      this.#elements[orientation].scrollbar.classList.add('scrolling-with-thumb');

      // Gives back the focus to the viewport after clicking the scrollbar's thumb,
      // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
      this.viewport.focus({preventScroll: true});
    });
  }

  #onScrollWithThumbMove(orientation, event) {
    if (this.#isScrollingWithThumb[orientation]) {
      const scrollbarThumbOffset = (event.touches ? event.touches[0][pageCoordinates[orientation]] : event[pageCoordinates[orientation]]) - this.#scrollingWithThumbOrigin[pageCoordinates[orientation]];
      const viewportScrollOffset = scrollbarThumbOffset / this.#viewportToScrollbarRatios[orientation] * this.#scrollingWithThumbRatios[orientation];
      const newViewportScrollPosition = this.#scrollingWithThumbOrigin[scrollPositions[orientation]] + viewportScrollOffset;
      this.viewport[scrollPositions[orientation]] = newViewportScrollPosition;
    }
  }

  #onScrollWithThumbEnd(orientation) {
    if (this.#isScrollingWithThumb[orientation]) {
      this.#isScrollingWithThumb[orientation] = false;
      this.viewport.classList.remove(`scrolling-with-${orientation}-thumb`);
      this.#elements[orientation].scrollbar.classList.remove('scrolling-with-thumb');
    }
  }

  #onTouchStart() {
    this.viewport.classList.add('touch');
  }

  #onTouchEnd() {
    this.viewport.classList.remove('touch');
  }

  #onScrollEvent() {
    if (this.#animationFrame) {
      return;
    }
    this.#animationFrame = requestAnimationFrame(() => {
      this.#updateScrollPositions();
      this.#animationFrame = null;
    });
  }

  #onResizeEvent() {
    this.#updateCache();
    if (this.#animationFrame) {
      return;
    }
    this.#animationFrame = requestAnimationFrame(() => {
      this.#updateProperties();
      this.#updateScrollPositions();
      this.#animationFrame = null;
    });
  }

  connectedCallback() {
    this.#updateCache();
    this.#updateProperties();
    this.#updateScrollPositions();
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'scrollbar-visibility') {
      this.viewport.classList.toggle('scrollbar-visible', newValue === 'always');
    }
    else if (attributeName === 'vertical-scrollbar-position') {
      this.#elements.vertical.scrollbar.classList.toggle('left-position', newValue === 'left');
    }
    else if (attributeName === 'horizontal-scrollbar-position') {
      this.#elements.horizontal.scrollbar.classList.toggle('top-position', newValue === 'top');
    }
  }

  static get observedAttributes() {
    return ['scrollbar-visibility', 'vertical-scrollbar-position', 'horizontal-scrollbar-position'];
  }

  #updateCache() {
    // Caches as much as possible to avoid useless repaint/reflow
    const computedStyle = getComputedStyle(this.viewport);
    for (let orientation of orientations) {
      this.#restrictContentSize[orientation] = computedStyle.getPropertyValue(overflows[orientation]).trim() === 'hidden';
      this.#viewportSize[orientation] = Math.floor(this.viewport[offsetSizes[orientation]] * 10) / 10;
      this.#scrollbarTrackSize[orientation] = Math.floor(this.#elements[orientation].scrollbarTrack[offsetSizes[orientation]] * 10) / 10;
      this.#viewportToScrollbarRatios[orientation] = this.#scrollbarTrackSize[orientation] / this.viewport[scrollSizes[orientation]];
      this.#isOverflowing[orientation] = !this.#restrictContentSize[orientation] && this.viewport[scrollSizes[orientation]] > Math.ceil(this.#viewportSize[orientation]);
    }
  }

  #updateProperties() {
    for (let orientation of orientations) {
      this.shadowRoot.host.style.setProperty(`--viewport-${sizes[orientation]}`, `${this.#viewportSize[orientation]}px`);
      this.content.classList.toggle(`restrict-${sizes[orientation]}`, this.#restrictContentSize[orientation]);
      this.#elements[orientation].scrollbar.classList.toggle('hidden', !this.#isOverflowing[orientation]);
      if (this.#isOverflowing[orientation]) {
        const newScrollbarThumbSize = this.#viewportSize[orientation] * this.#viewportToScrollbarRatios[orientation];
        this.#elements[orientation].scrollbarThumb.style[sizes[orientation]] = `${newScrollbarThumbSize}px`;
      }
    }
  }

  #updateScrollPositions() {
    for (let orientation of orientations) {
      if (this.#isOverflowing[orientation]) {
        const newScrollbarThumbPosition = this.viewport[scrollPositions[orientation]] * this.#viewportToScrollbarRatios[orientation];
        this.#elements[orientation].scrollbarThumb.style.transform = orientation === 'vertical'
          ? `translate3D(0, ${newScrollbarThumbPosition}px, 0)`
          : `translate3D(${newScrollbarThumbPosition}px, 0, 0)`;
      }
    }
  }

}

window.customElements.define('scrollable-component', ScrollableComponentElement);
