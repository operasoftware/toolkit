{
  const App = class {

    constructor(path) {
      this.path = path;
      this.store = new Reactor.Store();
    }

    async preload() {
      this.preloaded = true;
      console.log('--------------------------------------------------------')
      await window.preload(this.path);
    }

    async render(container) {

      this.container = container;

      const RootClass = await require(this.path);
      if (!this.preloaded) {
        await RootClass.init();
      }

      this.root = new RootClass(container, command => {
        this.store.state = this.reducer(this.store.state, command);
        this.updateDOM();
      });

      this.reducer = Reactor.utils.combineReducers(...this.root.getReducers());
      this.root.dispatch(
        this.reducer.commands.init(this.root.getInitialState()));
    }

    async createVirtualDOM() {
      if (this.preloaded) {
        return Reactor.VirtualDOM.create(this.root);
      } else {
        return await Reactor.VirtualDOM.resolve(this.root);
      }
    }

    calculatePatches() {
      const patches = [];
      if (!Reactor.Diff.deepEqual(this.store.state, this.root.props)) {
        if (this.root.props === undefined) {
          patches.push(Reactor.Patch.createRootComponent(this.root));
        }
        patches.push(Reactor.Patch.updateComponent(this.root, this.store.state));
        const componentTree = Reactor.ComponentTree.createChildTree(
          this.root, this.store.state);
        const childTreePatches = Reactor.Diff.calculate(
          this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    async updateDOM() {
      console.time('=> Render');
      const patches = this.calculatePatches();
      Reactor.ComponentLifecycle.beforeUpdate(patches);
      for (const patch of patches) patch.apply();
      Reactor.ComponentLifecycle.afterUpdate(patches);
      console.log('--------------------------------------------------------')
      console.log('Patches:', patches.length);
      console.timeEnd('=> Render');
    }
  };

  module.exports = App;
}