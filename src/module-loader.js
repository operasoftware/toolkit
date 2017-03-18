{
  const registry = new Map();
  const cache = new Map();
  const dependencies = [];

  const prefixes = new Map();

  const getScriptPath = path => {
    for (let [name, prefix] of prefixes) {
      if (path.startsWith(name)) {
        return `/${prefix}${path}.js`;
      }
    }
    return `/${path}.js`;
  }

  const preload = async path => {
    console.log('Preloading:', path);
    const component = await require(path);
    const pendingDependencies = Array.from(dependencies);
    if (component.prototype instanceof Reactor.Component && component.init) {
      await component.init();
    }
    for (let dependency of pendingDependencies) {
      await preload(dependency);
    }
  };

  const define = (componentPath, module) => {
    registry.set(Symbol.for(componentPath), componentPath);
    cache.set(componentPath, module);
  };

  const require = componentPath => {

    if (typeof componentPath === 'symbol') {
      componentPath = registry.get(componentPath);
    }

    if (cache.get(componentPath)) {
      return Promise.resolve(cache.get(componentPath));
    }

    const loadPromise = new Promise(resolve => {
      dependencies.length = 0;
      // console.time('=> script load time');
      const script = document.createElement('script');
      script.src = getScriptPath(componentPath);
      script.setAttribute('data-component-path', componentPath);
      script.onload = () => {
        cache.set(componentPath, module.exports);
        // console.log('(loader) Loaded script:', script.src);
        // console.timeEnd('=> script load time');
        resolve(module.exports);
      };
      document.head.appendChild(script);
    });

    return loadPromise;
  };

  require.prefix = (name, prefix) => {
    prefixes.set(name, prefix);
  };

  require.def = componentPath => {
    const symbol = Symbol.for(componentPath);
    dependencies.push(symbol);
    registry.set(symbol, componentPath);
    return symbol;
  };

  const resolve = def => {
    const componentPath = registry.get(def);
    return cache.get(componentPath);
  };

  const module = {};

  // globals
  Object.assign(window, {
    define,
    require,
    resolve,
    preload,
    module
  });
}