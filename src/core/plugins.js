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
