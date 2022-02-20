export class ScrollableComponentElement extends HTMLElement {
}

declare global {
  interface HTMLElementTagNameMap {
    'scrollable-component': ScrollableComponentElement;
  }
}
