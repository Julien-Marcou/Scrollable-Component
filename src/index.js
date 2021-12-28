const scrollableComponentTemplate = document.createElement('template');
scrollableComponentTemplate.innerHTML = `<style>{{COMPONENT_CSS}}</style>{{COMPONENT_HTML}}`;

const vertical = Symbol('vertical');
const horizontal = Symbol('horizontal');
const orientations = [
  {
    key: vertical,
    name: 'vertical',
    size: 'height',
    offsetSize: 'offsetHeight',
    scrollSize: 'scrollHeight',
    position: 'top',
    scrollPosition: 'scrollTop',
    cssOverflow:'overflow-y',
    clientCoordinate: 'clientY',
    pageCoordinate: 'pageY',
  },
  {
    key: horizontal,
    name: 'horizontal',
    size: 'width',
    offsetSize: 'offsetWidth',
    scrollSize: 'scrollWidth',
    position: 'left',
    scrollPosition: 'scrollLeft',
    cssOverflow:'overflow-x',
    clientCoordinate: 'clientX',
    pageCoordinate: 'pageX',
  },
];

export class ScrollableComponentElement extends HTMLElement {

  viewport;
  content;
  #elements = {};
  #cache = {};
  #scrollbarThumb = {};
  #scrollingAnimationFrame = null;

  constructor() {
    super();
    this.#initializeFields();
    this.#initializeLayout();
    this.#initializeEventListeners();
  }

