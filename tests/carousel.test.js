import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { hover, scrollToBottom, scrollToRight } from './utils/pointer-events';
import { renderCustomHtmlAndCss } from './utils/render';

const css = `
scrollable-component {
  --scrollbar-padding: 0;
  --scrollbar-width: 12px;
  --content-padding: 1rem 0;
  padding: 1rem 0;
  scroll-snap-type: x mandatory;
  overflow-y: hidden;
  overflow-x: auto;
  border: 0 none;
  border-radius: 0;
  height: auto;
}
scrollable-component::part(scrollbar-track) {
  background-color: #eee;
}
.carousel-track {
  display: grid;
  grid-auto-flow: column;
  grid-gap: 2rem;
}
.carousel-item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  display: grid;
  align-items: center;
  justify-items: center;
  width: calc(var(--viewport-width) - 120px);
  height: 250px;
  background-color: #eee;
  border: 1px solid #777;
  font-size: 1.5rem;
  border-radius: 0.5rem;
}`;

const html = `
<div class="carousel-track">
  <div class="carousel-item">One</div>
  <div class="carousel-item">Two</div>
  <div class="carousel-item">Three</div>
  <div class="carousel-item">Four</div>
  <div class="carousel-item">Five</div>
  <div class="carousel-item">Six</div>
</div>`;

it('should render carousel scrollable component', async () => {
  await renderCustomHtmlAndCss(html, css);

  const component = page.getByTestId('component');
  const element = component.element();
  element.setAttribute('scrollbar-overlay', 'false');
  element.setAttribute('scrollbar-visibility', 'trackbar');
  element.setAttribute('horizontal-scrollbar-position', 'both');
  await expect(component).toMatchScreenshot('initial');

  await hover(component);
  await expect(component).toMatchScreenshot('hover');

  await scrollToRight(component);
  await expect(component).toMatchScreenshot('scrolled');
});
