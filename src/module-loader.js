{
  const registry = new Map();
  const cache = new Map();
  const dependencies = [];

  window.preload = async path => {
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

  window.require = componentPath => {

    if (typeof componentPath === 'symbol') {
      componentPath = registry.get(componentPath);
    }

    if (cache.get(componentPath)) {
      return Promise.resolve(cache.get(componentPath));
    }

    const getScriptPath = componentPath => '/' + componentPath + '.js';

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

  window.require.def = componentPath => {
    const symbol = Symbol.for(componentPath);
    dependencies.push(symbol);
    registry.set(symbol, componentPath);
    return symbol;
  };

  chrome.loader = class Loader {

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
  };

  window.module = {};
}