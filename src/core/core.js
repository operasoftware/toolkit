{
  let Component, Reducer, Renderer, Store, App;
  let VirtualDOM, VirtualNode;

  const Reactor = class {

    static create(component) {
      return new App(component);
    }
  };

  module.exports = {

    init: async () => {
      Component = await require('core/component');
      Reducer = await require('core/reducer');
      Renderer = await require('core/reducer');
      Store = await require('core/store');
      App = await require('core/app');
      VirtualNode = await require('core/virtual-node');
      VirtualDOM = await require('core/virtual-dom');

      window.addEventListener('DOMContentLoaded', () => {
        window.SUPPORTED_STYLES = [...getComputedStyle(document.body)]
          .map(name => name.toLowerCase().replace(/-(.)/g, (match, group1) => group1.toUpperCase()));
      }, false);

      return Reactor;
    },

    reactor: Reactor
  };
}
