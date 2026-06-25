import { userEvent } from 'vitest/browser';

export async function hover(locator) {
  await userEvent.hover(locator);
}

export async function scrollDownBy(locator, delta) {
  await userEvent.wheel(locator, { delta: { y: delta } });
}

export async function scrollRightBy(locator, delta) {
  await userEvent.wheel(locator, { delta: { x: delta } });
}

export async function scrollToBottom(locator, delta) {
  const element = locator.element();
  const maxScrollHeight = element.scrollHeight - element.clientHeight;
  await scrollDownBy(locator, maxScrollHeight);
}

export async function scrollToRight(locator, delta) {
  const element = locator.element();
  const maxScrollWidth = element.scrollWidth - element.clientWidth;
  await scrollRightBy(locator, maxScrollWidth);
}

