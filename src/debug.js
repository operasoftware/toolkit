window.loadToolkit = async () => {

  const Toolkit = await loader.require('core/toolkit');

  const consts = await loader.require('core/consts');
  const nodes = await loader.require('core/nodes');

  Object.assign(Toolkit.prototype, consts, nodes, {
    Diff: await loader.require('core/diff'),
    Lifecycle: await loader.require('core/lifecycle'),
    Patch: await loader.require('core/patch'),
    Plugins: await loader.require('core/plugins'),
    Reconciler: await loader.require('core/reconciler'),
    Renderer: await loader.require('core/renderer'),
    Sandbox: await loader.require('core/sandbox'),
    Service: await loader.require('core/service'),
    Template: await loader.require('core/template'),
    VirtualDOM: await loader.require('core/virtual-dom'),
    utils: await loader.require('core/utils'),
  });

  window.opr = window.opr || {};
  window.opr.Toolkit = new Toolkit();
};
