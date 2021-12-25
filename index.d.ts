export class ScrollableComponentElement extends HTMLElement {
  public readonly viewport: HTMLElement;
  public readonly content: HTMLElement;
}

declare global {
  interface HTMLElementTagNameMap {
    'scrollable-component': ScrollableComponentElement;
  }
}
