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

    /* Scrollbar */
    .scrollbar {
      pointer-events: all;
      user-select: none;
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
const spacings = {
  vertical: 'top',
  horizontal: 'left',
};
const scrollSizes = {
  vertical: 'scrollHeight',
  horizontal: 'scrollWidth',
}
const scrollSpacings = {
  vertical: 'scrollTop',
  horizontal: 'scrollLeft',
}
const overflows = {
  vertical: 'overflow-y',
  horizontal: 'overflow-x',
};
const clients = {
  vertical: 'clientY',
  horizontal: 'clientX',
};
const pages = {
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
    this.boundingBoxes = {
      viewport: null,
      vertical: {
        scrollbarTrack: null,
      },
      horizontal: {
        scrollbarTrack: null,
      },
    };
    this.restrictContentSize = {
      vertical: false,
      horizontal: false,
    };
    this.sizes = {
      vertical: {
        viewport: 0,
        scroll: 0,
        scrollbarTrack: 0,
      },
      horizontal: {
        viewport: 0,
        scroll: 0,
        scrollbarTrack: 0,
      },
    };
    this.ratios = {
      vertical: 1,
      horizontal: 1,
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
    this.animationFrame = null;

    for (let orientation of orientations) {
      this.elements[orientation].scrollbar = this.shadowRoot.querySelector(`.${[orientation]}-scrollbar`);
      this.elements[orientation].scrollbarTrack = this.elements[orientation].scrollbar.querySelector('.scrollbar-track');
      this.elements[orientation].scrollbarThumb = this.elements[orientation].scrollbarTrack.querySelector('.scrollbar-thumb');

      // Scroll to mouse position in scrollbar's track
      this.elements[orientation].scrollbarTrack.addEventListener('mousedown', (event) => {
        this.boundingBoxes[orientation].scrollbarTrack = this.elements[orientation].scrollbarTrack.getBoundingClientRect();
        this.viewport.scrollTo({
          [spacings[orientation]]: (event[clients[orientation]] - this.boundingBoxes[orientation].scrollbarTrack[spacings[orientation]] - this.sizes[orientation].scrollbarThumb / 2) * this.ratios[orientation],
          behavior: 'smooth',
        });
      }, { passive: true });

      // Gives back the focus to the viewport after clicking the scrollbar,
      // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
      this.elements[orientation].scrollbar.addEventListener('click', () => {
        this.viewport.focus();
      }, { passive: true });

      // Start of scrolling with thumb
      this.elements[orientation].scrollbarThumb.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        document.body.style.setProperty('pointer-events', 'none');
        this.isScrollingWithThumb[orientation] = true;
        this.viewport.classList.add(`scrolling-with-${orientation}-thumb`);
        this.elements[orientation].scrollbar.classList.add('scrolling-with-thumb');
        for (let orientation of orientations) {
          this.scrollingWithThumbOrigin[pages[orientation]] = event.touches ? event.touches[0][pages[orientation]] : event[pages[orientation]];
          this.scrollingWithThumbOrigin[scrollSpacings[orientation]] = this.viewport[scrollSpacings[orientation]];
        }
      }, { passive: true });
    }

    // Scrolling with thumb
    document.addEventListener('mousemove', (event) => {
      for (let orientation of orientations) {
        if (this.isScrollingWithThumb[orientation]) {
          const scrollbarThumbOffset = (event.touches ? event.touches[0][pages[orientation]] : event[pages[orientation]]) - this.scrollingWithThumbOrigin[pages[orientation]];
          this.viewport[scrollSpacings[orientation]] = this.scrollingWithThumbOrigin[scrollSpacings[orientation]] + scrollbarThumbOffset * this.ratios[orientation];
          break;
        }
      }
    }, { passive: true });

    // End of scrolling with thumb
    document.addEventListener('mouseup', () => {
      for (let orientation of orientations) {
        if (this.isScrollingWithThumb[orientation]) {
          document.body.style.removeProperty('pointer-events');
          this.isScrollingWithThumb[orientation] = false;
          this.viewport.classList.remove(`scrolling-with-${orientation}-thumb`);
          this.elements[orientation].scrollbar.classList.remove('scrolling-with-thumb');
          // Gives back the focus to the viewport after clicking the scrollbar's thumb,
          // so we can continue to scroll using the keyboard (arrows, page down, page up, ...)
          this.viewport.focus();
        }
      }
    }, { passive: true });

    // Display scrollbars when scrolling with touch gestures
    this.viewport.addEventListener('touchstart', () => {
      this.viewport.classList.add('touch');
    }, { passive: true });

    // Hide scrollbars when scrolling with touch gestures
    this.viewport.addEventListener('touchend', () => {
      this.viewport.classList.remove('touch');
    }, { passive: true });

    // Update scrollbar's thumb position when scrolling
    this.viewport.addEventListener('scroll', () => {
      if (this.animationFrame) {
        return;
      }
      this.animationFrame = requestAnimationFrame(() => {
        this.animationFrame = null;
        this.updateScrollbarThumbPositions();
      });
    }, { passive: true });

    // Update entire scrollbar when resizing the viewport or the content
    const resizeObserver = new ResizeObserver(() => {
      this.updateCache();
      if (this.animationFrame) {
        return;
      }
      this.animationFrame = requestAnimationFrame(() => {
        this.animationFrame = null;
        this.updateContentSize();
        this.updateScrollbarThumbSizes();
        this.updateScrollbarThumbPositions();
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
    this.updateContentSize();
    this.updateScrollbarThumbSizes();
    this.updateScrollbarThumbPositions();
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === 'scrollbar-visibility') {
      if (newValue === 'always') {
        this.viewport.classList.add('scrollbar-visible');
      }
      else {
        this.viewport.classList.remove('scrollbar-visible');
      }
    }
    else if (attributeName === 'vertical-scrollbar-position') {
      if (newValue === 'left') {
        this.elements.vertical.scrollbar.classList.add('left-position');
      }
      else {
        this.elements.vertical.scrollbar.classList.remove('left-position');
      }
    }
    else if (attributeName === 'horizontal-scrollbar-position') {
      if (newValue === 'top') {
        this.elements.horizontal.scrollbar.classList.add('top-position');
      }
      else {
        this.elements.horizontal.scrollbar.classList.remove('top-position');
      }
    }
  }

  static get observedAttributes() {
    return ['scrollbar-visibility', 'vertical-scrollbar-position', 'horizontal-scrollbar-position'];
  }

  updateCache() {
    // Caches as much as possible to avoid useless repaint/reflow
    const computedStyle = getComputedStyle(this.viewport);
    this.boundingBoxes.viewport = this.viewport.getBoundingClientRect();
    for (let orientation of orientations) {
      this.restrictContentSize[orientation] = computedStyle.getPropertyValue(`--viewport-${overflows[orientation]}`).trim() === 'hidden';
      this.boundingBoxes[orientation].scrollbarTrack = this.elements[orientation].scrollbarTrack.getBoundingClientRect();
      this.sizes[orientation].viewport = Math.floor(this.boundingBoxes.viewport[sizes[orientation]] * 10) / 10;
      this.sizes[orientation].scroll = this.viewport[scrollSizes[orientation]];
      this.sizes[orientation].scrollbarTrack = Math.floor(this.boundingBoxes[orientation].scrollbarTrack[sizes[orientation]] * 10) / 10;
      this.ratios[orientation] = this.sizes[orientation].scroll / this.sizes[orientation].scrollbarTrack;
    }
  }

  updateContentSize() {
    for (let orientation of orientations) {
      this.shadowRoot.host.style.setProperty(`--viewport-${sizes[orientation]}`, `${this.sizes[orientation].viewport}px`);
      if (this.restrictContentSize[orientation]) {
        this.content.style.setProperty(sizes[orientation], `var(--viewport-${sizes[orientation]})`);
      }
      else {
        this.content.style.removeProperty(sizes[orientation]);
      }
    }
  }

  updateScrollbarThumbSizes() {
    for (let orientation of orientations) {
      if (this.sizes[orientation].scroll <= Math.ceil(this.sizes[orientation].viewport)) {
        this.elements[orientation].scrollbar.classList.add('hidden');
        this.sizes[orientation].scrollbarThumb = this.sizes[orientation].scrollbarTrack;
      }
      else {
        this.elements[orientation].scrollbar.classList.remove('hidden');
        this.sizes[orientation].scrollbarThumb = this.sizes[orientation].viewport / this.ratios[orientation];
      }

      this.elements[orientation].scrollbarThumb.style[sizes[orientation]] = `${this.sizes[orientation].scrollbarThumb}px`;
    }
  }

  updateScrollbarThumbPositions() {
    for (let orientation of orientations) {
      const scrollbarThumbOffset = {
        vertical: 0,
        horizontal: 0,
      };
      if (this.sizes[orientation].scroll <= Math.ceil(this.sizes[orientation].viewport)) {
        this.elements[orientation].scrollbar.classList.add('hidden');
        scrollbarThumbOffset[orientation] = 0;
      }
      else {
        this.elements[orientation].scrollbar.classList.remove('hidden');
        scrollbarThumbOffset[orientation] = this.viewport[scrollSpacings[orientation]] / this.ratios[orientation];
      }

      this.elements[orientation].scrollbarThumb.style.transform = `translate3D(${scrollbarThumbOffset.horizontal}px, ${scrollbarThumbOffset.vertical}px, 0)`;
    }
  }

}

window.customElements.define('scrollable-component', ScrollableComponentElement);
