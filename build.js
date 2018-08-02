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

const copyrightHeader = `/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

`;

const merge = (...contents) => contents.join('\n\n');

const package = loadJSON('./package.json');

const ModuleLoader = loadModule('core/loader');

const Consts = normalizeModule('core/consts');
const Nodes = normalizeModule('core/nodes');

const Diff = normalizeModule('core/diff');
const Lifecycle = normalizeModule('core/lifecycle');
const Patch = normalizeModule('core/patch');
const Plugins = normalizeModule('core/plugins');
const Reconciler = normalizeModule('core/reconciler');
const Renderer = normalizeModule('core/renderer');
const Sandbox = normalizeModule('core/sandbox');
const Service = normalizeModule('core/service');
const Template = normalizeModule('core/template');
const VirtualDOM = normalizeModule('core/virtual-dom');
const utils = normalizeModule('core/utils');

const Toolkit = normalizeModule('core/toolkit');
const Release = loadModule('release');

let release = merge(
                    ModuleLoader, Consts, Nodes, Diff, Lifecycle, Patch,
                    Plugins, Reconciler, Renderer, Sandbox, Service, Template,
                    VirtualDOM, utils, Toolkit, Release)
                    .replace(/\n\n\n/g, '\n\n');

while (release.includes(copyrightHeader)) {
  release = release.replace(copyrightHeader, '');
}
release = `${copyrightHeader}${release}`;

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
