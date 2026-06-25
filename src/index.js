const scrollableComponentTemplate = document.createElement('template');
scrollableComponentTemplate.innerHTML = `<style>{{COMPONENT_CSS}}</style>{{COMPONENT_HTML}}`;

const verticalOrientation = {
  key: 'vertical',
  axis: 'y',
  size: 'height',
  boxSize: 'blockSize',
  position: 'top',
  oppositePosition: 'bottom',
  scrollPosition: 'scrollTop',
  cssOverflow:'overflow-y',
  clientCoordinate: 'clientY',
  pageCoordinate: 'pageY',
};

const horizontalOrientation = {
  key: 'horizontal',
  axis: 'x',
  size: 'width',
  boxSize: 'inlineSize',
  position: 'left',
  oppositePosition: 'right',
  scrollPosition: 'scrollLeft',
  cssOverflow:'overflow-x',
  clientCoordinate: 'clientX',
  pageCoordinate: 'pageX',
};

const scrollbars = [
  { key: 'left', orientation: verticalOrientation },
  { key: 'right', orientation: verticalOrientation },
  { key: 'top', orientation: horizontalOrientation },
  { key: 'bottom', orientation: horizontalOrientation },
];
const orientations = [verticalOrientation, horizontalOrientation];

export class ScrollableComponentElement extends HTMLElement {

