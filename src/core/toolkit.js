{
  class Toolkit {

    static async init() {
      const {
        SUPPORTED_ATTRIBUTES,
        SUPPORTED_EVENTS,
        SUPPORTED_STYLES,
        SUPPORTED_FILTERS,
        SUPPORTED_TRANSFORMS
      } = await loader.require('core/consts');
      const {
        VirtualNode,
        Root,
        Component,
        VirtualElement,
        Comment,
      } = await loader.require('core/core-types');

      const App = await loader.require('core/app');
      const Sandbox = await loader.require('core/sandbox');
      const Template = await loader.require('core/template');
      const ComponentTree = await loader.require('core/component-tree');
      const ComponentLifecycle =
          await loader.require('core/component-lifecycle');
      const Diff = await loader.require('core/diff');
      const Patch = await loader.require('core/patch');
      const Reconciler = await loader.require('core/reconciler');
      const Document = await loader.require('core/document');
      const utils = await loader.require('core/utils');
      const create = root => new App(root);

      const isDebug = () => false;
      const assert = () => {};
      const warn = () => {};

      const ready = async () => {};

      return {
        // constants
        SUPPORTED_ATTRIBUTES,
        SUPPORTED_EVENTS,
        SUPPORTED_STYLES,
        SUPPORTED_FILTERS,
        SUPPORTED_TRANSFORMS,
        // core classes
        App,
        ComponentTree,
        ComponentLifecycle,
        Document,
        Diff,
        Patch,
        Reconciler,
        Template,
        Sandbox,
        // core types
        VirtualNode,
        Root,
        Component,
        VirtualElement,
        Comment,
        // utils
        utils,
        create,
        isDebug,
        assert,
        warn,
        ready,
      };
    }
  };

  module.exports = Toolkit;
}
