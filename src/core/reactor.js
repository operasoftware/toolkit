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
      const {
        VirtualNode, Root, Component, VirtualElement, Comment,
      } = await require('core/core-types');

      const App = await require('core/app');
      const Store = await require('core/store');
      const Template = await require('core/template');
      const ComponentTree = await require('core/component-tree');
      const Diff = await require('core/diff');
      const Patch = await require('core/patch');
      const Reconciler = await require('core/reconciler');
      const Document = await require('core/document');
      const {
        combineReducers, create, utils
      } = await require('core/utils');

      return {
        // constants
        SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS,
        SUPPORTED_STYLES, SUPPORTED_FILTERS, SUPPORTED_TRANSFORMS,
        // core classes
        Store, App, ComponentTree, Document,
        Diff, Patch, Reconciler, Template,
        // core types
        VirtualNode, Root, Component, VirtualElement, Comment,
        // utils
        combineReducers, create, utils
      };
    }
  };

  module.exports = core;
}
