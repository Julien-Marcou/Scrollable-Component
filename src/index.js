const scrollableComponentTemplate = document.createElement('template');
scrollableComponentTemplate.innerHTML = `<style>{{COMPONENT_CSS}}</style>{{COMPONENT_HTML}}`;

const vertical = Symbol('vertical');
const horizontal = Symbol('horizontal');
const orientations = [
  {
    key: vertical,
    name: 'vertical',
    size: 'height',
    position: 'top',
    oppositePosition: 'bottom',
    scrollPosition: 'scrollTop',
    cssOverflow:'overflow-y',
    clientCoordinate: 'clientY',
    pageCoordinate: 'pageY',
  },
  {
    key: horizontal,
    name: 'horizontal',
    size: 'width',
    position: 'left',
    oppositePosition: 'right',
    scrollPosition: 'scrollLeft',
    cssOverflow:'overflow-x',
    clientCoordinate: 'clientX',
    pageCoordinate: 'pageX',
  },
];

export class ScrollableComponentElement extends HTMLElement {

  #host;
  #contentWrapper;
  #elements = {};
  #cache = {};
  #scrollbarThumb = {};
  #resizeAnimationFrame = null;
  #scrollingAnimationFrame = null;
  #scrollbarOverlay = true;
  #edgeDetection = false;

  constructor() {
    super();
    this.#initializeFields();
    this.#initializeLayout();
  }

