{
  const core = {

    init: async () => {
      const {
        SUPPORTED_ATTRIBUTES,
        SUPPORTED_EVENTS,
        SUPPORTED_STYLES,
        SUPPORTED_FILTERS,
        SUPPORTED_TRANSFORMS
      } = await loader.require('core/consts');
      const {
        VirtualNode, Root, Component, VirtualElement, Comment,
      } = await loader.require('core/core-types');

      const App = await loader.require('core/app');
      const Store = await loader.require('core/store');
      const Template = await loader.require('core/template');
      const ComponentTree = await loader.require('core/component-tree');
      const ComponentLifecycle = await loader.require('core/component-lifecycle');
      const Diff = await loader.require('core/diff');
      const Patch = await loader.require('core/patch');
      const Reconciler = await loader.require('core/reconciler');
      const Document = await loader.require('core/document');
      const utils = await loader.require('core/utils');
      const DevToolsHook = await loader.require('core/devtools-hook');

      const create = root =>  {
        const app = new App(root);
        DevToolsHook.registerApp(app);
        return app;
      };

      return {
        // constants
        SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS,
        SUPPORTED_STYLES, SUPPORTED_FILTERS, SUPPORTED_TRANSFORMS,
        // core classes
        Store, App, ComponentTree, ComponentLifecycle, Document,
        Diff, Patch, Reconciler, Template,
        // core types
        VirtualNode, Root, Component, VirtualElement, Comment,
        // utils
        utils, create,
        // dev tools
        __devtools_hook__: DevToolsHook,
      };
    }
  };

  module.exports = core;
}
