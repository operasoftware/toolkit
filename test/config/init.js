require('babel-polyfill');
require('dom-test');

global.assert = require('assert');
global.sinon = require('sinon');

global.HTMLElement = class {};

{
  const registry = {};

  const getKey = id => typeof id === 'symbol' ? String(id).slice(7, -1) : id;

  global.loader = class MochaModuleLoader {

    static get(id) {
      return registry[getKey(id)];
    }

    static define(id, module) {
      registry[id] = module;
    }

    static async foreload(id) {
    }
  };

  const Toolkit = require('../../src/core/toolkit.js');

  const consts = require('../../src/core/consts.js');
  const nodes = require('../../src/core/nodes.js');

  Object.assign(Toolkit.prototype, consts, nodes, {
    Diff: require('../../src/core/diff.js'),
    Document: require('../../src/core/document.js'),
    Lifecycle: require('../../src/core/lifecycle.js'),
    Patch: require('../../src/core/patch.js'),
    Reconciler: require('../../src/core/reconciler.js'),
    Renderer: require('../../src/core/renderer.js'),
    Sandbox: require('../../src/core/sandbox.js'),
    Service: require('../../src/core/service.js'),
    Template: require('../../src/core/template.js'),
    VirtualDOM: require('../../src/core/virtual-dom.js'),
    utils: require('../../src/core/utils.js'),
  });

  global.opr = {
    Toolkit: new Toolkit(),
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

  global.MutationObserver = class {

    observe() {
    }
  };
}
