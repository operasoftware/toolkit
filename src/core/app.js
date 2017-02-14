{
  const App = class {

    constructor(path) {
      this.path = path;
      this.store = new Reactor.Store();
      this.renderer = new Reactor.Renderer();
    }

    async preload() {
      this.preloaded = true;
      await window.preload(this.path);
    }

    async render(container) {

      this.container = container;

      const RootClass = await require(this.path);
      if (!this.preloaded) {
        await RootClass.init();
      }
      this.root = new RootClass();
      this.root.ref = container;
      this.root.child = null;

      this.reducer = Reactor.combineReducers(...this.root.getReducers());

      // connect
      this.root.dispatch = command => {
        this.store.state = this.reducer(this.store.state, command);
        this.updateDOM();
      };

      // init
      this.root.dispatch(this.reducer.commands.init(this.root.getInitialState()));
    }

    async createVirtualDOM() {
      if (this.preloaded) {
        return Reactor.VirtualDOM.create(this.root);
      } else {
        return await Reactor.VirtualDOM.resolve(this.root);
      }
    }

    async updateDOM() {

      console.time('render');

      const componentTree = Reactor.ComponentTree.createTree(
          this.root, this.store.state);
      const patches = Reactor.Diff.calculate(
          this.root.child, componentTree, this.root);

      for (const patch of patches) {
        patch.apply();
      }

      console.log('Patches:', patches.length);
      // const virtualDOM = await this.createVirtualDOM();
      // this.renderer.render(this.container, virtualDOM);
      console.timeEnd('render');
    }
  };

  module.exports = App;
}
