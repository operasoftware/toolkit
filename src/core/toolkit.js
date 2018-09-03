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

{
  const INIT = Symbol('init');

  class Toolkit {

    constructor() {
      this.roots = new Set();
      this.settings = null;
      this.ready = new Promise(resolve => {
        this[INIT] = resolve;
      });
      this.assert = console.assert;
    }

    async configure(options) {
      const settings = {};
      settings.debug = options.debug || false;
      const bundleOptions = options.bundles || {};
      settings.bundles = {
        rootPath: bundleOptions.rootPath || '',
        mapping: bundleOptions.mapping || [],
        preloaded: bundleOptions.preloaded || [],
      };
      Object.freeze(settings);
      this.settings = settings;
      if (!settings.debug) {
        for (const module of settings.bundles.preloaded) {
          await this.preload(module);
        }
      }
      this.plugins = this.createPlugins(options.plugins);
      this[INIT](true);
    }

    createPlugins(manifests = []) {
      const plugins = new opr.Toolkit.Plugins(null);
      for (const manifest of manifests) {
        plugins.register(manifest);
      }
      return plugins;
    }

    track(root) {
      this.roots.add(root);
    }

    stopTracking(root) {
      this.roots.delete(root);
    }

    get tracked() {
      const tracked = [];
      for (const root of this.roots) {
        tracked.push(root, ...root.tracked);
      }
      return tracked;
    }

    isDebug() {
      return Boolean(this.settings && this.settings.debug);
    }

    warn(...messages) {
      if (this.isDebug()) {
        console.warn(...messages);
      }
    }

    getBundleName(root) {
      if (typeof root === 'symbol') {
        root = String(root).slice(7, -1);
      }
      const bundle =
          this.settings.bundles.mapping.find(entry => entry.root === root);
      if (bundle) {
        return bundle.name;
      }
      return null;
    }

    async preload(symbol) {
      if (this.settings.debug) {
        await loader.foreload(symbol);
      } else {
        const bundle = this.getBundleName(symbol);
        if (bundle) {
          await loader.require(`${this.settings.bundles.rootPath}/${bundle}`);
        } else {
          await loader.foreload(symbol);
        }
      }
    }

    async getRootClass(component, props) {
      const type = typeof component;
      switch (type) {
        case 'string':
        case 'symbol':
          await this.preload(component);
          const module = loader.get(component);
          this.assert(
              module.prototype instanceof opr.Toolkit.Root,
              'Module has to be an instance of opr.Toolkit.Root');
          return module;
        case 'function':
          if (component.prototype instanceof opr.Toolkit.Root) {
            return component;
          }
          return class Anonymous extends opr.Toolkit.Root {
            render() {
              return component(this.props);
            }
          };
        default:
          throw new Error(`Invalid component type: ${type}`);
      }
    }

    async render(component, container, props = {}) {
      await this.ready;
      const RootClass = await this.getRootClass(component, props);
      const root = new RootClass(null, props, this);
      this.track(root);
      root.mount(container);
      await root.ready;
      return root;
    }

    async create(options = {}) {
      const toolkit = new Toolkit();
      await toolkit.configure(options);
      return toolkit;
    }

    noop() {
    }
  }

  module.exports = Toolkit;
}
