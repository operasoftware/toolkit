/*
Copyright 2017-2019 Opera Software AS

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
  const Permission = {
    LISTEN_FOR_UPDATES: 'listen-for-updates',
    REGISTER_METHOD: 'register-method',
    INJECT_STYLESHEETS: 'inject-stylesheets',
  };

  class Plugin {

    constructor(manifest) {

      opr.Toolkit.assert(
          typeof manifest.name === 'string' && manifest.name.length,
          'Plugin name must be a non-empty string!');

      Object.assign(this, manifest);
      this.origin = manifest;

      if (this.permissions === undefined) {
        this.permissions = [];
      } else {
        opr.Toolkit.assert(
            Array.isArray(this.permissions),
            'Plugin permissions must be an array');
        this.permissions = this.permissions.filter(
            permission => Object.values(Permission).includes(permission));
      }

      const sandbox = this.createSandbox();
      if (typeof manifest.register === 'function') {
        this.register = () => manifest.register(sandbox);
      }
      if (typeof manifest.install === 'function') {
        this.install = root => {
          const uninstall = manifest.install(root);
          opr.Toolkit.assert(
              typeof uninstall === 'function',
              'The plugin installation must return the uninstall function!');
          return uninstall;
        }
      }
    }

    isListener() {
      return this.permissions.includes(Permission.LISTEN_FOR_UPDATES);
    }

    isStylesheetProvider() {
      return this.permissions.includes(Permission.INJECT_STYLESHEETS);
    }

    createSandbox() {
      const sandbox = {};
      for (const permission of this.permissions) {
        switch (permission) {
          case Permission.REGISTER_METHOD:
            sandbox.registerMethod = name =>
                opr.Toolkit.Sandbox.registerPluginMethod(name);
        }
      }
      return sandbox;
    }
  }

  class Registry {

    constructor() {
      this.plugins = new Map();
      this.cache = {
        listeners: [],
      };
      this[Symbol.iterator] = () => this.plugins.values()[Symbol.iterator]();
    }

    /*
     * Adds the plugin to the registry
     */
    add(plugin) {
      opr.Toolkit.assert(
          !this.isRegistered(plugin.name),
          `Plugin '${plugin.name}' is already registered!`);
      this.plugins.set(plugin.name, plugin);
      this.updateCache();
    }

    /*
     * Removes plugin from the registry with the specified name.
     * Returns the uninstall function if present.
     */
    remove(name) {
      const plugin = this.plugins.get(name);
      opr.Toolkit.assert(
          plugin, `No plugin found with the specified name: "${name}"`);
      this.plugins.delete(name);
      this.updateCache();
      const uninstall = this.uninstalls.get(name);
      if (uninstall) {
        this.uninstalls.delete(name);
        return uninstall;
      }
      return null;
    }

    /*
     * Checks if plugin with specified name exists in the registry.
     */
    isRegistered(name) {
      return this.plugins.has(name);
    }

    /*
     * Updates the cache.
     */
    updateCache() {
      const plugins = [...this.plugins.values()];
      this.cache.listeners = plugins.filter(plugin => plugin.isListener());
    }

    /*
     * Clears the registry and the cache.
     */
    clear() {
      this.plugins.clear();
      this.uninstalls.clear();
      this.cache.listeners.length = 0;
    }
  }

  class Plugins {

    constructor(root) {
      this.root = root;
      this.registry = new Registry();
      this.uninstalls = new Map();
      this[Symbol.iterator] = () => this.registry[Symbol.iterator]();
    }

    /*
     * Creates a Plugin instance from the manifest object and registers it.
     */
    register(plugin) {
      if (!(plugin instanceof Plugin)) {
        plugin = new Plugin(plugin);
      }
      if (plugin.register) {
        plugin.register();
      }
      this.registry.add(plugin);
    }

    installAll() {
      for (const plugin of this.registry) {
        this.install(plugin);
      }
    }

    install(plugin) {
      if (this.root && plugin.install) {
        const uninstall = plugin.install(this.root);
        this.uninstalls.set(plugin.name, uninstall);
      }
    }

    /*
     * Removes the plugin from the registry and invokes it's uninstall method
     * if present.
     */
    uninstall(name) {
      const uninstall = this.uninstalls.get(name);
      if (uninstall) {
        uninstall();
      }
    }

    /*
     * Uninstalls all the plugins from the registry.
     */
    async destroy() {
      for (const plugin of this.registry) {
        this.uninstall(plugin.name);
      }
      this.root = null;
    }

    /*
     * Invokes listener methods on registered listener plugins.
     */
    notify(action, event) {
      switch (action) {
        case 'before-update':
          for (const listener of this.registry.cache.listeners) {
            listener.onBeforeUpdate(event);
          }
          return;
        case 'after-update':
          for (const listener of this.registry.cache.listeners) {
            listener.onAfterUpdate(event);
          }
          return;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }
  }

  Plugins.Plugin = Plugin;

  module.exports = Plugins;
}
