const fs = require('fs');

const loadFile = path => fs.readFileSync(path, 'utf8');
const loadJSON = path => JSON.parse(loadFile(path));
const loadModule = path => loadFile(`./src/${path}.js`);

const convertModuleExportsToDefine = (script, path) => {
  const moduleExportsRegExp = /module\.exports\ \=\ (.+?);/;
  const match = script.match(moduleExportsRegExp);
  if (match) {
    const normalized =
        script.replace(match[0], `loader.define('${path}', ${match[1]});`);
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

const ModuleLoader = loadModule('core/loader');

const Consts = normalizeModule('core/consts');
const CoreTypes = normalizeModule('core/core-types');
const App = normalizeModule('core/app');
const Sandbox = normalizeModule('core/sandbox');
const Template = normalizeModule('core/template');
const ComponentTree = normalizeModule('core/component-tree');
const ComponentLifecycle = normalizeModule('core/component-lifecycle');
const Diff = normalizeModule('core/diff');
const Patch = normalizeModule('core/patch');
const Reconciler = normalizeModule('core/reconciler');
const Document = normalizeModule('core/document');
const Service = normalizeModule('core/service');
const utils = normalizeModule('core/utils');

const Release = loadModule('release');

const release = merge(
                    ModuleLoader, Consts, CoreTypes, Service, App, Sandbox,
                    Template, ComponentTree, ComponentLifecycle, Diff, Patch,
                    Reconciler, Document, utils, Release)
                    .replace(/\n\n\n/g, '\n\n');

fs.writeFileSync('./dist/toolkit.release.js', release, 'utf8');

const formatNumber = number => String(number).replace(/(\d{3})$/g, ',$1');

const size = formatNumber(release.length);
const lines = formatNumber(release.split('\n').length);

console.log();
console.log('-------------------------------------------------------');
console.log(' Finished bundling release version of Opera Toolkit');
console.log('-------------------------------------------------------');
console.log(` => Version: ${package.version}`);
console.log(` => Lines: ${lines}`);
console.log(` => Size: ${size} bytes`);
console.log('-------------------------------------------------------');
console.log();
