{
  class Renderer {

    constructor(root, container, settings) {
      this.root = root;
      this.container = container;
      this.settings = settings;
      this.plugins = new Map();
      this.installPlugins();
    }

    calculatePatches() {
      const patches = [];
      if (!opr.Toolkit.Diff.deepEqual(this.root.state, this.root.props)) {
        if (this.root.props === undefined) {
          patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
        }
        patches.push(
            opr.Toolkit.Patch.updateComponent(this.root, this.root.state));
        const componentTree = opr.Toolkit.VirtualDOM.createChildTree(
            this.root, this.root.state, this.root.child);
        const childTreePatches = opr.Toolkit.Diff.calculate(
            this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    updateDOM() {
      /* eslint-disable no-console */
      if (this.settings.level === 'debug') {
        console.time('=> Render');
      }
      const patches = this.calculatePatches();
      opr.Toolkit.Lifecycle.beforeUpdate(patches);
      for (const patch of patches) {
        patch.apply();
      }
      opr.Toolkit.Lifecycle.afterUpdate(patches);
      if (this.settings.level === 'debug') {
        console.log('Patches:', patches.length);
        console.timeEnd('=> Render');
      }
      /* eslint-enable no-console */
    }

    installPlugins() {
      for (const plugin of this.settings.plugins) {
        this.install(plugin);
      }
    }

    install(plugin) {
      if (this.plugins.get(plugin.id)) {
        console.warn(`Plugin "${id}" is already installed!`);
        return;
      }
      const uninstall = plugin.install({
        container: this.container,
        state: this.root.state,
      });
      this.plugins.set(plugin.id, {
        ref: plugin,
        uninstall,
      });
    }
  }

  module.exports = Renderer;
}
