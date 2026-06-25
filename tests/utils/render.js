
import { page } from 'vitest/browser';
import { hover } from './pointer-events';

const defaultTag = 'scrollable-component';

function getDummyContent() {
  let content = '';
  for (let i = 0; i < 10; i++) {
    content += `<p><strong>Paragraph ${i + 1}:</strong> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus, alias voluptate voluptatum veniam, consectetur iste sapiente provident ad quidem quod rerum ullam sed atque aperiam quibusdam odit earum eum harum.</p>`
  }
  return content;
}

function getStyle(tag = undefined, css = '') {
  const style = document.createElement('style');
  style.textContent  = `
* {
  box-sizing: border-box;
}
html {
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 1.25rem;
  background: transparent;
}
body {
  position: relative;
  display: grid;
  align-items: center;
  justify-items: center;
  margin: 0;
}
p {
  margin: 0;
}
p:not(:last-child) {
  margin-bottom: 1rem;
}
#top-left-anchor {
  position: absolute;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
}
${tag ?? defaultTag} {
  /* disable transitions for faster test time */
  --fade-in-transition-duration: 0ms;
  --fade-out-transition-duration: 0ms;
  --fade-out-transition-delay: 0ms;
  --fill-color-transition-duration: 0ms;
  --content-padding: 1rem;
  display: block;
  padding: 1rem;
  margin: 1rem;
  width: 600px;
  height: 300px;
  background-color: #fff;
  border: 1px solid #777;
  border-radius: 8px;
  overflow-x: hidden;
  overflow-y: scroll;
}
${css}`;
  return style;
}

function getScript(tag = undefined) {
  const script = document.createElement('script');
  script.type = 'module';
  if (tag) {
  script.textContent  = `
import { ScrollableComponentElement } from '/index.js';
if (!window.customElements.get('${tag}')) {
  window.customElements.define('${tag}', class extends ScrollableComponentElement {});
}`;
  }
  else {
  script.textContent  = `
import { defineScrollableComponent, isScrollableComponentDefined } from '/index.js';
if (!isScrollableComponentDefined()) {
  defineScrollableComponent();
}`;
  }
  return script;
}

function getTopLeftAnchor() {
  const component = document.createElement('div');
  component.id = 'top-left-anchor';
  component.dataset.testid = 'top-left-anchor';
  return component;
}

function getComponent(tag = undefined, html = undefined) {
  const component = document.createElement(tag ?? defaultTag);
  component.innerHTML = html ?? getDummyContent();
  component.dataset.testid = 'component';
  return component;
}

async function ready() {
  await document.fonts.ready;
  // make sure we are not initialy hovering the scrollable-component
  await hover(page.getByTestId('top-left-anchor'));
}

export async function render() {
  document.body.replaceChildren(
    getScript(),
    getStyle(),
    getTopLeftAnchor(),
    getComponent(),
  );
  await ready();
}

export async function renderCustomTag(tag) {
  document.body.replaceChildren(
    getScript(tag),
    getStyle(tag),
    getTopLeftAnchor(),
    getComponent(tag),
  );
  await ready();
}

export async function renderCustomCss(css) {
  document.body.replaceChildren(
    getScript(),
    getStyle(undefined, css),
    getTopLeftAnchor(),
    getComponent(),
  );
  await ready();
}

export async function renderCustomHtmlAndCss(html, css) {
  document.body.replaceChildren(
    getScript(),
    getStyle(undefined, css),
    getTopLeftAnchor(),
    getComponent(undefined, html),
  );
  await ready();
}


export async function renderWithoutScript() {
  document.body.replaceChildren(
    getStyle(),
    getTopLeftAnchor(),
    getComponent(),
  );
  await ready();
}
