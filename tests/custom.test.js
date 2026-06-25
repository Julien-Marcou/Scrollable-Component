import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { hover, scrollToBottom } from './utils/pointer-events';
import { renderCustomCss } from './utils/render';

const css1 = `
scrollable-component {
  --scrollbar-width: 20px;
  --scrollbar-thumb-fill-color: #f00;
  --scrollbar-thumb-fill-color-hover: #c00;
}
scrollable-component::part(scrollbar-track) {
  box-shadow: 0 0 0 2px #f00 inset;
}
scrollable-component::part(scrollbar-thumb) {
  box-shadow: 0 0 0 2px #fff;
}`;

const css2 = `
scrollable-component {
  --scrollbar-width: 24px;
  --scrollbar-track-fill-color: rgba(0, 0, 0, 0.1);
  --scrollbar-track-fill-color-hover: rgba(0, 0, 0, 0.16);
}
scrollable-component::part(scrollbar) {
  /* box-shadow: 0 0 0 4px #f3f2f1 inset, 4px 5px 3px rgba(0, 0, 0, 0.2) inset; */
  padding: 8px;
}
scrollable-component::part(scrollbar-track) {
  position: relative;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2) inset;
}
scrollable-component::part(scrollbar-track):before {
  content: '';
  display: block;
  position: absolute;
  inset: -4px;
}
scrollable-component::part(scrollbar-thumb) {
  position: relative;
  background: transparent;
}
scrollable-component::part(scrollbar-thumb):before {
  content: '';
  display: block;
  position: absolute;
  inset: -4px;
  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj4NCiAgPHBhdGggZmlsbD0iIzMzMyIgZD0iTTIgMTFoMTZ2Mkgyem0wLTRoMTZ2Mkgyem04IDExbDMtM0g3bDMgM3ptMC0xNkw3IDVoNmwtMy0zeiIvPg0KPC9zdmc+DQo=);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 16px 14px;
  border-radius: 8px;
  background-color: #efb436;
  border: 1px solid #efb436;
  transition: all var(--fill-color-transition-duration) ease-out;
}
scrollable-component::part(scrollbar-thumb):hover:before {
  background-color: #e6a722;
}
scrollable-component::part(scrollbar-thumb active):before {
  border-color: #5f4816;
}`;

it('should render custom scrollable component 1', async () => {
  await renderCustomCss(css1);

  const component = page.getByTestId('component');
  const element = component.element();
  element.setAttribute('scrollbar-overlay', 'false');
  element.setAttribute('scrollbar-visibility', 'always');

  await expect(component).toMatchScreenshot('custom-1');
});

it('should render custom scrollable component 2', async () => {
  await renderCustomCss(css2);

  const component = page.getByTestId('component');
  const element = component.element();
  element.setAttribute('scrollbar-overlay', 'false');
  element.setAttribute('scrollbar-visibility', 'always');
  element.setAttribute('vertical-scrollbar-position', 'left');

  await expect(component).toMatchScreenshot('custom-2');
});