  #host;
  #contentWrapper;
  #elements = {};
  #viewportCache = {};
  #scrollbarCache = {};
  #resizeAnimationFrame = null;
  #scrollingAnimationFrame = null;
  #scrollbarOverlay = true;
  #edgeDetection = false;
  #resizeObserver = new ResizeObserver((resizeEntries) => {
    this.#onResizeEvent(resizeEntries);
  });

  static observedAttributes = [
    'scrollbar-overlay',
    'edge-detection',
  ];

  constructor() {
    super();
    this.#initializeFields();
    this.#initializeLayout();
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'scrollbar-overlay') {
      this.#scrollbarOverlay = newValue !== 'false';
      this.#update();
    }
    else if (attributeName === 'edge-detection') {
      this.#edgeDetection = newValue === 'true';
      this.#update();
    }
  }

  connectedCallback() {
    this.#initializeEventListeners();
  }

  disconnectedCallback() {
    this.#resizeObserver.disconnect();
  }

  #initializeFields() {
    for (let orientation of orientations) {
      this.#viewportCache[orientation.key] = {
        isScrolling: false,
        isOverflowing: false,
        overflowHidden: false,
        size: 0,
        scrollSize: 0,
        scrollPosition: 0,
        maxScrollPosition: 0,
        scrollOrigin: {
          pageCoordinate: 0,
          scrollPosition: 0,
        },
      };
    }
    for (let scrollbar of scrollbars) {
      this.#elements[scrollbar.key] = {
        scrollbar: null,
        scrollbarTrack: null,
        scrollbarThumb: null,
      };
      this.#scrollbarCache[scrollbar.key] = {
        trackSize: 0,
        viewportToTrackRatio: 1,
        scrollingRatio: 1,
      };
    }
  }

  #initializeLayout() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(scrollableComponentTemplate.content.cloneNode(true));
    this.#host = this.shadowRoot.host;
    this.#contentWrapper = this.shadowRoot.querySelector('.content-wrapper');
    const scrollbarWrapper = this.shadowRoot.querySelector('.scrollbar-wrapper');
    for (let scrollbar of scrollbars) {
      const elements = this.#elements[scrollbar.key];
      elements.scrollbar = scrollbarWrapper.querySelector(`.${scrollbar.key}-scrollbar`);
      elements.scrollbarTrack = elements.scrollbar.firstElementChild;
      elements.scrollbarThumb = elements.scrollbarTrack.firstElementChild;
    }
  }

  #initializeEventListeners() {
    // Update all scrollbars when resizing the viewport or the content
    this.#resizeObserver.observe(this.#host, { box: 'content-box' });
    this.#resizeObserver.observe(this.#contentWrapper, { box: 'border-box' });

    for (let scrollbar of scrollbars) {
      // Update the scrollbar when resizing the scrollbar's track
      const elements = this.#elements[scrollbar.key];
      this.#resizeObserver.observe(elements.scrollbarTrack, { box: 'content-box' });

      // Scroll to pointer position in scrollbar's track
      elements.scrollbarTrack.addEventListener('pointerdown', (event) => {
        // Prevent default to not lose the focus on the active element
        event.preventDefault();
        this.#onScrollWithTrack(scrollbar, event);
      });

      // Start of scrolling with thumb
      elements.scrollbarThumb.addEventListener('pointerdown', (event) => {
        // Prevent default to not lose the focus on the active element
        event.preventDefault();
        // Stop the propagation so the event does not get triggered on the scrollbar's track
        event.stopPropagation();
        elements.scrollbarThumb.setPointerCapture(event.pointerId);
        this.#onScrollWithThumbStart(scrollbar, event);
      });

      // Scrolling with thumb
      elements.scrollbarThumb.addEventListener('pointermove', (event) => {
        this.#onScrollWithThumbMove(scrollbar, event);
      }, { passive: true });

      // End of scrolling with thumb
      elements.scrollbarThumb.addEventListener('pointerup', (event) => {
        elements.scrollbarThumb.releasePointerCapture(event.pointerId);
        this.#onScrollWithThumbEnd(scrollbar);
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

  #onScrollWithTrack(scrollbar, event) {
    const scrollbarCache = this.#scrollbarCache[scrollbar.key];
    const elements = this.#elements[scrollbar.key];

    // When scrolling using the custom scrollbar's track, we need to use "fresh" bounding client rects to ensure correct results,
    // as the scrollbar's track & thumb may have their size and position changed without triggering the resize observer,
    // i.e: position after scrolling or size after CSS scale transform
    const scrollbarTrackBoundingBox = elements.scrollbarTrack.getBoundingClientRect();
    const scrollbarThumbBoundingBox = elements.scrollbarThumb.getBoundingClientRect();
    const newScrollbarThumbPosition = event[scrollbar.orientation.clientCoordinate] - scrollbarTrackBoundingBox[scrollbar.orientation.position] - scrollbarThumbBoundingBox[scrollbar.orientation.size] / 2;
    const scrollingRatio = scrollbarCache.trackSize / scrollbarTrackBoundingBox[scrollbar.orientation.size];
    const newViewportScrollPosition = newScrollbarThumbPosition / scrollbarCache.viewportToTrackRatio * scrollingRatio;

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      this.#host.scrollTo({
        [scrollbar.orientation.position]: newViewportScrollPosition,
        behavior: 'smooth',
      });
    });
  }

  #onScrollWithThumbStart(scrollbar, event) {
    const viewportCache = this.#viewportCache[scrollbar.orientation.key];
    if (viewportCache.isScrolling) {
      return;
    }

    const scrollbarCache = this.#scrollbarCache[scrollbar.key];
    const elements = this.#elements[scrollbar.key];

    // When scrolling using the custom scrollbar's thumb, we need to use "fresh" bounding client rects to ensure correct results,
    // as the scrollbar's track may have its size and position changed without triggering the resize observer,
    // i.e: after CSS scale transform
    const scrollbarTrackBoundingBox = elements.scrollbarTrack.getBoundingClientRect();
    scrollbarCache.scrollingRatio = scrollbarCache.trackSize / scrollbarTrackBoundingBox[scrollbar.orientation.size];

    viewportCache.isScrolling = true;
    viewportCache.scrollOrigin.pageCoordinate = event.touches ? event.touches[0][scrollbar.orientation.pageCoordinate] : event[scrollbar.orientation.pageCoordinate];
    viewportCache.scrollOrigin.scrollPosition = this.#host[scrollbar.orientation.scrollPosition];

    // Request animation frame to end the event listener early as we don't need it anymore
    // This helps split the DOM reads & DOM writes to improve performance
    requestAnimationFrame(() => {
      elements.scrollbarThumb.part.add('active');
      elements.scrollbarThumb.classList.add('active');
    });
  }

  #onScrollWithThumbMove(scrollbar, event) {
    const viewportCache = this.#viewportCache[scrollbar.orientation.key];
    if (!viewportCache.isScrolling) {
      return;
    }

    const scrollbarCache = this.#scrollbarCache[scrollbar.key];
    const eventPageCoordinate = event.touches ? event.touches[0][scrollbar.orientation.pageCoordinate] : event[scrollbar.orientation.pageCoordinate];
    const scrollbarThumbOffset = eventPageCoordinate - viewportCache.scrollOrigin.pageCoordinate;
    const viewportScrollOffset = scrollbarThumbOffset / scrollbarCache.viewportToTrackRatio * scrollbarCache.scrollingRatio;
    const newViewportScrollPosition = viewportCache.scrollOrigin.scrollPosition + viewportScrollOffset;

    // Constrain the new scroll position so that you don't get out of the viewport
    this.#host[scrollbar.orientation.scrollPosition] = newViewportScrollPosition;
  }

  #onScrollWithThumbEnd(scrollbar) {
    const viewportCache = this.#viewportCache[scrollbar.orientation.key];
    if (!viewportCache.isScrolling) {
      return;
    }

    viewportCache.isScrolling = false;
    const elements = this.#elements[scrollbar.key];
    elements.scrollbarThumb.part.remove('active');
    elements.scrollbarThumb.classList.remove('active');
  }

  #onTouchStart() {
    this.#host.setAttribute('touched');
  }

  #onTouchEnd() {
    this.#host.removeAttribute('touched');
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
    resizeEntries.forEach((resizeEntry) => {
      const contentBox = resizeEntry.contentBoxSize[0];
      const borderBox = resizeEntry.borderBoxSize[0];
      for (let orientation of orientations) {
        if (resizeEntry.target === this.#host) {
          this.#viewportCache[orientation.key].size = contentBox[orientation.boxSize];
        }
        else if (resizeEntry.target === this.#contentWrapper) {
          this.#viewportCache[orientation.key].scrollSize = borderBox[orientation.boxSize];
        }
      }
      for (let scrollbar of scrollbars) {
        if (resizeEntry.target === this.#elements[scrollbar.key].scrollbarTrack) {
          this.#scrollbarCache[scrollbar.key].trackSize = contentBox[scrollbar.orientation.boxSize];
        }
      }
    });
    this.#update();
  }

  #update() {
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
      const viewportCache = this.#viewportCache[orientation.key];
      viewportCache.overflowHidden = computedStyle.getPropertyValue(orientation.cssOverflow).trim() === 'hidden';
      viewportCache.isOverflowing = !viewportCache.overflowHidden && viewportCache.scrollSize > viewportCache.size;
      viewportCache.maxScrollPosition = viewportCache.scrollSize - viewportCache.size;
    }
    for (let scrollbar of scrollbars) {
      const scrollbarCache = this.#scrollbarCache[scrollbar.key];
      const viewportCache = this.#viewportCache[scrollbar.orientation.key];
      scrollbarCache.viewportToTrackRatio = scrollbarCache.trackSize / viewportCache.scrollSize;
    }
  }

  #updateScrollPositionsCache() {
    // Cache as much as possible to avoid useless repaint/reflow
    for (let orientation of orientations) {
      this.#viewportCache[orientation.key].scrollPosition = this.#host[orientation.scrollPosition];
    }
  }

  #updateLayout() {
    // Host properties
    for (let orientation of orientations) {
      const viewportCache = this.#viewportCache[orientation.key];
      this.#host.style.setProperty(`--viewport-${orientation.size}`, `${viewportCache.size}px`);
      this.#host.toggleAttribute(`${orientation.cssOverflow}-hidden`, viewportCache.overflowHidden);
      this.#host.toggleAttribute(`${orientation.key}-overflow`, !this.#scrollbarOverlay && viewportCache.isOverflowing);

      // Constrain the scroll position so that you don't get out of the viewport after it has been decreased
      const constrainedScrollPosition = Math.max(0, Math.min(viewportCache.scrollPosition, viewportCache.maxScrollPosition));
      if (viewportCache.scrollPosition !== constrainedScrollPosition) {
        viewportCache.scrollPosition = constrainedScrollPosition;
        this.#host[orientation.scrollPosition] = viewportCache.scrollPosition;
      }
    }

    // Scrollbar properties
    for (let scrollbar of scrollbars) {
      const scrollbarCache = this.#scrollbarCache[scrollbar.key];
      const viewportCache = this.#viewportCache[scrollbar.orientation.key];
      const elements = this.#elements[scrollbar.key];
      elements.scrollbar.classList.toggle('hidden', !viewportCache.isOverflowing);
      if (viewportCache.isOverflowing) {
        const newScrollbarThumbSize = viewportCache.size * scrollbarCache.viewportToTrackRatio;
        elements.scrollbarThumb.style.setProperty(`--${scrollbar.orientation.size}`, `${newScrollbarThumbSize}px`);
      }
    }
  }

  #updateScrollPositions() {
    // Host properties
    for (let orientation of orientations) {
      const viewportCache = this.#viewportCache[orientation.key];
      if (viewportCache.isOverflowing) {
        this.#host.toggleAttribute(`${orientation.position}-overflow`, this.#edgeDetection && viewportCache.scrollPosition > 1);
        this.#host.toggleAttribute(`${orientation.oppositePosition}-overflow`, this.#edgeDetection && (viewportCache.maxScrollPosition - viewportCache.scrollPosition) > 1);
      }
    }

    // Scrollbar properties
    for (let scrollbar of scrollbars) {
      const scrollbarCache = this.#scrollbarCache[scrollbar.key];
      const viewportCache = this.#viewportCache[scrollbar.orientation.key];
      const newScrollbarThumbPosition = viewportCache.scrollPosition * scrollbarCache.viewportToTrackRatio;
      this.#elements[scrollbar.key].scrollbarThumb.style.setProperty(`--translate-${scrollbar.orientation.axis}`, `${newScrollbarThumbPosition}px`);
    }
  }

}

const defaultTag = 'scrollable-component';

export function defineScrollableComponent() {
  window.customElements.define(defaultTag, ScrollableComponentElement);
}

export function isScrollableComponentDefined() {
  return !!window.customElements.get(defaultTag);
}

export function whenScrollableComponentDefined() {
  return window.customElements.whenDefined(defaultTag);
}
