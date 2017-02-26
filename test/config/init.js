require('babel-polyfill');
require('dom-test');

global.assert = require('assert');
global.sinon = require('sinon');

const consts = require('../../src/core/consts.js');
const utils = require('../../src/core/utils.js');

const CoreTypes = require('../../src/core/core-types.js');

global.createCore = () => (Object.assign({
  ComponentTree: require('../../src/core/component-tree.js'),
  Template: require('../../src/core/template.js'),
  Diff: require('../../src/core/diff.js'),
  Patch: require('../../src/core/patch.js'),
  Reconciler: require('../../src/core/reconciler.js'),
  Document: require('../../src/core/document.js'),
  SUPPORTED_ATTRIBUTES: consts.SUPPORTED_ATTRIBUTES,
  SUPPORTED_STYLES: consts.SUPPORTED_STYLES,
  SUPPORTED_FILTERS: consts.SUPPORTED_FILTERS,
  SUPPORTED_TRANSFORMS: consts.SUPPORTED_TRANSFORMS,
  SUPPORTED_EVENTS: consts.SUPPORTED_EVENTS,
  create: utils.create,
  utils: utils.utils,
}, CoreTypes));

global.suppressConsoleErrors = () => {

  let consoleError;
  beforeEach(() => {
    consoleError = console.error;
    console.error = () => {};
  });

  afterEach(() => {
    console.error = consoleError;
  });
};