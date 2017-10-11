{
  class Renderer {

    constructor(container, settings, root) {
      this.container = container;
      this.settings = settings;
      this.root = root;
      this.plugins = new Map();
      this.installPlugins();
    }

    calculatePatches(command, prevState, nextState) {
      const patches = [];
      if (prevState === null) {
        patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
      }
      if (!opr.Toolkit.Diff.deepEqual(prevState, nextState)) {
        patches.push(opr.Toolkit.Patch.updateComponent(this.root, nextState));
        const componentTree =
            opr.Toolkit.VirtualDOM.createChildTree(this.root, this.root.child);
        const childTreePatches = opr.Toolkit.Diff.calculate(
            this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    updateDOM(command, prevState, nextState) {
      /* eslint-disable no-console */
      if (this.settings.level === 'debug') {
        console.time('=> Render time');
      }
      const patches = this.calculatePatches(command, prevState, nextState);
      if (patches.length) {
        opr.Toolkit.Lifecycle.beforeUpdate(patches);
        for (const patch of patches) {
          patch.apply();
        }
        opr.Toolkit.Lifecycle.afterUpdate(patches);
      }
      if (this.settings.level === 'debug') {
        console.log(
            'Command:', command.type, 'for', this.root.constructor.name);
        if (patches.length) {
          console.log('Patches:', patches.length);
        }
        console.timeEnd('=> Render time');
        console.log(''.padStart(48, '-'));
      }
      /* eslint-enable no-console */
    }

    installPlugins() {
      for (const plugin of this.settings.plugins) {
        if (this.plugins.get(plugin.id)) {
          console.warn(`Plugin "${id}" is already installed!`);
          return;
        }
        const uninstall = plugin.install({
          container: this.container,
        });
        this.plugins.set(plugin.id, {
          ref: plugin,
          uninstall,
        });
      }
    }
  }

  module.exports = Renderer;
}
