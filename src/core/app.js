{
  const ID = Symbol('id');

  class App {

    constructor(path, settings) {
      this[ID] = opr.Toolkit.utils.createUUID();
      this.symbol = this.getSymbol(path);
      this.settings = settings;
      this.preloaded = false;
      this.store = new opr.Toolkit.Store();
    }

    getSymbol(path) {
      const type = typeof path;
      switch (type) {
        case 'symbol':
          return path;
        case 'string':
          return loader.symbol(path);
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
      await loader.preload(this.symbol, true);
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

    async render(container) {

      await opr.Toolkit.ready();

      this.container = container;
      this.registerContextMenuHandler();

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
      if (!this.preloaded) {
        await RootClass.init();
      }
      this.dispatch = command => {
        this.store.state = this.reducer(this.store.state, command);
        this.updateDOM();
      };
      this.root = new RootClass(container, this.dispatch);

      this.reducer = opr.Toolkit.utils.combineReducers(
        ...this.root.getReducers());
      const state = await this.root.getInitialState();
      this.root.dispatch(this.reducer.commands.init(state));
    }

    registerContextMenuHandler() {
      this.container.addEventListener('contextmenu', event => {
        let element = event.target;
        while (element && element !== this.container && !element.contextMenu) {
          element = element.parentElement;
        }
        if (element && element.contextMenu) {
          console.assert(
              element.contextMenu.items, 'No items defined for context menu');
          console.assert(
              element.contextMenu.handler,
              'No handler function defined for context menu');
          chrome.contextMenusPrivate.showMenu(
              event.clientX, event.clientY, element.contextMenu.items,
              element.contextMenu.handler);
          event.stopPropagation();
          event.preventDefault();
        }
      });
    }

    calculatePatches() {
      const patches = [];
      if (!opr.Toolkit.Diff.deepEqual(this.store.state, this.root.props)) {
        if (this.root.props === undefined) {
          patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
        }
        patches.push(
            opr.Toolkit.Patch.updateComponent(this.root, this.store.state));
        const componentTree = opr.Toolkit.ComponentTree.createChildTree(
            this.root, this.store.state, this.root.child);
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
      for (const patch of patches) patch.apply();
      opr.Toolkit.ComponentLifecycle.afterUpdate(patches);
      if (this.settings.level === 'debug') {
        console.log('Patches:', patches.length);
        console.timeEnd('=> Render');
      }
    }
  }

  module.exports = App;
}
