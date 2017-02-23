{
  let createTree, calculateDiff;

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

      this.reducer = Reactor.combineReducers(...this.root.getReducers());
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
      const componentTree = Reactor.ComponentTree.createTree(
        this.root, this.store.state);
      return Reactor.Diff.calculate(this.root.child, componentTree, this.root);
    }

    async updateDOM() {
      console.time('=> Render');
      const patches = this.calculatePatches();
      for (const patch of patches) {
        patch.apply();
      }
      console.log('--------------------------------------------------------')
      console.log('Patches:', patches.length);
      console.timeEnd('=> Render');
    }
  };

  module.exports = App;
}