  static get observedAttributes() {
    return [
      'scrollbar-overlay',
      'edge-detection',
    ];
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'scrollbar-overlay') {
      this.#scrollbarOverlay = newValue !== 'false';
    }
    else if (attributeName === 'edge-detection') {
      this.#edgeDetection = newValue === 'true';
    }
  }

  connectedCallback() {
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
        overflowHidden: false,
        viewportSize: 0,
        viewportScrollSize: 0,
        scrollbarTrackSize: 0,
        viewportToScrollbarRatio: 1,
        scrollPosition: 0,
        maxScrollPosition: 0,
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
    this.#host = this.shadowRoot.host;
    this.#contentWrapper = this.shadowRoot.querySelector('.content-wrapper');
    for (let orientation of orientations) {
      const elements = this.#elements[orientation.key];
      const scrollbarWrapper = this.shadowRoot.querySelector(`.${orientation.name}-scrollbar-wrapper`);
      elements.scrollbar = scrollbarWrapper.firstElementChild;
      elements.scrollbarTrack = elements.scrollbar.firstElementChild;
      elements.scrollbarThumb = elements.scrollbarTrack.firstElementChild;
    }
  }

  #initializeEventListeners() {
    // Update entire scrollbar when resizing the viewport or the content
    const resizeObserver = new ResizeObserver((resizeEntries) => {
      this.#onResizeEvent(resizeEntries);
    });
    resizeObserver.observe(this.#host, { box: 'content-box' });
    resizeObserver.observe(this.#contentWrapper, { box: 'border-box' });

    for (let orientation of orientations) {
      // Update entire scrollbar when resizing the scrollbar's track
      const elements = this.#elements[orientation.key];
      resizeObserver.observe(elements.scrollbarTrack, { box: 'content-box' });

      // Scroll to pointer position in scrollbar's track
      elements.scrollbarTrack.addEventListener('pointerdown', (event) => {
        // Prevent default to not lose the focus on the active element
        event.preventDefault();
        this.#onScrollWithTrack(orientation, event);
      });

      // Scrolling with thumb
      const onScrollWithThumbMove = (event) => {
        this.#onScrollWithThumbMove(orientation, event);
      };

      // Start of scrolling with thumb
      elements.scrollbarThumb.addEventListener('pointerdown', (event) => {
        // Prevent default to not lose the focus on the active element
        event.preventDefault();
        // Stop the propagation so the event does not get triggered on the scrollbar's track
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
    this.#host.addEventListener('scroll', () => {
      this.#onScrollEvent();
    }, { passive: true });

    // Show scrollbars when start scrolling with touch gestures
    this.#host.addEventListener('touchstart', () => {
      this.#onTouchStart();
    }, { passive: true });

    // Hide scrollbars at the end of scrolling with touch gestures
    this.#host.addEventListener('touchend', () => {
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
    const newViewportScrollPosition = newScrollbarThumbPosition / cache.viewportToScrollbarRatio * scrollingRatio;

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.#host.scrollTo({
        [orientation.position]: newViewportScrollPosition,
        behavior: 'smooth',
      });
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
    scrollbarThumb.scrollingOrigin.scrollPosition = this.#host[orientation.scrollPosition];

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.#elements[orientation.key].scrollbarThumb.part.add('active');
      this.#elements[orientation.key].scrollbarThumb.classList.add('active');
    });
  }

  #onScrollWithThumbMove(orientation, event) {
    const scrollbarThumb = this.#scrollbarThumb[orientation.key];
    if (scrollbarThumb.isScrolling) {
      const cache = this.#cache[orientation.key];
      const eventPageCoordinate = event.touches ? event.touches[0][orientation.pageCoordinate] : event[orientation.pageCoordinate];
      const scrollbarThumbOffset = eventPageCoordinate - scrollbarThumb.scrollingOrigin.pageCoordinate;
      const viewportScrollOffset = scrollbarThumbOffset / cache.viewportToScrollbarRatio * scrollbarThumb.scrollingRatio;
      const newViewportScrollPosition = scrollbarThumb.scrollingOrigin.scrollPosition + viewportScrollOffset;
      // Constrain the new scroll position so that you don't get out of the viewport
      this.#host[orientation.scrollPosition] = newViewportScrollPosition;
    }
  }

  #onScrollWithThumbEnd(orientation) {
    const scrollbarThumb = this.#scrollbarThumb[orientation.key];
    if (scrollbarThumb.isScrolling) {
      scrollbarThumb.isScrolling = false;
      this.#elements[orientation.key].scrollbarThumb.part.remove('active');
      this.#elements[orientation.key].scrollbarThumb.classList.remove('active');
    }
  }

  #onTouchStart() {
    this.#host.classList.add('touch');
  }

  #onTouchEnd() {
    this.#host.classList.remove('touch');
  }

  #onScrollEvent() {
    this.#updateScrollPositionsCache();
    if (this.#scrollingAnimationFrame !== null) {
      return;
    }
    this.#scrollingAnimationFrame = requestAnimationFrame(() => {
      this.#updateScrollPositions();
      this.#scrollingAnimationFrame = null;
    });
  }

  #onResizeEvent(resizeEntries) {
    for (let orientation of orientations) {
      const cache = this.#cache[orientation.key];
      resizeEntries.forEach((resizeEntry) => {
        const size = resizeEntry.contentRect[orientation.size];
        if (resizeEntry.target === this.#host) {
          // TODO once this is supported by Safari
          // use the #host's contentBoxSize insteand of the #host's contentRect
          // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize
          cache.viewportSize = size;
        }
        else if (resizeEntry.target === this.#contentWrapper) {
          // TODO once this is supported by Safari
          // use the #content's borderBoxSize instead of the #contentWrapper's contentRect
          // then the #contentWrapper won't be needed anymore
          // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/borderBoxSize
          cache.viewportScrollSize = size;
        }
        else if (resizeEntry.target === this.#elements[orientation.key].scrollbarTrack) {
          // TODO once this is supported by Safari
          // use the #scrollbarTrack's contentBoxSize insteand of the #scrollbarTrack's contentRect
          // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize
          cache.scrollbarTrackSize = size;
        }
      });
    }
    this.#updateLayoutCache();
    this.#updateScrollPositionsCache();
    if (this.#resizeAnimationFrame !== null) {
      return;
    }
    this.#resizeAnimationFrame = requestAnimationFrame(() => {
      this.#updateLayout();
      this.#updateScrollPositions();
      this.#resizeAnimationFrame = null;
    });
  }

  #updateLayoutCache() {
    // Cache as much as possible to avoid useless repaint/reflow
    const computedStyle = getComputedStyle(this.#host);
    for (let orientation of orientations) {
      const cache = this.#cache[orientation.key];
      cache.overflowHidden = computedStyle.getPropertyValue(orientation.cssOverflow).trim() === 'hidden';
      cache.viewportToScrollbarRatio = cache.scrollbarTrackSize / cache.viewportScrollSize;
      cache.isOverflowing = !cache.overflowHidden && cache.viewportScrollSize > cache.viewportSize;
      cache.maxScrollPosition = cache.viewportScrollSize - cache.viewportSize;
    }
  }

  #updateScrollPositionsCache() {
    // Cache as much as possible to avoid useless repaint/reflow
    for (let orientation of orientations) {
      this.#cache[orientation.key].scrollPosition = this.#host[orientation.scrollPosition];
    }
  }

  #updateLayout() {
    for (let orientation of orientations) {
      const cache = this.#cache[orientation.key];

      // Host properties
      this.#host.style.setProperty(`--viewport-${orientation.size}`, `${cache.viewportSize}px`);
      this.#host.classList.toggle(`${orientation.cssOverflow}-hidden`, cache.overflowHidden);
      this.#host.classList.toggle(`${orientation.name}-overflow`, !this.#scrollbarOverlay && cache.isOverflowing);

      // Scrollbar properties
      const elements = this.#elements[orientation.key];
      elements.scrollbar.classList.toggle('hidden', !cache.isOverflowing);
      if (cache.isOverflowing) {
        const newScrollbarThumbSize = cache.viewportSize * cache.viewportToScrollbarRatio;
        elements.scrollbarThumb.style[orientation.size] = `${newScrollbarThumbSize}px`;

        // Constrain the scroll position so that you don't get out of the viewport after it has been decreased
        const constrainedScrollPosition = Math.max(0, Math.min(cache.scrollPosition, cache.maxScrollPosition));
        if (cache.scrollPosition !== constrainedScrollPosition) {
          cache.scrollPosition = constrainedScrollPosition;
          this.#host[orientation.scrollPosition] = cache.scrollPosition;
        }
      }
    }
  }

  #updateScrollPositions() {
    for (let orientation of orientations) {
      const cache = this.#cache[orientation.key];
      if (cache.isOverflowing) {
        // Host properties
        this.#host.classList.toggle(`${orientation.position}-overflow`, this.#edgeDetection && cache.scrollPosition > 1);
        this.#host.classList.toggle(`${orientation.oppositePosition}-overflow`, this.#edgeDetection && (cache.maxScrollPosition - cache.scrollPosition) > 1);

        // Scrollbar properties
        const newScrollbarThumbPosition = cache.scrollPosition * cache.viewportToScrollbarRatio;
        this.#elements[orientation.key].scrollbarThumb.style.transform = orientation.key === vertical
          ? `translate3D(0, ${newScrollbarThumbPosition}px, 0)`
          : `translate3D(${newScrollbarThumbPosition}px, 0, 0)`;
      }
    }
  }

}

window.customElements.define('scrollable-component', ScrollableComponentElement);
