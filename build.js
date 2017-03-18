const fs = require('fs');

const loadFile = path => fs.readFileSync(path, 'utf8');
const loadJSON = path => JSON.parse(loadFile(path));
const loadModule = path => loadFile(`./src/${path}.js`);

const convertModuleExportsToDefine = (script, path) => {
  const moduleExportsRegExp = /module\.exports\ \=\ (.+?);/;
  const match = script.match(moduleExportsRegExp);
  if (match) {
    const normalized = script.replace(match[0], `define('${path}', ${match[1]});`);
    return normalized;
  } else {
    throw new Error('No module.exports statement found in: ' + path);
  }
};

const normalizeModule = path => {
  const script = loadModule(path);
  return convertModuleExportsToDefine(script, path);
};

const merge = (...contents) => contents.join('\n\n');

const package = loadJSON('./package.json');

const ModuleLoader = loadModule('module-loader');

const Consts = normalizeModule('core/consts');
const CoreTypes = normalizeModule('core/core-types');
const App = normalizeModule('core/app');
const Store = normalizeModule('core/store');
const Template = normalizeModule('core/template');
const ComponentTree = normalizeModule('core/component-tree');
const ComponentLifecycle = normalizeModule('core/component-lifecycle');
const Diff = normalizeModule('core/diff');
const Patch = normalizeModule('core/patch');
const Reconciler = normalizeModule('core/reconciler');
const Document = normalizeModule('core/document');
const utils = normalizeModule('core/utils');

const Release = loadModule('release');

const release = merge(
  ModuleLoader, Consts, CoreTypes, App, Store, Template, ComponentTree,
  ComponentLifecycle, Diff, Patch, Reconciler, Document, utils,
  Release
);

fs.writeFileSync('./dist/reactor.release.js', release, 'utf8');

const size = String(release.length).replace(/(\d{3})$/g, ',$1');

console.log();
console.log('-------------------------------------------------------');
console.log(' Finished bundling release version of Chromium Reactor');
console.log('-------------------------------------------------------');
console.log(` Version: ${package.version}`);
console.log(` Size: ${size} bytes`);
console.log('-------------------------------------------------------');
console.log();