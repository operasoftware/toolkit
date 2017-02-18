{
  const core = {

    init: async () => {
      const {
        SUPPORTED_ATTRIBUTES,
        SUPPORTED_EVENTS,
        SUPPORTED_STYLES,
        SUPPORTED_FILTERS,
        SUPPORTED_TRANSFORMS
      } = await require('core/consts');
      const App = await require('core/app');
      const Component = await require('core/component');
      const Store = await require('core/store');
      const Renderer = await require('core/renderer');
      const VirtualNode = await require('core/virtual-node');
      const VirtualDOM = await require('core/virtual-dom');
      const ComponentTree = await require('core/component-tree');
      const Diff = await require('core/diff');
      const Patch = await require('core/patch');
      const Reconciler = await require('core/reconciler');
      const Document = await require('core/document');
      const { combineReducers, create } = await require('core/utils');

      return {
        // constants
        SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS,
        SUPPORTED_STYLES, SUPPORTED_FILTERS, SUPPORTED_TRANSFORMS,
        // core classes
        Component, Renderer, Store,
        // structure
        App, VirtualNode, VirtualDOM,
        ComponentTree, Diff, Patch, Reconciler, Document,
        // utils
        combineReducers, create
      };
    }
  };

  module.exports = core;
}
