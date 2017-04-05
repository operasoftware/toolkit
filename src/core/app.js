{
  const App = class {

    constructor(path) {
      this.path = path;
      this.preloaded = false;
      this.store = new opr.Toolkit.Store();
    }

    async preload() {
      this.preloaded = true;
      await loader.preload(this.path);
    }

    async render(container) {

      this.container = container;

      const RootClass = await loader.resolve(this.path);
      if (!this.preloaded) {
        await RootClass.init();
      }

      this.root = new RootClass(container, command => {
        this.store.state = this.reducer(this.store.state, command);
        this.updateDOM();
      });

      this.reducer = opr.Toolkit.utils.combineReducers(
        ...this.root.getReducers());
      const state = await this.root.getInitialState();
      this.root.dispatch(this.reducer.commands.init(state));
    }

    calculatePatches() {
      const patches = [];
      if (!opr.Toolkit.Diff.deepEqual(this.store.state, this.root.props)) {
        if (this.root.props === undefined) {
          patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
        }
        patches.push(opr.Toolkit.Patch.updateComponent(this.root, this.store.state));
        const componentTree = opr.Toolkit.ComponentTree.createChildTree(
          this.root, this.store.state);
        const childTreePatches = opr.Toolkit.Diff.calculate(
          this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    async updateDOM() {
      console.time('=> Render');
      const patches = this.calculatePatches();
      opr.Toolkit.ComponentLifecycle.beforeUpdate(patches);
      for (const patch of patches) patch.apply();
      opr.Toolkit.ComponentLifecycle.afterUpdate(patches);
      console.log('Patches:', patches.length);
      console.timeEnd('=> Render');
    }
  };

  module.exports = App;
}
