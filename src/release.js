{
  require.prefix('core', 'src/');

  const get = componentPath => resolve(Symbol.for(componentPath));

  const {
    SUPPORTED_ATTRIBUTES,
    SUPPORTED_EVENTS,
    SUPPORTED_STYLES,
    SUPPORTED_FILTERS,
    SUPPORTED_TRANSFORMS
  } = get('core/consts');
  const {
    VirtualNode, Root, Component, VirtualElement, Comment,
  } = get('core/core-types');

  const App = get('core/app');
  const Store = get('core/store');
  const Template = get('core/template');
  const ComponentTree = get('core/component-tree');
  const ComponentLifecycle = get('core/component-lifecycle');
  const Diff = get('core/diff');
  const Patch = get('core/patch');
  const Reconciler = get('core/reconciler');
  const Document = get('core/document');
  const utils = get('core/utils');
  const create = root => new App(root);

  const Reactor = {
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

    debug: false,
    ready: () => Promise.resolve(),
  };
  Object.freeze(Reactor);

  window.Reactor = Reactor;
  window.$ = id => document.getElementById(id);
}