import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { hover, scrollToBottom } from './utils/pointer-events';
import { renderWithoutScript } from './utils/render';

it('should fallback to native scrollbar when component is not loaded', async () => {
  await renderWithoutScript();

  const component = page.getByTestId('component');
  await expect(component).toMatchScreenshot('inital');

  await hover(component);
  await expect(component).toMatchScreenshot('hover');

  await scrollToBottom(component);
  await expect(component).toMatchScreenshot('scrolled');
});
