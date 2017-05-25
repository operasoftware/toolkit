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
  const Sandbox = loader.get('core/sandbox');
  const Store = loader.get('core/store');
  const Template = loader.get('core/template');
  const ComponentTree = loader.get('core/component-tree');
  const ComponentLifecycle = loader.get('core/component-lifecycle');
  const Diff = loader.get('core/diff');
  const Patch = loader.get('core/patch');
  const Reconciler = loader.get('core/reconciler');
  const Document = loader.get('core/document');
  const utils = loader.get('core/utils');

  // config
  const settings = {};

  let init;
  const readyPromise = new Promise(resolve => {
    init = resolve;
  });

  const ready = async () => {
    await readyPromise;
  };

  const configure = config => {
    settings.debug = config.debug || false;
    settings.preload = config.preload || false;
    settings.bundles = config.bundles || [];
    settings.bundleRootPath = config.bundleRootPath || '';
    init();
  };

  const create = root => new App(root, settings);

  const Toolkit = {
    // constants
    SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS,
    SUPPORTED_STYLES, SUPPORTED_FILTERS, SUPPORTED_TRANSFORMS,
    // core classes
    Store, App, ComponentTree, ComponentLifecycle, Document,
    Diff, Patch, Reconciler, Template, Sandbox,
    // core types
    VirtualNode, Root, Component, VirtualElement, Comment,
    // utils
    utils, create, configure, ready,
  };
  // Object.freeze(Toolkit);

  window.opr = window.opr || {};
  window.opr.Toolkit = Toolkit;
}
