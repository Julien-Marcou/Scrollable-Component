import { build } from 'esbuild';
import { minify as minifyCSS } from 'csso';
import { minify as minifyHTML } from 'html-minifier-terser';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const outputFilename = 'index.js';
const jsSource = readFileSync('src/index.js').toString();
const cssSource = readFileSync('src/index.css').toString();
const htmlSource = readFileSync('src/index.html').toString();
const cssToken = '{{COMPONENT_CSS}}';
const htmlToken = '{{COMPONENT_HTML}}';

const debug = process.argv[2] === '--debug';

let jsReadyForBundle = jsSource;

// CSS minification
const minifiedCss = debug ? cssSource : minifyCSS(cssSource, { restructure: false, }).css;
jsReadyForBundle = jsReadyForBundle.replace(cssToken, minifiedCss);

// HTML minification
const minifiedHtml = debug ? htmlSource : await minifyHTML(htmlSource, { collapseWhitespace: true });
jsReadyForBundle = jsReadyForBundle.replace(htmlToken, minifiedHtml);

// JS minification
const bundledJs = await build({
  stdin: {
    contents: jsReadyForBundle,
    resolveDir: './src',
  },
  format: 'esm',
  platform: 'browser',
  target: 'es2024',
  bundle: true,
  minify: !debug,
  write: false,
  outdir: './dist',
});

writeFileSync(outputFilename, bundledJs.outputFiles[0].text);
