{
  const core = {

    init: async () => {
      const {
        SUPPORTED_ATTRIBUTES,
        SUPPORTED_EVENTS,
        SUPPORTED_STYLES
      } = await require('core/consts');
      const App = await require('core/app');
      const Component = await require('core/component');
      const Store = await require('core/store');
      const Renderer = await require('core/renderer');
      const VirtualNode = await require('core/virtual-node');
      const VirtualDOM = await require('core/virtual-dom');
      const ComponentTree = await require('core/component-tree');
      const { combineReducers, create } = await require('core/utils');

      return {
        // constants
        SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS, SUPPORTED_STYLES,
        // core classes
        Component, Renderer, Store,
        // structure
        App, VirtualNode, VirtualDOM, ComponentTree,
        // utils
        combineReducers, create
      };
    }
  };

  module.exports = core;
}
