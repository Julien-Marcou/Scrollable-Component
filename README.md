# Scrollable Component

Scrollable Component is a custom element (Web Component) made to handle native scrolling with a custom scrollbar, which means it is not trying to mimic or override the viewport's native scrolling, but instead, uses the viewport's native scrolling to mimic a custom scrollbar


## Demo

You can check out some examples [here](https://scrollable.julien-marcou.fr/)

## Installation

```shell
npm install scrollable-component
```


## Import

### TypeScript

As it is a self-defined custom element, you must import it in your main entry file so it's available everywhere

```javascript
import 'scrollable-component';
```

In addition to the previous import, if you want to extend or use the typing of the ScrollableComponentElement, you can import it where you need it

```javascript
import { ScrollableComponentElement } from 'scrollable-component';
```

### JavaScript

If you are not using Webpack, you can directly import it in your HTML using a `module` script

```html
<script type="module" src="path-to-scrollable-component-vendor/index.js"></script>
```

Or, while we are waiting for the [Import Maps](https://wicg.github.io/import-maps/) specs to be available, so we can use "named" imports like you would do in TypeScript, and you want to import it in your JavaScript, you will need to use the path to the script

```javascript
import 'path-to-scrollable-component-vendor/index.js';
```

## Usage

The ScrollableComponentElement will automatically add custom scrollbars if the content overflows the height/width of the viewport, so you just have to constrain its size (using height, max-height, or whatever you want)

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


## Why use Scrollable Component ?

### Perks

Simple, performant, modern, it probably outpasses a lot of old custom scrollbar packages

- It's built for raw performance by using modern features from browsers, which also allow for better customization & cleaner code
- It does not override the viewport's native behaviors (Mousewheel scrolling, Swipe scrolling, Page Down/Up keys, Arrow keys, Middle Mouse Button's auto-scrolling, Scroll snapping, JavaScript API...)
- It uses the [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) specs, making it act like a black box from the outside (encapsulating HTML, CSS & JS) and leaving the DOM untouched, without extraneous `<div>`
- It's simple to use (you just need to add the `<scrollable-component>` tag around the content you want the custom scrollbars on)
- It's easy to customize (it uses CSS variables, like `--scrollbar-width: 16px;`)

### Quirks

This package it not intended to replace all the scrollbars of your website, especially not the body's one. Tampering with native behaviors are always at risk, especially for the Web Accessibility

It's recommended to only use it sparingly, on small parts of your website (like modal boxes, chats, sidebars, dropdowns...) to enhance the user's experience through a cleaner UI

- It only works on modern browsers
- It will never be as fast as native scrollbars
- It sacrifices some native functionalities (like Google Chrome's search result highlights in the scrollbar)
- The custom scrollbars are absolutely positioned above the native viewport, which means scrolling when the pointer directly interacts with them instead of the viewport, is in fact, handled with some JavaScript and not natively


## Browser compatibility

Firefox & all Chromium-based browsers (Chrome, Edge, Safari, Opera, ...)


## Customization

You can force the scrollbar to always be visible by setting the `scrollbar-visibility` attribute to `always`

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

You can also change the transitions, the scrolling behaviors and the look of the scrollbars using CSS properties

Here is the list of all the default CSS properties you can override

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

    /* Scrollbar look */
    --scrollbar-width: 16px;
    --scrollbar-padding: 2px;
    --scrollbar-fill-color: transparent;
    --scrollbar-fill-color-hover: transparent;
    --scrollbar-border: 0 none;
    --scrollbar-border-radius: 0;
    --scrollbar-box-shadow: none;
    --vertical-scrollbar-background: none;
    --vertical-scrollbar-background-size: auto;
    --horizontal-scrollbar-background: none;
    --horizontal-scrollbar-background-size: auto;

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

If you need to access the native viewport of the scrollable-component

```javascript
const scrollableComponent = document.querySelector('scrollable-component');

scrollableComponent.viewport.addEventListener('scroll', (event) => {
    // Your code
});
```

Each scrollable-component is defining its own `--viewport-width` & `--viewport-height` CSS properties, which may be usefull if you want to create something like a carousel, where child elements must take a certain amount of the viewport's size

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


## How it works

Scrollable Component uses the [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) specs to create a custom element which handles all the work for you and which can even be extended

The native scrollbar is hidden using the CSS `scrolbar-width: none;` rule which is a powerful new feature still in a Working Draft status, but already supported by Firefox and that should come to Chromium-based browsers soon enough, which are for the moment falling back to the CSS `::-webkit-scrollbar { width: 0; }` rule

The custom scrollbar's is redrawn when needed, to visually match where the native scrollbar would be placed

All scrolling behaviors on the viewport itself are the native ones, while scrolling behaviors directly using the custom scrollbar (like drag & dropping the scrollbar's thumb or clicking somewhere on the scrollbar's track) are handled with some JavaScript which then natively move the viewport's scroll position
