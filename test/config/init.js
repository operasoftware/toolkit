require('babel-polyfill');
require('dom-test');

global.assert = require('assert');
global.sinon = require('sinon');

const consts = require('../../src/core/consts.js');
const utils = require('../../src/core/utils.js');

const types = require('../../src/core/core-types.js');

global.opr = {

  Toolkit: {
    // consts
    SUPPORTED_ATTRIBUTES: consts.SUPPORTED_ATTRIBUTES,
    SUPPORTED_STYLES: consts.SUPPORTED_STYLES,
    SUPPORTED_FILTERS: consts.SUPPORTED_FILTERS,
    SUPPORTED_TRANSFORMS: consts.SUPPORTED_TRANSFORMS,
    SUPPORTED_EVENTS: consts.SUPPORTED_EVENTS,
    // node types
    VirtualElement: types.VirtualElement,
    VirtualNode: types.VirtualNode,
    Root: types.Root,
    Component: types.Component,
    Comment: types.Comment,
    // utils
    utils: utils,
    // core
    // App: require('../../src/core/app.js'),
    Sandbox: require('../../src/core/sandbox.js'),
    ComponentTree: require('../../src/core/component-tree.js'),
    ComponentLifecycle: require('../../src/core/component-lifecycle.js'),
    Template: require('../../src/core/template.js'),
    Diff: require('../../src/core/diff.js'),
    Patch: require('../../src/core/patch.js'),
    Reconciler: require('../../src/core/reconciler.js'),
    Document: require('../../src/core/document.js'),
  }
};

global.CustomEvent = class {

  constructor(type, options) {
    this.type = type;
    this.detail = options.detail;
  }
};

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
