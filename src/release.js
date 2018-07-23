{
  const Toolkit = loader.get('core/toolkit');

  const consts = loader.get('core/consts');
  const nodes = loader.get('core/nodes');

  Object.assign(Toolkit.prototype, consts, nodes, {
    Diff: loader.get('core/diff'),
    Lifecycle: loader.get('core/lifecycle'),
    Patch: loader.get('core/patch'),
    Plugins: loader.get('core/plugins'),
    Reconciler: loader.get('core/reconciler'),
    Renderer: loader.get('core/renderer'),
    Sandbox: loader.get('core/sandbox'),
    Service: loader.get('core/service'),
    Template: loader.get('core/template'),
    VirtualDOM: loader.get('core/virtual-dom'),
    utils: loader.get('core/utils'),
  });

  window.opr = window.opr || {};
  window.opr.Toolkit = new Toolkit();
}
