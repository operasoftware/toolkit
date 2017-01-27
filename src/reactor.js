{

  const getScriptPath = componentPath => '/' + componentPath + '.js';

  const registry = new Map();
  const cache = new Map();

  const preload = async path => {
    console.log('Preloading:', path);
    const component = await require(path);
    const pendingDependencies = Array.from(dependencies);
    if (component.prototype instanceof Reactor.Component) {
      await component.init();
    }
    for (let dependency of pendingDependencies) {
      await preload(dependency);
    }
  };

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

  const combineReducers = (...reducers) => {
    return (state, command) => {
      let nextState = reducers.forEach(reducer => {
        nextState = reducer(state, command);
      })
      return nextState;
    }
  };

  const ReactorApp = class {

    constructor(rootPath) {
      this.rootPath = rootPath;
      this.store = new Store();
    }

    async preload() {
      this.preloaded = true;
      await preload(this.rootPath);
    }

    async render(rootElement) {
      this.rootElement = rootElement;

      const rootComponentClass = await require(this.rootPath);
      if (!this.preloaded) {
        await rootComponentClass.init();
      }
      const rootComponent = new rootComponentClass();

      const reducer = rootComponent.getReducer() // combineReducers([rootComponent.getReducer()]);

      // connect
      rootComponent.dispatch = command => {
        // TODO: move me
        if (command.type === 'INIT') {
          this.store.state = command.state;
          return;
        }
        const nextState = reducer(this.store.state, command);
        this.store.state = nextState;

        this.updateDOM(rootComponent).then(() =>{
          console.log('DOM updated after dispatch');
        });
      };
      // init
      rootComponent.dispatch({
        type: 'INIT',
        state: rootComponent.getInitialState()
      });

      this.updateDOM(rootComponent).then(() =>{
        console.log('DOM created');
      });
    }

    async createVirtualDOM(rootComponent) {
      if (this.preloaded) {
        return VirtualDOM.create(rootComponent);
      } else {
        return await VirtualDOM.resolve(rootComponent);
      }
    }

    async updateDOM(rootComponent) {
      console.time('render');
      rootComponent.props = this.store.state;
      const virtualDOM = await this.createVirtualDOM(rootComponent);
      Renderer.renderInElement(this.rootElement, virtualDOM);
      console.timeEnd('render');
    }
  };

  const Reactor = class {

    static construct(def) {
      const componentPath = typeof def === 'symbol' ? registry.get(def) : def;
      const ComponentClass = cache.get(componentPath);
      const component = new ComponentClass();
      return component;
    }

    static async instantiate(def) {
      const componentPath = typeof def === 'symbol' ? registry.get(def) : def;
      const ComponentClass = await require(componentPath);
      const component = new ComponentClass();
      // await component.init();
      return component;
    }

    static create(component) {
      return new ReactorApp(component);
    }
  };

  Reactor.Component = class {

    static async init() {
    }
  };

  const dependencies = [];

  window.require = componentPath => {

    if (typeof componentPath === 'symbol') {
      componentPath = registry.get(componentPath);
    }

    if (cache.get(componentPath)) {
      // console.log(`(loader) Loaded component "${componentPath}" from cache`);
      return Promise.resolve(cache.get(componentPath));
    }

    const loadPromise = new Promise(resolve => {
      dependencies.length = 0;
      console.time('=> script load time');
      const script = document.createElement('script');
      script.src = getScriptPath(componentPath);
      script.setAttribute('data-component-path', componentPath);
      script.onload = () => {
        cache.set(componentPath, module.exports);
        console.log('(loader) Loaded script:', script.src);
        console.timeEnd('=> script load time');
        resolve(module.exports);
      };
      document.head.appendChild(script);
    });

    return loadPromise;
  };

  window.require.defer = componentPath => {
    const symbol = Symbol.for(componentPath);
    dependencies.push(symbol);
    registry.set(symbol, componentPath);
    return symbol;
  };

  window.Reactor = Reactor;
  window.module = {};

}
