# Scrollable Component

[![NPM Package](https://img.shields.io/npm/v/scrollable-component?label=release&color=%23cd2620&logo=npm)](https://www.npmjs.com/package/scrollable-component)
[![GitHub Repository](https://img.shields.io/github/stars/Julien-Marcou/Scrollable-Component?color=%23f5f5f5&logo=github)](https://github.com/Julien-Marcou/Scrollabe-Component)

![Downloads per Month](https://img.shields.io/npm/dm/scrollable-component)
![Gzip Size](https://img.shields.io/bundlephobia/minzip/scrollable-component?label=gzip%20size)
![No Dependency](https://img.shields.io/badge/dependencies-none-%23872a84)
![MIT License](https://img.shields.io/npm/l/scrollable-component)

Scrollable Component is a custom element (Web Component) made to handle native scrolling with a custom scrollbar, which means it is not trying to mimic or override the viewport's native scrolling, but instead, uses the viewport's native scrolling to mimic a custom scrollbar.

```html
<scrollable-component></scrollable-component>
```


## Demo

You can check out some examples [here](https://scrollable.julien-marcou.fr/).

And here is a screenshot of a native scrollbar (on Windows 10) vs the default scrollbar provided by Scrollable Component :

![Native vs Custom scrollbar](https://github.com/Julien-Marcou/scrollable-component-demo/raw/main/native-vs-custom.png)


## Installation

```shell
npm install scrollable-component
```


## Usage

This NPM package uses the ECMAScript Modules system, so the easiest way to use it, is with a Bundler (like WebPack), so you don't have to worry about how to make it available and import it.

### With a Bundler

As it is a self-defined custom element, you must import it only once in your main entry file so it's available everywhere :

```javascript
import 'scrollable-component';
```

In addition to the previous import, if you are using TypeScript, and want the typing of the `ScrollableComponentElement`, you can import it where you need it :

```typescript
import { ScrollableComponentElement } from 'scrollable-component';
```

### Without a Bundler

If you are not using a bundler, you'll have to expose the `scrollable-component/index.js` file so it is accessible from the web, and import it in your HTML using a `module` script.

#### Using the full path

```html
<script type="module" src="/node_modules/scrollable-component/index.js"></script>

<!-- or -->

<script type="module">
  import '/node_modules/scrollable-component/index.js';
</script>
```

#### Using Import Maps

[Import Maps](https://wicg.github.io/import-maps/) can be very useful when you have several dependencies between different modules, as it allows you to import modules using their names instead of their full path.

But they are not implemented in any browser yet, so you'll have to use a polyfill :

```html
<script async src="https://unpkg.com/es-module-shims@0.12.1/dist/es-module-shims.js"></script>
<script type="importmap-shim">
  {
    "imports": {
      "scrollable-component": "/node_modules/scrollable-component/index.js"
    }
  }
</script>
<script type="module-shim">
  import 'scrollable-component';
</script>
```


## Documentation

The `ScrollableComponentElement` will automatically add custom scrollbars if the content overflows the height/width of the viewport, so you just have to constrain its size (using height, max-height, or whatever you want) :

```html
<style>
  .my-content {
    height: 300px;
  }
</style>

<scrollable-component class="my-content">
  <!-- Your content -->
</scrollable-component>
```

By default, the scrollbar only appears when hovering the viewport, but you can force the scrollbar to always be visible by setting the `scrollbar-visibility` attribute to `always`

```html
<scrollable-component scrollbar-visibility="always">
  <!-- Your content -->
</scrollable-component>
```

You can put the vertical scrollbar on the left of the viewport by setting the `vertical-scrollbar-position` attribute to `left`

```html
<scrollable-component vertical-scrollbar-position="left">
  <!-- Your content -->
</scrollable-component>
```

You can put the horizontal scrollbar on the top of the viewport by setting the `horizontal-scrollbar-position` attribute to `top`

```html
<scrollable-component horizontal-scrollbar-position="top">
  <!-- Your content -->
</scrollable-component>
```

By default, the viewport's content will overflow in both directions, if you have some content which you want to be hidden instead of displaying a scrollbar to access it, you can override the viewport overflow behaviors using CSS properties

```css
/* No horizontal scrolling */
scrollable-component {
  --viewport-overflow-x: hidden;
}

/* No vertical scrolling  */
scrollable-component {
  --viewport-overflow-y: hidden;
}
```

If can access the native viewport of a scrollable-component like this :

```javascript
const scrollableComponent = document.querySelector('scrollable-component');

scrollableComponent.viewport.addEventListener('scroll', (event) => {
  // Your code
});
```

Each scrollable-component is defining its own `--viewport-width` & `--viewport-height` CSS properties, which may be useful if you want to create something like a carousel, where child elements must take a certain amount of the viewport's size

```html
<style>
  .carousel .carousel-track {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 30px;
  }
  .carousel .carousel-item {
    width: var(--viewport-width);
    height: 300px;
  }
</style>

<scrollable-component class="carousel">
  <div class="carousel-track">
    <div class="carousel-item">Slide 1</div>
    <div class="carousel-item">Slide 2</div>
    <div class="carousel-item">Slide 3</div>
    <div class="carousel-item">Slide 4</div>
    <div class="carousel-item">Slide 5</div>
    <div class="carousel-item">Slide 6</div>
  </div>
</scrollable-component>
```


## Customization

You can change the transitions, the scrolling behaviors and the look of the scrollbars using CSS properties.

![Native vs Custom scrollbar](https://raw.githubusercontent.com/Julien-Marcou/scrollable-component-demo/main/customization.png)

Here is the list of all the default CSS properties you can override :

```css
scrollable-component {
  /* Transitions */
  --fade-in-transition-duration: 150ms;
  --fade-out-transition-duration: 800ms;
  --fade-out-transition-delay: 300ms;
  --fill-color-transition-duration: 150ms;

  /* Overflow behaviors */
  --viewport-overflow-x: auto;
  --viewport-overflow-y: auto;

  /* Scrolling behaviors */
  --viewport-scroll-snap-type: none;
  --viewport-scroll-behavior: auto;
  --viewport-overscroll-behavior: auto;
  --viewport-z-index: 0;

  /* Scrollbar look */
  --scrollbar-width: 16px;
  --scrollbar-padding: 2px;
  --scrollbar-fill-color: transparent;
  --scrollbar-fill-color-hover: transparent;
  --scrollbar-border: 0 none;
  --scrollbar-border-radius: 0;
  --scrollbar-box-shadow: none;
  --scrollbar-z-index-hover: 30;
  --vertical-scrollbar-padding: var(--scrollbar-padding);
  --vertical-scrollbar-background: none;
  --vertical-scrollbar-background-size: auto;
  --vertical-scrollbar-z-index: 20;
  --horizontal-scrollbar-padding: var(--scrollbar-padding);
  --horizontal-scrollbar-background: none;
  --horizontal-scrollbar-background-size: auto;
  --horizontal-scrollbar-z-index: 10;

  /* Scrollbar's track look */
  --scrollbar-track-fill-color: transparent;
  --scrollbar-track-fill-color-hover: transparent;
  --scrollbar-track-border: 0 none;
  --scrollbar-track-border-radius: 0;
  --scrollbar-track-box-shadow: none;
  --vertical-scrollbar-track-background: none;
  --vertical-scrollbar-track-background-size: auto;
  --horizontal-scrollbar-track-background: none;
  --horizontal-scrollbar-track-background-size: auto;

  /* Scrollbar's thumb look */
  --scrollbar-thumb-fill-color: #ccc;
  --scrollbar-thumb-fill-color-hover: #aaa;
  --scrollbar-thumb-border: 0 none;
  --scrollbar-thumb-border-radius: var(--scrollbar-width);
  --scrollbar-thumb-box-shadow: none;
  --vertical-scrollbar-thumb-background: none;
  --vertical-scrollbar-thumb-background-size: auto;
  --horizontal-scrollbar-thumb-background: none;
  --horizontal-scrollbar-thumb-background-size: auto;

  /* Content padding */
  /* (You probably want to use this instead of setting the padding directly on the scrollable-component) */
  --content-padding: 0;
}
```


## Browser compatibility

Firefox, Chromium-based browsers (Chrome, Edge, Opera, ...) & WebKit-based browsers (Safari, ...)


## Why use Scrollable Component ?

### Perks

Simple, performant, modern, it probably outpasses a lot of old custom scrollbar packages

- It's built for raw performance by using modern features from browsers, which also allow for better customization & cleaner code
- It does not override the viewport's native behaviors (Mouse Wheel scrolling, Swipe scrolling, Page Down/Up keys, Arrow keys, Middle Mouse Button's auto-scrolling, Scroll snapping, JavaScript API...)
- It uses the [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) specs, making it act like a black box from the outside (encapsulating HTML, CSS & JS) and leaving the DOM untouched, without extraneous `<div>`
- It's simple to use (you just need to add the `<scrollable-component>` tag around the content you want the custom scrollbars on)
- It's easy to customize (it uses CSS variables, like `--scrollbar-width: 16px;`)

### Quirks

This package is not intended to replace all the scrollbars of your website, especially not the body's one. Tampering with native behaviors is always at risk, especially for the Web Accessibility

It's recommended to only use it sparingly, on small parts of your website (like modal boxes, chats, sidebars, dropdowns...) to enhance the user's experience through a cleaner UI

- It only works on modern browsers
- It will never be as fast as native scrollbars
- It sacrifices some native functionalities (like Google Chrome's search result highlights in the scrollbar)
- The custom scrollbars are absolutely positioned above the native viewport, which means scrolling when the pointer directly interacts with them instead of the viewport, is in fact, handled with some JavaScript and not natively


## How it works

Scrollable Component uses the [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) specs to create a custom element which handles all the work for you and which can even be extended

The native scrollbar is hidden using the CSS `scrollbar-width: none;` rule which is a powerful new feature in the state of [Candidate Recommendation Snapshot](https://www.w3.org/TR/css-scrollbars-1/), but already supported by Firefox and that should come to Chromium-based & WebKit-based browsers soon enough, which are for the moment falling back to the CSS `::-webkit-scrollbar { width: 0; }` rule

The custom scrollbar is redrawn when needed, to visually match where the native scrollbar would be placed

All scrolling behaviors on the viewport itself are the native ones, while scrolling behaviors directly using the custom scrollbar (e.g. drag & dropping the scrollbar's thumb or clicking somewhere on the scrollbar's track) are handled with some JavaScript which then natively move the viewport's scroll position
