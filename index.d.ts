export class ScrollableComponentElement extends HTMLElement {}

export function defineScrollableComponent(): void;
export function isScrollableComponentDefined(): boolean;
export function whenScrollableComponentDefined(): Promise<CustomElementConstructor>;

declare global {
  interface HTMLElementTagNameMap {
    'scrollable-component': ScrollableComponentElement;
  }
}
