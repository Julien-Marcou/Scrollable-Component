import { minify as minifyCSS } from 'csso';
import { minify as minifyHTML } from 'html-minifier-terser';
import { minify as minifyJS } from 'terser';
import { readFileSync, writeFileSync } from 'fs';

const cssInputFilename = 'src/index.css';
const htmlInputFilename = 'src/index.html';
const jsInputFilename = 'src/index.js';
const outputFilename = 'index.js';
const cssToken = '{{COMPONENT_CSS}}';
const htmlToken = '{{COMPONENT_HTML}}';

const cssOptions = {
  restructure: false,
};
const htmlOptions = {
  collapseWhitespace: true,
};
const jsOptions = {
  mangle: {
    toplevel: true,
    properties: {
      reserved: ['connectedCallback', 'attributeChangedCallback', 'observedAttributes']
    },
  },
};

const minifiedCSS = minifyCSS(
  readFileSync(cssInputFilename).toString(),
  cssOptions,
).css;
const minifiedHTML = await minifyHTML(
  readFileSync(htmlInputFilename).toString(),
  htmlOptions,
);
const minifiedJS = await minifyJS(
  readFileSync(jsInputFilename).toString().replace(cssToken, minifiedCSS).replace(htmlToken, minifiedHTML),
  jsOptions,
);

writeFileSync(outputFilename, minifiedJS.code);
