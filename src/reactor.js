{

  const Store = class {

    constructor() {
      this.stack = [];
    }

    get state() {
      if (this.stack.length === 0) {
        return null;
      }
      return Object.assign({}, this.stack[this.stack.length - 1]);
    }

    set state(state) {
      this.stack.push(state);
    }
  };

  const INIT = 'init';

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
    return state;
  };

  const combineReducers = (...reducers) => {
    return (state, command) => {
      reducers.forEach(reducer => {
        state = reducer(state, command);
      });
      return state;
    }
  };

  const ReactorApp = class {

    constructor(path) {
      this.path = path;
      this.store = new Store();
    }

    async preload() {
      this.preloaded = true;
      await preload(this.path);
    }

    async render(container) {

      this.container = container;

      const RootClass = await require(this.path);
      if (!this.preloaded) {
        await RootClass.init();
      }
      this.root = new RootClass();

      this.reducer = combineReducers(coreReducer, ...this.root.getReducers());

      // connect
      this.root.dispatch = command => {
        const nextState = this.reducer(this.store.state, command);
        this.store.state = nextState;
        this.updateDOM();
      };

      // init
      this.root.dispatch({
        type: INIT,
        state: this.root.getInitialState()
      });
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
      Renderer.renderInElement(this.container, virtualDOM);
      console.timeEnd('render');
    }
  };

  const Reactor = class {
    static create(component) {
      return new ReactorApp(component);
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    window.SUPPORTED_STYLES = [...getComputedStyle(document.body)]
      .map(name => name.toLowerCase().replace(/-(.)/g, (match, group1) => group1.toUpperCase()));
  }, false);

  Reactor.Component = class {

    static async init() {
    }
  };

  window.Reactor = Reactor;
}
