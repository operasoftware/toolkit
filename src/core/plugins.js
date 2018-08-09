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
  /* String key to Plugin map. */
  const plugins = new Map();

  class Plugin {

    constructor(manifest) {
      opr.Toolkit.assert(
          typeof manifest.name === 'string', 'Plugin name is missing!');
      const sandbox = this.createSandbox(manifest.permissions);
      Object.assign(this, manifest);
      if (typeof manifest.register === 'function') {
        this.register = () => manifest.register(sandbox);
      }
      if (typeof manifest.install === 'function') {
        this.install = async root => {
          const uninstall = await manifest.install(root);
          opr.Toolkit.assert(
              typeof uninstall === 'function',
              'The plugin installation must return the uninstall function!');
          return uninstall;
        }
      }
    }

    createSandbox(permissions = []) {
      const sandbox = {};
      for (const permission of permissions) {
        switch (permission) {
          case 'register-method':
            sandbox.registerMethod = name =>
                opr.Toolkit.Sandbox.registerPluginMethod(name);
        }
      }
      return sandbox;
    }
  }

  class Plugins {

    /*
     * Registers the plugins globally.
     */
    static async register(manifests) {
      for (const manifest of manifests) {
        if (plugins.has(manifest.name)) {
          throw new Error(`Plugin '${manifest.name}' is already registered!`);
        }
        const plugin = new Plugin(manifest);
        if (plugin.register) {
          await plugin.register();
        }
        plugins.set(plugin.name, plugin);
      }
    }

    /*
     * Installs the plugins onto the root component.
     * Returns the uninstall function.
     */
    static async install(root) {
      const uninstalls = [];
      for (const plugin of plugins.values()) {
        if (plugin.install) {
          const uninstall = await plugin.install(root);
          uninstalls.push(uninstall);
        }
      }
      return () => uninstalls.forEach(uninstall => uninstall());
    }
  }

  module.exports = Plugins;
}
