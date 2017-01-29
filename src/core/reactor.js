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
      const { combineReducers, create, construct, instantiate } = await require('core/utils');

      return {
        // constants
        SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS, SUPPORTED_STYLES,
        // core classes
        Component, Renderer, Store, App, VirtualNode, VirtualDOM,
        // utils
        combineReducers, create, construct, instantiate
      };
    }
  };

  module.exports = core;
}
