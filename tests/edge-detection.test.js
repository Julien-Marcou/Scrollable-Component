import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { renderCustomCss } from './utils/render';
import { hover, scrollDownBy, scrollToBottom } from './utils/pointer-events';

const css = `
scrollable-component {
  box-shadow:
    0 0 20px -20px rgba(255, 0, 0, 0) inset,
    0 0 20px -20px rgba(255, 0, 0, 0) inset;
}
scrollable-component[top-overflow] {
  box-shadow:
    0 24px 20px -20px rgba(255, 0, 0, 1) inset,
    0 0 20px -20px rgba(255, 0, 0, 0) inset;
}
scrollable-component[bottom-overflow] {
  box-shadow:
    0 0 20px -20px rgba(255, 0, 0, 0) inset,
    0 -24px 20px -20px rgba(255, 0, 0, 1) inset;
}
scrollable-component[top-overflow][bottom-overflow] {
  box-shadow:
    0 24px 20px -20px rgba(255, 0, 0, 1) inset,
    0 -24px 20px -20px rgba(255, 0, 0, 1) inset;
}`;

it('should render scrollable component with edge detection', async () => {
  await renderCustomCss(css);

  const component = page.getByTestId('component');
  const element = component.element();
  element.setAttribute('edge-detection', 'true');
  await hover(component);
  await expect(component).toMatchScreenshot('bottom-overflow');

  await scrollDownBy(component, 200);
  await expect(component).toMatchScreenshot('both-overflow');

  await scrollToBottom(component);
  await expect(component).toMatchScreenshot('top-overflow');
});
