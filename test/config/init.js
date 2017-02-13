require('babel-polyfill');
global.assert = require('assert');
global.sinon = require('sinon');

const consts = require('../../src/core/consts.js');
const utils = require('../../src/core/consts.js');

global.createCore = () => ({
  Component: require('../../src/core/component.js'),
  VirtualNode: require('../../src/core/virtual-node.js'),
  VirtualDOM: require('../../src/core/virtual-dom.js'),
  ComponentTree: require('../../src/core/component-tree.js'),
  Diff: require('../../src/core/diff.js'),
  Patch: require('../../src/core/patch.js'),
  Reconciler: require('../../src/core/reconciler.js'),
  SUPPORTED_ATTRIBUTES: consts.SUPPORTED_ATTRIBUTES,
  SUPPORTED_EVENTS: consts.SUPPORTED_EVENTS,
  create: utils.create
});