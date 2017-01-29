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

      this.reducer = Reactor.combineReducers(...this.root.getReducers());

      // connect
      this.root.dispatch = command => {
        const nextState = this.reducer(this.store.state, command);
        this.store.state = nextState;
        this.updateDOM();
      };

      // init
      this.root.dispatch(this.reducer.commands.init(this.root.getInitialState()));
    }

    async createVirtualDOM() {
      if (this.preloaded) {
        return VirtualDOM.create(this.root);
      } else {
        return await VirtualDOM.resolve(this.root);
      }
    }

    async updateDOM() {
      console.time('render');
      this.root.props = this.store.state;
      const virtualDOM = await this.createVirtualDOM();
      this.renderer.render(this.container, virtualDOM);
      console.timeEnd('render');
    }
  };

  module.exports = App;
}
