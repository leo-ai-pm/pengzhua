import { build } from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import assert from 'node:assert/strict';
await build({
  stdin: {
    contents:
      "export {default as MobileMap} from './app/mobile-map'; export {beijingPlaces} from './app/beijing-places'; export {NavigationOptions} from './app/navigation-preview';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  packages: 'external',
  outfile: 'outputs/map-ui-bundle.mjs',
});
const { MobileMap, beijingPlaces, NavigationOptions } = await import(
  '../outputs/map-ui-bundle.mjs?' + Date.now()
);
const html = renderToStaticMarkup(
  createElement(MobileMap, {
    places: beijingPlaces,
    selected: beijingPlaces[0].id,
    saved: [],
    live: [],
    walking: false,
    onSelect() {},
    onSave() {},
    onStart() {},
    onCurrentWalk() {},
    onContribute() {},
    onPet() {},
  }),
);
assert.match(
  html,
  /返回地点列表/,
  'Selected place needs an explicit return control',
);
assert.doesNotMatch(
  html,
  /href="https:\/\/(www.sina.cn|www.bjsjs.gov.cn|uri.amap.com)/,
  'Demo must not expose outbound links',
);
console.log('PASS: selected-place return and no accidental outbound links');

const navHtml = renderToStaticMarkup(
  createElement(NavigationOptions, { place: beijingPlaces[0], onClose() {} }),
);
assert.match(navHtml, /步行/);
assert.match(navHtml, /驾车/);
assert.match(navHtml, /骑行/);
assert.match(navHtml, /确认路线（演示）/);
assert.match(navHtml, /返回地点/);
assert.doesNotMatch(navHtml, /<a[ >]/);
assert.match(html, /展开详情/);
console.log('PASS: navigation demo offers travel modes without outbound links');
