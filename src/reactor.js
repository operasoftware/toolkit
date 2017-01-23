{

  const getScriptPath = componentPath => '/' + componentPath + '.js';

  const registry = new Map();
  const cache = new Map();

  const preload = async path => {
    console.log('Preloading:', path);
    const component = await require(path);
    if (component.prototype instanceof Reactor.Component) {
      component.init();
    }
    for (let dependency of dependencies) {
      await preload(dependency);
    }
  };

  const ReactorApp = class {

    constructor(rootPath) {
      this.rootPath = rootPath;
    }

    async preload() {
      this.preloaded = true;
      await preload(this.rootPath);
    }

    init(store) {
      this.store = store;
      return this;
    }

    async render(rootElement) {
      this.rootElement = rootElement;

      const rootComponentClass = await require(this.rootPath);
      if (!this.preloaded) {
        rootComponentClass.init();
      }
      const rootComponent = new rootComponentClass();

      // TODO: move me
      rootComponent.props = {
        items: Array(1000).fill('').map((item, index) => 'Item ' + (index + 1))
      };

      console.time('render');
      let virtualDOM;
      if (this.preloaded) {
        virtualDOM = VirtualDOM.create(rootComponent);
      } else {
        virtualDOM = await VirtualDOM.resolve(rootComponent);
      }
      Renderer.renderInElement(rootElement, virtualDOM);
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
