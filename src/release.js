/*
Copyright 2017-2020 Opera Software AS

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

{
  const Toolkit = loader.get('core/toolkit');
  const nodes = loader.get('core/nodes');

  Object.assign(Toolkit.prototype, nodes, {
    Browser: loader.get('core/browser'),
    Description: loader.get('core/description'),
    Diff: loader.get('core/diff'),
    Dispatcher: loader.get('core/dispatcher'),
    Lifecycle: loader.get('core/lifecycle'),
    Patch: loader.get('core/patch'),
    Plugins: loader.get('core/plugins'),
    Reconciler: loader.get('core/reconciler'),
    Renderer: loader.get('core/renderer'),
    Sandbox: loader.get('core/sandbox'),
    Service: loader.get('core/service'),
    Reducers: loader.get('core/reducers'),
    Template: loader.get('core/template'),
    VirtualDOM: loader.get('core/virtual-dom'),
    utils: loader.get('core/utils'),
    noop: () => {},
  });

  const scope = typeof window === 'undefined' ? global : window;
  scope.opr = scope.opr || {};
  scope.opr.Toolkit = new Toolkit();
}