  #initializeFields() {
    for (let orientation of orientations) {
      this.#elements[orientation.key] = {
        scrollbar: null,
        scrollbarTrack: null,
        scrollbarThumb: null,
      };
      this.#cache[orientation.key] = {
        isOverflowing: false,
        restrictContentSize: false,
        viewportSize: 0,
        scrollbarTrackSize: 0,
        viewportToScrollbarRatio: 1,
      };
      this.#scrollbarThumb[orientation.key] = {
        isScrolling: true,
        scrollingRatio: 1,
        scrollingOrigin: {
          pageCoordinate: 0,
          scrollPosition: 0,
        },
      };
    }
  }

  #initializeLayout() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(scrollableComponentTemplate.content.cloneNode(true));
    this.viewport = this.shadowRoot.querySelector('.viewport');
    this.content = this.viewport.querySelector('.content');
    for (let orientation of orientations) {
      const elements = this.#elements[orientation.key];
      elements.scrollbar = this.shadowRoot.querySelector(`.${orientation.name}-scrollbar`);
      elements.scrollbarTrack = elements.scrollbar.querySelector('.scrollbar-track');
      elements.scrollbarThumb = elements.scrollbarTrack.querySelector('.scrollbar-thumb');
    }
  }

  #initializeEventListeners() {
    // Update entire scrollbar when resizing the viewport or the content
    const resizeObserver = new ResizeObserver(() => {
      this.#onResizeEvent();
    });
    resizeObserver.observe(this.viewport);
    resizeObserver.observe(this.content);

    for (let orientation of orientations) {
      // Update entire scrollbar when resizing the scrollbar's track
      const elements = this.#elements[orientation.key];
      resizeObserver.observe(elements.scrollbarTrack);

      // Scroll to pointer position in scrollbar's track
      elements.scrollbarTrack.addEventListener('pointerdown', (event) => {
        // Prevent default to avoid drag&drop
        event.preventDefault();
        event.stopPropagation();
        this.#onScrollWithTrack(orientation, event);
      });

      // Scrolling with thumb
      const onScrollWithThumbMove = (event) => {
        this.#onScrollWithThumbMove(orientation, event);
      };

      // Start of scrolling with thumb
      elements.scrollbarThumb.addEventListener('pointerdown', (event) => {
        // Prevent default to avoid drag&drop
        event.preventDefault();
        event.stopPropagation();
        elements.scrollbarThumb.addEventListener('pointermove', onScrollWithThumbMove, { passive: true });
        elements.scrollbarThumb.setPointerCapture(event.pointerId);
        this.#onScrollWithThumbStart(orientation, event);
      });

      // End of scrolling with thumb
      elements.scrollbarThumb.addEventListener('pointerup', (event) => {
        elements.scrollbarThumb.removeEventListener('pointermove', onScrollWithThumbMove, { passive: true });
        elements.scrollbarThumb.releasePointerCapture(event.pointerId);
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
  }

  #onScrollWithTrack(orientation, event) {
    const elements = this.#elements[orientation.key];
    const cache = this.#cache[orientation.key];

    // When scrolling using the custom scrollbar's track, we need to use "fresh" bounding client rects to ensure correct results,
    // as the scrollbar's track & thumb may have their size and position changed without triggering the resize observer,
    // i.e: position after scrolling or size after CSS scale transform
    const scrollbarTrackBoundingBox = elements.scrollbarTrack.getBoundingClientRect();
    const scrollbarThumbBoundingBox = elements.scrollbarThumb.getBoundingClientRect();
    const newScrollbarThumbPosition = event[orientation.clientCoordinate] - scrollbarTrackBoundingBox[orientation.position] - scrollbarThumbBoundingBox[orientation.size] / 2;
    const scrollingRatio = cache.scrollbarTrackSize / scrollbarTrackBoundingBox[orientation.size];
    const newViewportScollPosition = newScrollbarThumbPosition / cache.viewportToScrollbarRatio * scrollingRatio;

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.viewport.scrollTo({
        [orientation.position]: newViewportScollPosition,
        behavior: 'smooth',
      });

      // Gives back the focus to the viewport after clicking the scrollbar's track,
      // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
      this.viewport.focus({ preventScroll: true });
    });
  }

  #onScrollWithThumbStart(orientation, event) {
    const elements = this.#elements[orientation.key];
    const scrollbarThumb = this.#scrollbarThumb[orientation.key];

    // When scrolling using the custom scrollbar's thumb, we need to use "fresh" bounding client rects to ensure correct results,
    // as the scrollbar's track may have its size and position changed without triggering the resize observer,
    // i.e: after CSS scale transform
    const scrollbarTrackBoundingBox = elements.scrollbarTrack.getBoundingClientRect();
    scrollbarThumb.isScrolling = true;
    scrollbarThumb.scrollingRatio = this.#cache[orientation.key].scrollbarTrackSize / scrollbarTrackBoundingBox[orientation.size];
    scrollbarThumb.scrollingOrigin.pageCoordinate = event.touches ? event.touches[0][orientation.pageCoordinate] : event[orientation.pageCoordinate];
    scrollbarThumb.scrollingOrigin.scrollPosition = this.viewport[orientation.scrollPosition];

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.viewport.classList.add(`scrolling-with-${orientation.name}-thumb`);
      elements.scrollbar.classList.add('scrolling-with-thumb');

      // Gives back the focus to the viewport after clicking the scrollbar's thumb,
      // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
      this.viewport.focus({ preventScroll: true });
    });
  }

  #onScrollWithThumbMove(orientation, event) {
    const scrollbarThumb = this.#scrollbarThumb[orientation.key];
    if (scrollbarThumb.isScrolling) {
      const eventPageCoordinate = event.touches ? event.touches[0][orientation.pageCoordinate] : event[orientation.pageCoordinate];
      const scrollbarThumbOffset = eventPageCoordinate - scrollbarThumb.scrollingOrigin.pageCoordinate;
      const viewportScrollOffset = scrollbarThumbOffset / this.#cache[orientation.key].viewportToScrollbarRatio * scrollbarThumb.scrollingRatio;
      const newViewportScrollPosition = scrollbarThumb.scrollingOrigin.scrollPosition + viewportScrollOffset;
      this.viewport[orientation.scrollPosition] = newViewportScrollPosition;
    }
  }

  #onScrollWithThumbEnd(orientation) {
    const scrollbarThumb = this.#scrollbarThumb[orientation.key];
    if (scrollbarThumb.isScrolling) {
      scrollbarThumb.isScrolling = false;
      this.viewport.classList.remove(`scrolling-with-${orientation.name}-thumb`);
      this.#elements[orientation.key].scrollbar.classList.remove('scrolling-with-thumb');
    }
  }

  #onTouchStart() {
    this.viewport.classList.add('touch');
  }

  #onTouchEnd() {
    this.viewport.classList.remove('touch');
  }

  #onScrollEvent() {
    if (this.#scrollingAnimationFrame !== null) {
      return;
    }
    this.#scrollingAnimationFrame = requestAnimationFrame(() => {
      this.#updateScrollPositions();
      this.#scrollingAnimationFrame = null;
    });
  }

  #onResizeEvent() {
    this.#updateCache();
    if (this.#scrollingAnimationFrame !== null) {
      return;
    }
    this.#scrollingAnimationFrame = requestAnimationFrame(() => {
      this.#updateProperties();
      this.#updateScrollPositions();
      this.#scrollingAnimationFrame = null;
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
      this.#elements[vertical].scrollbar.classList.toggle('left-position', newValue === 'left');
    }
    else if (attributeName === 'horizontal-scrollbar-position') {
      this.#elements[horizontal].scrollbar.classList.toggle('top-position', newValue === 'top');
    }
  }

  static get observedAttributes() {
    return ['scrollbar-visibility', 'vertical-scrollbar-position', 'horizontal-scrollbar-position'];
  }

  #updateCache() {
    // Caches as much as possible to avoid useless repaint/reflow
    const computedStyle = getComputedStyle(this.viewport);
    for (let orientation of orientations) {
      const cache = this.#cache[orientation.key];
      cache.restrictContentSize = computedStyle.getPropertyValue(orientation.cssOverflow).trim() === 'hidden';
      cache.viewportSize = Math.floor(this.viewport[orientation.offsetSize] * 10) / 10;
      cache.scrollbarTrackSize = Math.floor(this.#elements[orientation.key].scrollbarTrack[orientation.offsetSize] * 10) / 10;
      cache.viewportToScrollbarRatio = cache.scrollbarTrackSize / this.viewport[orientation.scrollSize];
      cache.isOverflowing = !cache.restrictContentSize && this.viewport[orientation.scrollSize] > Math.ceil(cache.viewportSize);
    }
  }

  #updateProperties() {
    for (let orientation of orientations) {
      const elements = this.#elements[orientation.key];
      const cache = this.#cache[orientation.key];
      this.shadowRoot.host.style.setProperty(`--viewport-${orientation.size}`, `${cache.viewportSize}px`);
      this.content.classList.toggle(`restrict-${orientation.size}`, cache.restrictContentSize);
      elements.scrollbar.classList.toggle('hidden', !cache.isOverflowing);
      if (cache.isOverflowing) {
        const newScrollbarThumbSize = cache.viewportSize * cache.viewportToScrollbarRatio;
        elements.scrollbarThumb.style[orientation.size] = `${newScrollbarThumbSize}px`;
      }
    }
  }

  #updateScrollPositions() {
    for (let orientation of orientations) {
      const cache = this.#cache[orientation.key];
      if (cache.isOverflowing) {
        const newScrollbarThumbPosition = this.viewport[orientation.scrollPosition] * cache.viewportToScrollbarRatio;
        this.#elements[orientation.key].scrollbarThumb.style.transform = orientation.key === vertical
          ? `translate3D(0, ${newScrollbarThumbPosition}px, 0)`
          : `translate3D(${newScrollbarThumbPosition}px, 0, 0)`;
      }
    }
  }

}

window.customElements.define('scrollable-component', ScrollableComponentElement);
