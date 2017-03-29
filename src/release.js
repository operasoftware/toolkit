{
  loader.prefix('core', '/src/');

  const {
    SUPPORTED_ATTRIBUTES,
    SUPPORTED_EVENTS,
    SUPPORTED_STYLES,
    SUPPORTED_FILTERS,
    SUPPORTED_TRANSFORMS
  } = loader.get('core/consts');
  const {
    VirtualNode, Root, Component, VirtualElement, Comment,
  } = loader.get('core/core-types');

  const App = loader.get('core/app');
  const Store = loader.get('core/store');
  const Template = loader.get('core/template');
  const ComponentTree = loader.get('core/component-tree');
  const ComponentLifecycle = loader.get('core/component-lifecycle');
  const Diff = loader.get('core/diff');
  const Patch = loader.get('core/patch');
  const Reconciler = loader.get('core/reconciler');
  const Document = loader.get('core/document');
  const utils = loader.get('core/utils');
  const DevToolsHook = loader.get('core/devtools-hook');

  const create = root => {
    const app = new App(root);
    DevToolsHook.registerApp(app);
    return app;
  };

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
    // devtools
    __devtools_hook__: DevToolsHook,

    debug: false,
    ready: () => Promise.resolve(),
  };
  Object.freeze(Reactor);

  window.Reactor = Reactor;
  window.$ = id => document.getElementById(id);
}
