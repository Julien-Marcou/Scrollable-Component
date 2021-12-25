const scrollableComponentTemplate = document.createElement('template');
scrollableComponentTemplate.innerHTML = `
  <style>
    * {
      box-sizing: border-box;
    }
    :host {
      --fade-in-transition-duration: 150ms;
      --fade-out-transition-duration: 800ms;
      --fade-out-transition-delay: 300ms;
      --fill-color-transition-duration: 150ms;

      --viewport-overflow-x: auto;
      --viewport-overflow-y: auto;
      --viewport-scroll-snap-type: none;
      --viewport-scroll-behavior: auto;
      --viewport-overscroll-behavior: auto;

      --scrollbar-width: 16px;
      --scrollbar-padding: 2px;
      --scrollbar-fill-color: transparent;
      --scrollbar-fill-color-hover: transparent;
      --scrollbar-border-width: 0
      --scrollbar-border-style: none;
      --scrollbar-border-color: #999;
      --scrollbar-border-radius: 0;
      --scrollbar-box-shadow: none;
      --vertical-scrollbar-background: none;
      --vertical-scrollbar-background-size: auto;
      --horizontal-scrollbar-background: none;
      --horizontal-scrollbar-background-size: auto;

      --scrollbar-track-fill-color: transparent;
      --scrollbar-track-fill-color-hover: transparent;
      --scrollbar-track-border-width: 0
      --scrollbar-track-border-style: none;
      --scrollbar-track-border-color: #999;
      --scrollbar-track-border-radius: 0;
      --scrollbar-track-box-shadow: none;
      --vertical-scrollbar-track-background: none;
      --vertical-scrollbar-track-background-size: auto;
      --horizontal-scrollbar-track-background: none;
      --horizontal-scrollbar-track-background-size: auto;

      --scrollbar-thumb-fill-color: #ccc;
      --scrollbar-thumb-fill-color-hover: #aaa;
      --scrollbar-thumb-border-width: 0
      --scrollbar-thumb-border-style: none;
      --scrollbar-thumb-border-color: #999;
      --scrollbar-thumb-border-radius: var(--scrollbar-width);
      --scrollbar-thumb-box-shadow: none;
      --vertical-scrollbar-thumb-background: none;
      --vertical-scrollbar-thumb-background-size: auto;
      --horizontal-scrollbar-thumb-background: none;
      --horizontal-scrollbar-thumb-background-size: auto;

      --content-padding: 0;

      position: relative;
      overflow: hidden;
      display: grid;
      grid-template: 1fr / 1fr;
    }

    /* Viewport */
    .viewport {
      z-index: 0;
      display: grid;
      overflow-x: var(--viewport-overflow-x);
      overflow-y: var(--viewport-overflow-y);
      scrollbar-width: none;
      outline: none;
      scroll-behavior: var(--viewport-scroll-behavior);
      overscroll-behavior: var(--viewport-overscroll-behavior);
      scroll-snap-type: var(--viewport-scroll-snap-type);
    }
    .viewport::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    .viewport:hover,
    .viewport:not(:focus):focus-within,
    .viewport.touch,
    .viewport.scrolling-with-vertical-thumb,
    .viewport.scrolling-with-horizontal-thumb {
      will-change: scroll-position;
    }
    .viewport.scrolling-with-vertical-thumb,
    .viewport.scrolling-with-horizontal-thumb {
      pointer-events: none;
    }

    /* Content */
    .content {
      padding: var(--content-padding);
    }
    .content.restrict-width {
      width: var(--viewport-width);
    }
    .content.restrict-height {
      height: var(--viewport-height);
    }

    /* Scrollbar */
    .scrollbar {
      user-select: none;
      touch-action: none;
      position: absolute;
      padding: var(--scrollbar-padding);
      border-width: var(--scrollbar-border-width);
      border-style: var(--scrollbar-border-style);
      border-color: var(--scrollbar-border-color);
      border-radius: var(--scrollbar-border-radius);
      box-shadow: var(--scrollbar-box-shadow);
      opacity: 0;
      transition: opacity var(--fade-out-transition-duration) ease-in-out var(--fade-out-transition-delay), background-color var(--fill-color-transition-duration) ease-out;
    }
    .vertical-scrollbar {
      z-index: 20;
      width: var(--scrollbar-width);
      right: 0;
      top: 0;
      bottom: 0;
      background: var(--vertical-scrollbar-background);
      background-color: var(--scrollbar-fill-color);
      background-size: var(--vertical-scrollbar-background-size);
    }
    .vertical-scrollbar.left-position {
      left: 0;
      right: auto;
    }
    .horizontal-scrollbar {
      z-index: 10;
      height: var(--scrollbar-width);
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--horizontal-scrollbar-background);
      background-color: var(--scrollbar-fill-color);
      background-size: var(--horizontal-scrollbar-background-size);
    }
    .horizontal-scrollbar.top-position {
      top: 0;
      bottom: auto;
    }
    .scrollbar:hover,
    .scrollbar.scrolling-with-thumb,
    .viewport:hover ~ .scrollbar,
    .viewport:not(:focus):focus-within ~ .scrollbar,
    .viewport.touch ~ .scrollbar {
      will-change: opacity;
      opacity: 1;
      transition: opacity var(--fade-in-transition-duration) ease-in-out 0s, background-color var(--fill-color-transition-duration) ease-out;
    }
    .viewport.scrollbar-visible ~ .scrollbar {
      opacity: 1;
      transition: none;
    }
    .scrollbar:hover,
    .scrollbar.scrolling-with-thumb {
      pointer-events: all;
      z-index: 30;
      background-color: var(--scrollbar-fill-color-hover);
    }
    .scrollbar.hidden {
      display: none;
    }
    .scrollbar .scrollbar-track {
      height: 100%;
      width: 100%;
      border-width: var(--scrollbar-track-border-width);
      border-style: var(--scrollbar-track-border-style);
      border-color: var(--scrollbar-track-border-color);
      border-radius: var(--scrollbar-track-border-radius);
      box-shadow: var(--scrollbar-track-box-shadow);
      transition: background-color var(--fill-color-transition-duration) ease-out;
    }

    /* Scrollbar's strack */
    .vertical-scrollbar .scrollbar-track {
      background: var(--vertical-scrollbar-track-background);
      background-color: var(--scrollbar-track-fill-color);
      background-size: var(--vertical-scrollbar-track-background-size);
    }
    .horizontal-scrollbar .scrollbar-track {
      background: var(--horizontal-scrollbar-track-background);
      background-color: var(--scrollbar-track-fill-color);
      background-size: var(--horizontal-scrollbar-track-background-size);
    }
    .scrollbar-track:hover,
    .scrollbar.scrolling-with-thumb .scrollbar-track {
      background-color: var(--scrollbar-track-fill-color-hover);
    }

    /* Scrollbar's thumb */
    .scrollbar .scrollbar-thumb {
      height: 100%;
      width: 100%;
      border-width: var(--scrollbar-thumb-border-width);
      border-style: var(--scrollbar-thumb-border-style);
      border-color: var(--scrollbar-thumb-border-color);
      border-radius: var(--scrollbar-thumb-border-radius);
      transform: translate3d(0, 0, 0);
      box-shadow: var(--scrollbar-thumb-box-shadow);
      transition: background-color var(--fill-color-transition-duration) ease-out;
    }
    .vertical-scrollbar .scrollbar-thumb {
      background: var(--vertical-scrollbar-thumb-background);
      background-color: var(--scrollbar-thumb-fill-color);
      background-size: var(--vertical-scrollbar-thumb-background-size);
    }
    .horizontal-scrollbar .scrollbar-thumb {
      background: var(--horizontal-scrollbar-thumb-background);
      background-color: var(--scrollbar-thumb-fill-color);
      background-size: var(--horizontal-scrollbar-thumb-background-size);
    }
    .scrollbar .scrollbar-thumb:hover,
    .scrollbar.scrolling-with-thumb .scrollbar-thumb {
      background-color: var(--scrollbar-thumb-fill-color-hover);
    }
  </style>
  <div class="viewport" tabindex="-1">
    <div class="content">
      <slot></slot>
    </div>
  </div>
  <div class="scrollbar vertical-scrollbar hidden">
    <div class="scrollbar-track">
      <div class="scrollbar-thumb"></div>
    </div>
  </div>
  <div class="scrollbar horizontal-scrollbar hidden">
    <div class="scrollbar-track">
      <div class="scrollbar-thumb"></div>
    </div>
  </div>
`;
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

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(scrollableComponentTemplate.content.cloneNode(true));
    this.viewport = this.shadowRoot.querySelector('.viewport');
    this.content = this.viewport.querySelector('.content');
    this.elements = {
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
    this.restrictContentSize = {
      vertical: false,
      horizontal: false,
    };
    this.viewportSize = {
      vertical: 0,
      horizontal: 0,
    };
    this.scrollbarTrackSize = {
      vertical: 0,
      horizontal: 0,
    };
    this.viewportToScrollbarRatios = {
      vertical: 1,
      horizontal: 1,
    };
    this.isOverflowing = {
      vertical: false,
      horizontal: false,
    };
    this.isScrollingWithThumb = {
      vertical: false,
      horizontal: false,
    };
    this.scrollingWithThumbOrigin = {
      pageX: 0,
      pageY: 0,
      scrollTop: 0,
      scrollLeft: 0,
    };
    this.scrollingWithThumbRatios = {
      vertical: 1,
      horizontal: 1,
    };
    this.animationFrame = null;

    for (let orientation of orientations) {
      this.elements[orientation].scrollbar = this.shadowRoot.querySelector(`.${[orientation]}-scrollbar`);
      this.elements[orientation].scrollbarTrack = this.elements[orientation].scrollbar.querySelector('.scrollbar-track');
      this.elements[orientation].scrollbarThumb = this.elements[orientation].scrollbarTrack.querySelector('.scrollbar-thumb');

      // Scroll to pointer position in scrollbar's track
      this.elements[orientation].scrollbarTrack.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // When scrolling using the custom scrollbar's track, we need to use "fresh" bounding client rects to ensure correct results,
        // as the scrollbar's track & thumb may have their size and position changed without triggering the resize observer,
        // i.e: position after scrolling or size after CSS scale transform
        const scrollbarTrackBoundingBox = this.elements[orientation].scrollbarTrack.getBoundingClientRect();
        const scrollbarThumbBoundingBox = this.elements[orientation].scrollbarThumb.getBoundingClientRect();
        const newScrollbarThumbPosition = event[clientCoordinates[orientation]] - scrollbarTrackBoundingBox[positions[orientation]] - scrollbarThumbBoundingBox[sizes[orientation]] / 2;
        const scrollingRatios = this.scrollbarTrackSize[orientation] / scrollbarTrackBoundingBox[sizes[orientation]];
        const newViewportScollPosition = newScrollbarThumbPosition / this.viewportToScrollbarRatios[orientation] * scrollingRatios;

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
      });

      // Start of scrolling with thumb
      this.elements[orientation].scrollbarThumb.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // When scrolling using the custom scrollbar's thumb, we need to use "fresh" bounding client rects to ensure correct results,
        // as the scrollbar's track may have its size and position changed without triggering the resize observer,
        // i.e: after CSS scale transform
        const scrollbarTrackBoundingBox = this.elements[orientation].scrollbarTrack.getBoundingClientRect();
        this.scrollingWithThumbRatios[orientation] = this.scrollbarTrackSize[orientation] / scrollbarTrackBoundingBox[sizes[orientation]];
        this.scrollingWithThumbOrigin[pageCoordinates[orientation]] = event.touches ? event.touches[0][pageCoordinates[orientation]] : event[pageCoordinates[orientation]];
        this.scrollingWithThumbOrigin[scrollPositions[orientation]] = this.viewport[scrollPositions[orientation]];
        this.isScrollingWithThumb[orientation] = true;

        // Request animation frame to end the event listener early as we don't need it anymore
        // This helps split the DOM reads & DOM writes to improve performance
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty('pointer-events', 'none');
          this.viewport.classList.add(`scrolling-with-${orientation}-thumb`);
          this.elements[orientation].scrollbar.classList.add('scrolling-with-thumb');

          // Gives back the focus to the viewport after clicking the scrollbar's thumb,
          // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
          this.viewport.focus({preventScroll: true});
        });
      });
    }

    // Scrolling with thumb
    document.addEventListener('pointermove', (event) => {
      for (let orientation of orientations) {
        if (this.isScrollingWithThumb[orientation]) {
          const scrollbarThumbOffset = (event.touches ? event.touches[0][pageCoordinates[orientation]] : event[pageCoordinates[orientation]]) - this.scrollingWithThumbOrigin[pageCoordinates[orientation]];
          const viewportScrollOffset = scrollbarThumbOffset / this.viewportToScrollbarRatios[orientation] * this.scrollingWithThumbRatios[orientation];
          const newViewportScrollPosition = this.scrollingWithThumbOrigin[scrollPositions[orientation]] + viewportScrollOffset;
          this.viewport[scrollPositions[orientation]] = newViewportScrollPosition;
          break;
        }
      }
    }, { passive: true });

    // End of scrolling with thumb
    document.addEventListener('pointerup', () => {
      for (let orientation of orientations) {
        if (this.isScrollingWithThumb[orientation]) {
          this.isScrollingWithThumb[orientation] = false;
          document.documentElement.style.removeProperty('pointer-events');
          this.viewport.classList.remove(`scrolling-with-${orientation}-thumb`);
          this.elements[orientation].scrollbar.classList.remove('scrolling-with-thumb');
        }
      }
    }, { passive: true });

    // Show scrollbars when start scrolling with touch gestures
    this.viewport.addEventListener('touchstart', () => {
      this.viewport.classList.add('touch');
    }, { passive: true });

    // Hide scrollbars at the end of scrolling with touch gestures
    this.viewport.addEventListener('touchend', () => {
      this.viewport.classList.remove('touch');
    }, { passive: true });

    // Update scrollbar's thumb position when scrolling
    this.viewport.addEventListener('scroll', () => {
      if (this.animationFrame) {
        return;
      }
      this.animationFrame = requestAnimationFrame(() => {
        this.updateScrollPositions();
        this.animationFrame = null;
      });
    }, { passive: true });

    // Update entire scrollbar when resizing the viewport or the content
    const resizeObserver = new ResizeObserver(() => {
      this.updateCache();
      if (this.animationFrame) {
        return;
      }
      this.animationFrame = requestAnimationFrame(() => {
        this.updateProperties();
        this.updateScrollPositions();
        this.animationFrame = null;
      });
    });
    resizeObserver.observe(this.viewport);
    resizeObserver.observe(this.content);
    for (let orientation of orientations) {
      resizeObserver.observe(this.elements[orientation].scrollbarTrack);
    }
  }

  connectedCallback() {
    this.updateCache();
    this.updateProperties();
    this.updateScrollPositions();
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'scrollbar-visibility') {
      this.viewport.classList.toggle('scrollbar-visible', newValue === 'always');
    }
    else if (attributeName === 'vertical-scrollbar-position') {
      this.elements.vertical.scrollbar.classList.toggle('left-position', newValue === 'left');
    }
    else if (attributeName === 'horizontal-scrollbar-position') {
      this.elements.horizontal.scrollbar.classList.toggle('top-position', newValue === 'top');
    }
  }

  static get observedAttributes() {
    return ['scrollbar-visibility', 'vertical-scrollbar-position', 'horizontal-scrollbar-position'];
  }

  updateCache() {
    // Caches as much as possible to avoid useless repaint/reflow
    const computedStyle = getComputedStyle(this.viewport);
    for (let orientation of orientations) {
      this.restrictContentSize[orientation] = computedStyle.getPropertyValue(overflows[orientation]).trim() === 'hidden';
      this.viewportSize[orientation] = Math.floor(this.viewport[offsetSizes[orientation]] * 10) / 10;
      this.scrollbarTrackSize[orientation] = Math.floor(this.elements[orientation].scrollbarTrack[offsetSizes[orientation]] * 10) / 10;
      this.viewportToScrollbarRatios[orientation] = this.scrollbarTrackSize[orientation] / this.viewport[scrollSizes[orientation]];
      this.isOverflowing[orientation] = !this.restrictContentSize[orientation] && this.viewport[scrollSizes[orientation]] > Math.ceil(this.viewportSize[orientation]);
    }
  }

  updateProperties() {
    for (let orientation of orientations) {
      this.shadowRoot.host.style.setProperty(`--viewport-${sizes[orientation]}`, `${this.viewportSize[orientation]}px`);
      this.content.classList.toggle(`restrict-${sizes[orientation]}`, this.restrictContentSize[orientation]);
      this.elements[orientation].scrollbar.classList.toggle('hidden', !this.isOverflowing[orientation]);
      if (this.isOverflowing[orientation]) {
        const newScrollbarThumbSize = this.viewportSize[orientation] * this.viewportToScrollbarRatios[orientation];
        this.elements[orientation].scrollbarThumb.style[sizes[orientation]] = `${newScrollbarThumbSize}px`;
      }
    }
  }

  updateScrollPositions() {
    for (let orientation of orientations) {
      if (this.isOverflowing[orientation]) {
        const newScrollbarThumbPosition = this.viewport[scrollPositions[orientation]] * this.viewportToScrollbarRatios[orientation];
        this.elements[orientation].scrollbarThumb.style.transform = orientation === 'vertical'
          ? `translate3D(0, ${newScrollbarThumbPosition}px, 0)`
          : `translate3D(${newScrollbarThumbPosition}px, 0, 0)`;
      }
    }
  }

}

window.customElements.define('scrollable-component', ScrollableComponentElement);
