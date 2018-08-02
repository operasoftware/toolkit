/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
