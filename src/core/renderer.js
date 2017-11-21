{
  class Renderer {

    constructor(root, settings) {
      this.settings = settings;
      this.root = root;
      this.plugins = new Map();
      this.installPlugins();
    }

    static render(component) {

      const template = component.render.call(component.sandbox);

      opr.Toolkit.assert(
          template !== undefined,
          'Invalid undefined template returned when rendering:', component);

      return opr.Toolkit.Template.describe(template);
    }

    updateDOM(command, prevState, nextState) {
      if (this.debug) {
        /* eslint-disable no-console */
        console.time('=> Render time');
        const patches = this.update(prevState, nextState);
        console.log(
            'Command:', command.type,
            `for "${this.root.constructor.displayName}"`);
        if (patches.length) {
          console.log('%cPatches:', 'color: hsl(54, 70%, 45%)', patches);
        } else {
          console.log('%c=> No update', 'color: #07a707');
        }
        console.timeEnd('=> Render time');
        console.log(''.padStart(48, '-'));
        /* eslint-enable no-console */
      } else {
        this.update(prevState, nextState);
      }
    }

    update(prevState, nextState) {

      const {Diff, Lifecycle, VirtualDOM} = opr.Toolkit;

      if (Diff.deepEqual(prevState, nextState)) {
        return [];
      }

      this.root.state =
          VirtualDOM.normalizeProps(this.root.constructor, nextState);

      const diff = new Diff(this.root);
      const initial = this.root.description === undefined;
      const patches = diff.rootPatches(prevState, nextState, initial);

      if (patches.length) {
        Lifecycle.beforeUpdate(patches);
        for (const patch of patches) {
          patch.apply();
        }
        Lifecycle.afterUpdate(patches);
      }

      return patches;
    }

    installPlugins() {
      if (!this.settings || !this.settings.plugins) {
        return;
      }
      for (const plugin of this.settings.plugins) {
        if (this.plugins.get(plugin.id)) {
          console.warn(`Plugin "${id}" is already installed!`);
          return;
        }
        const uninstall = plugin.install({
          container: this.root.container,
          root: this.root,
        });
        this.plugins.set(plugin.id, {
          ref: plugin,
          uninstall,
        });
      }
    }

    get debug() {
      return this.settings.level === 'debug';
    }
  }

  module.exports = Renderer;
}
