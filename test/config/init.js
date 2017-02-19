require('babel-polyfill');
global.assert = require('assert');
global.sinon = require('sinon');

const consts = require('../../src/core/consts.js');
const utils = require('../../src/core/consts.js');

global.Element = class {

  constructor(name) {
    this.tagName = name.toUpperCase();
    this.childNodes = [];
    this.eventListeners = {};
  }

  setAttribute(name, value) {
    throw new Error('Function "setAttribute" not implemented!');
  }

  removeAttribute(name) {
    throw new Error('Function "removeAttribute" not implemented!');
  }

  appendChild(child) {
    this.childNodes.push(child);
  }

  insertBefore(child) {
    throw new Error('Function "insertBefore" not implemented!');
  }

  addEventListener(name, listener) {
    this.eventListeners[name] = this.eventListeners[name] || [];
    this.eventListeners[name].push(listener);
  }

  removeEventListener(name, listener) {
    throw new Error('Function "removeEventListener" not implemented!');
  }
};

global.document = {
  createElement: name => new Element(name)
};

global.createCore = () => ({
  Component: require('../../src/core/component.js'),
  VirtualNode: require('../../src/core/virtual-node.js'),
  VirtualDOM: require('../../src/core/virtual-dom.js'),
  ComponentTree: require('../../src/core/component-tree.js'),
  Diff: require('../../src/core/diff.js'),
  Patch: require('../../src/core/patch.js'),
  Reconciler: require('../../src/core/reconciler.js'),
  Document: require('../../src/core/document.js'),
  SUPPORTED_ATTRIBUTES: consts.SUPPORTED_ATTRIBUTES,
  SUPPORTED_EVENTS: consts.SUPPORTED_EVENTS,
  create: utils.create
});