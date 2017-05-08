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
  const create = root => new App(root);

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
    utils, create,

    debug: false,
    ready: async () => {
      opr.Toolkit.SUPPORTED_STYLES.push(...Object.keys(document.body.style));
    },
  };
  Object.freeze(Toolkit);

  window.opr = window.opr || {};
  window.opr.Toolkit = Toolkit;
}
