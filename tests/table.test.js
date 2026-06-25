import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { hover, scrollToBottom, scrollToRight } from './utils/pointer-events';
import { renderCustomHtmlAndCss } from './utils/render';

const css = `
scrollable-component {
  --content-padding: 0;
  overflow: auto;
  padding: 0;
}
.table {
  display: grid;
  grid-template-columns: repeat(10, 185px);
}
.table-row {
  display: contents;
}
.table-cell {
  padding: 20px;
  border-bottom: 1px solid #e1e4e8;
}
.table-row:nth-child(even) .table-cell {
  background-color: #fcfeff;
}
.table-row:nth-child(odd) .table-cell {
  background-color: #f5f7fa;
}
.table-row:last-child .table-cell {
  border-bottom: 0;
}
.table-row.table-header .table-cell {
  background-color: #eff8ff;
  border-bottom: 1px solid #c8e1ff;
  font-weight: bold;
}`;

const html = `
<div class="table">
  <div class="table-row table-header">
    <div class="table-cell">Column 1</div>
    <div class="table-cell">Column 2</div>
    <div class="table-cell">Column 3</div>
    <div class="table-cell">Column 4</div>
    <div class="table-cell">Column 5</div>
    <div class="table-cell">Column 6</div>
    <div class="table-cell">Column 7</div>
    <div class="table-cell">Column 8</div>
    <div class="table-cell">Column 9</div>
    <div class="table-cell">Column 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
  <div class="table-row">
    <div class="table-cell">Value 1</div>
    <div class="table-cell">Value 2</div>
    <div class="table-cell">Value 3</div>
    <div class="table-cell">Value 4</div>
    <div class="table-cell">Value 5</div>
    <div class="table-cell">Value 6</div>
    <div class="table-cell">Value 7</div>
    <div class="table-cell">Value 8</div>
    <div class="table-cell">Value 9</div>
    <div class="table-cell">Value 10</div>
  </div>
</div>`;

it('should render table scrollable component', async () => {
  await renderCustomHtmlAndCss(html, css);

  const component = page.getByTestId('component');
  const element = component.element();
  element.setAttribute('scrollbar-overlay', 'false');
  await expect(component).toMatchScreenshot('initial');

  await hover(component);
  await expect(component).toMatchScreenshot('hover');

  await scrollToBottom(component);
  await scrollToRight(component);
  await expect(component).toMatchScreenshot('scrolled');
});
