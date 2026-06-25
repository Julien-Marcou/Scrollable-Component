import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { hover, scrollToBottom } from './utils/pointer-events';
import { render, renderCustomTag } from './utils/render';

it('should render default scrollable component', async () => {
  await render();

  const component = page.getByTestId('component');
  await expect(component).toMatchScreenshot('inital');

  await hover(component);
  await expect(component).toMatchScreenshot('hover');

  await scrollToBottom(component);
  await expect(component).toMatchScreenshot('scrolled');
});

it('should render scrollable component with custom tag', async () => {
  await renderCustomTag('my-custom-tag');

  const component = page.getByTestId('component');
  await expect(component).toMatchScreenshot('inital');

  await hover(component);
  await expect(component).toMatchScreenshot('hover');

  await scrollToBottom(component);
  await expect(component).toMatchScreenshot('scrolled');

  expect(component.element().tagName.toLowerCase()).toBe('my-custom-tag');
});
