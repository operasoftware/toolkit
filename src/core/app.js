{
  const ID = Symbol('id');

  const registerMutationObserver = (container, root) => {
    const observer = new MutationObserver(mutations => {
      const isContainerRemoved = mutations.find(
          mutation => [...mutation.removedNodes].find(
              node => node === container));
      if (isContainerRemoved) {
        opr.Toolkit.ComponentLifecycle.onComponentDestroyed(root);
        opr.Toolkit.ComponentLifecycle.onComponentDetached(root);
      }
    });
    if (container.parentElement) {
      observer.observe(container.parentElement, {
        childList: true,
      });
    }
  };

  class App {

    constructor(path, settings) {
      this[ID] = opr.Toolkit.utils.createUUID();
      this.symbol = this.getSymbol(path);
      this.settings = settings;
      this.preloaded = false;
      this.state = null;
      this.plugins = new Map();
    }

    getSymbol(path) {
      const type = typeof path;
      switch (type) {
        case 'symbol':
          return path;
        case 'string':
          return Symbol.for(path);
        default:
          throw new Error(`Invalid path: ${path}`);
      }
    }

    get id() {
      return this[ID];
    }

    async preload() {
      if (this.preloaded) {
        return;
      }
      await loader.foreload(this.symbol);
      this.preloaded = true;
    }

    getBundleName() {
      for (const bundle of this.settings.bundles) {
        if (bundle.root === String(this.symbol).slice(7, -1)) {
          return bundle.name;
        }
      }
      return null;
    }

    async loadBundle(bundle) {
      await loader.require(`${this.settings.bundleRootPath}/${bundle}`);
      this.preloaded = true;
    }

    install(plugin) {
      if (this.plugins.get(plugin.id)) {
        console.warn(`Plugin "${id}" is already installed!`);
        return;
      }
      const uninstall = plugin.install({
        container: this.container,
        state: this.state,
      });
      this.plugins.set(plugin.id, {
        ref: plugin,
        uninstall,
      });
    }

    async render(container, defaultProps = {}) {

      await opr.Toolkit.ready();

      this.container = container;

      if (this.settings.debug) {
        if (this.settings.preload) {
          await this.preload();
        }
      } else {
        const bundle = this.getBundleName();
        if (bundle) {
          await this.loadBundle(bundle);
        }
      }

      const RootClass = await loader.resolve(this.symbol);
      if (!this.preloaded && RootClass.init) {
        await RootClass.init();
      }
      this.dispatch = command => {
        this.state = this.reducer(this.state, command);
        this.updateDOM();
      };
      opr.Toolkit.assert(
          RootClass.prototype instanceof opr.Toolkit.Root,
          'Root component class', RootClass.name,
          'must extends opr.Toolkit.Root');
      this.root = new RootClass(container, this.dispatch);

      this.reducer =
          opr.Toolkit.utils.combineReducers(...this.root.getReducers());
      const commands = opr.Toolkit.utils.createCommandsDispatcher(
          this.reducer, this.dispatch);
      this.root.commands = commands;
      this.commands = commands;
      const state =
          await this.root.getInitialState.call(this.root.sandbox, defaultProps);
      this.root.dispatch(this.reducer.commands.init(state));

      for (const plugin of this.settings.plugins) {
        this.install(plugin);
      }
      registerMutationObserver(container, this.root);
    }

    calculatePatches() {
      const patches = [];
      if (!opr.Toolkit.Diff.deepEqual(this.state, this.root.props)) {
        if (this.root.props === undefined) {
          patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
        }
        patches.push(opr.Toolkit.Patch.updateComponent(this.root, this.state));
        const componentTree = opr.Toolkit.ComponentTree.createChildTree(
            this.root, this.state, this.root.child);
        const childTreePatches = opr.Toolkit.Diff.calculate(
            this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    async updateDOM() {
      if (this.settings.level === 'debug') {
        console.time('=> Render');
      }
      const patches = this.calculatePatches();
      opr.Toolkit.ComponentLifecycle.beforeUpdate(patches);
      for (const patch of patches) {
        patch.apply();
      }
      opr.Toolkit.ComponentLifecycle.afterUpdate(patches);
      if (this.settings.level === 'debug') {
        console.log('Patches:', patches.length);
        console.timeEnd('=> Render');
      }
    }
  }

  module.exports = App;
}
