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
  class Plugins {

    constructor(root) {
      this.root = root;
      this.installed = new Map();
    }

    async installAll(plugins = []) {
      for (const plugin of plugins) {
        await this.install(plugin);
      }
    }

    async install(plugin) {
      if (this.installed.get(plugin.id)) {
        console.warn(`Plugin "${id}" is already installed!`);
        return;
      }
      const uninstall = await plugin.install({
        container: this.root.container,
        root: this.root,
      });
      this.installed.set(plugin.id, {
        ref: plugin,
        uninstall,
      });
    }
  }

  module.exports = Plugins;
}
