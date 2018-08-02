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
  const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

  let initialize;

  class Toolkit {

    constructor() {
      this.settings = null;
      this.readyPromise = new Promise(resolve => {
        initialize = resolve;
      });
    }

    async ready() {
      await this.readyPromise;
    }

    async configure(options) {
      const settings = {};
      settings.plugins = options.plugins || [];
      settings.level =
          LOG_LEVELS.includes(options.level) ? options.level : 'info';
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
      this.registerPlugins();
      initialize();
    }

    registerPlugins() {
      const context = {
        registerComponentMethod: name =>
            opr.Toolkit.Sandbox.registerPluginMethod(name),
      };
      for (const plugin of this.settings.plugins) {
        if (typeof plugin.register === 'function') {
          plugin.register(context);
        }
      }
    }

    isDebug() {
      return Boolean(this.settings) && this.settings.debug;
    }

    assert(condition, ...messages) {
      if (this.isDebug()) {
        console.assert(condition, ...messages);
      }
      if (!condition) {
        throw new Error(messages.join(' '));
      }
    }

    warn(...messages) {
      if (this.isDebug()) {
        console.warn(...messages);
      }
    }

    getBundleName(root) {
      if (typeof root === 'symbol') {
        root = String(this.symbol).slice(7, -1);
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
      await this.ready();
      const RootClass = await this.getRootClass(component, props);
      const root = new RootClass(null, props, this.settings);
      root.mount(container);
      await root.ready;
      return root;
    }

    noop() {
    }
  }

  module.exports = Toolkit;
}
