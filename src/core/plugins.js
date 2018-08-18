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
  const Permission = {
    LISTEN_FOR_UPDATES: 'listen-for-updates',
    REGISTER_METHOD: 'register-method',
  };

  class Plugin {

    constructor(manifest) {
      opr.Toolkit.assert(
          typeof manifest.name === 'string' && manifest.name.length,
          'Plugin name must be a non-empty string!');

      Object.assign(this, manifest);

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
        this.install = async root => {
          const uninstall = await manifest.install(root);
          opr.Toolkit.assert(
              typeof uninstall === 'function',
              'The plugin installation must return the uninstall function!');
          this.uninstall = uninstall;
        }
      }
    }

    isListener() {
      return this.permissions.includes(Permission.LISTEN_FOR_UPDATES);
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
      this.plugins = [];
      this.cache = {
        listeners: [],
      };
      this[Symbol.iterator] = () => this.plugins[Symbol.iterator]();
    }

    add(plugin) {
      opr.Toolkit.assert(
          !this.isRegistered(plugin.name),
          `Plugin '${plugin.name}' is already registered!`);
      this.plugins.push(plugin);
      this.updateCache();
    }

    isRegistered(name) {
      return Boolean(this.plugins.find(plugin => plugin.name === name));
    }

    updateCache() {
      this.cache.listeners = this.plugins.filter(plugin => plugin.isListener());
    }

    clear() {
      this.plugins.length = 0;
      this.cache.listeners.length = 0;
    }
  }

  class Plugins {

    constructor(root) {
      this.root = root;
      this.registry = new Registry();
      this[Symbol.iterator] = () => this.registry[Symbol.iterator]();
    }

    async inherit(origin) {
      for (const plugin of origin.plugins) {
        await this.install(plugin);
      }
    }

    /*
     * Creates a Plugin from the manifest object and installs it.
     */
    async plugIn(manifest) {
      const plugin = new Plugin(manifest);
      if (plugin.register) {
        await plugin.register();
      }
      return this.install(plugin);
    }

    /*
     * Adds the plugin to the registry and invokes plugin's
     * install method if it is present.
     */
    async install(plugin) {
      this.registry.add(plugin);
      if (this.root && plugin.install) {
        await plugin.install(this.root);
      }
    }

    uninstall() {
      for (const plugin of this.registry) {
        if (plugin.uninstall) {
          plugin.uninstall();
        }
      }
      this.registry.clear();
    }

    notify(action, event) {
      switch (action) {
        case 'before-update':
          for (const listener of this.registry.cache.listeners) {
            listener.onBeforeUpdate(event);
          }
          return;
        case 'update':
          for (const listener of this.registry.cache.listeners) {
            listener.onUpdate(event);
          }
          return;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }
  }

  module.exports = Plugins;
}
