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
      reserved: [
        'preventScroll',
        'connectedCallback',
        'attributeChangedCallback',
        'observedAttributes',
      ],
    },
  },
};

const cssSource = readFileSync(cssInputFilename).toString();
const htmlSource = readFileSync(htmlInputFilename).toString();
const jsSource = readFileSync(jsInputFilename).toString();

const debug = process.argv[2] === '--debug';

if (debug) {
  writeFileSync(outputFilename, jsSource.replace(cssToken, cssSource).replace(htmlToken, htmlSource));
}
else {
  const minifiedCSS = minifyCSS(
    cssSource,
    cssOptions,
  ).css;
  const minifiedHTML = await minifyHTML(
    htmlSource,
    htmlOptions,
  );
  const minifiedJS = await minifyJS(
    jsSource.replace(cssToken, minifiedCSS).replace(htmlToken, minifiedHTML),
    jsOptions,
  );
  writeFileSync(outputFilename, minifiedJS.code);
}
