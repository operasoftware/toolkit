(async () => {

  window.module = {};

  const registry = new Map();

  let lastVirtualDOM = null;

  const getScriptPath = componentPath => '/' + componentPath + '.js';

  window.Reactor = {

    instantiate: async (def) => {
      const componentPath = typeof def === 'symbol' ? registry.get(def) : def;
      const ComponentClass = await require(componentPath);
      const component = new ComponentClass();
      await component.init();
      return component;
    },

    render: async (definition, rootElement) => {
      console.log('Rendering in:', rootElement);
      if (typeof definition === 'symbol') {
        const componentPath = registry.get(definition);
        console.log('(reactor) Loading component:', componentPath);
 
        const component = await Reactor.instantiate(componentPath);

        const virtualDOM = await VirtualDOM.resolve(component);
        console.log('(reactor) Virtual DOM:', virtualDOM);

        const virtualDiff = VirtualDOM.calculateDiff(lastVirtualDOM, virtualDOM);

        const element = Renderer.renderInElement(rootElement, virtualDiff);

        lastVirtualDOM = virtualDOM;
        
      } else if (typeof component === 'function') {
        
      }
    },

    Component: class  Component{

      async init() {
      }
    }
  };

//   window.define = component => {
//     // console.log('Defining:', component);
//     pendingDefinition = component;
//     // console.log('Defined:', component);
//     // window.registry.set(/* ??? */ path, exported)
//   };

  window.require = componentPath => {

    if (registry.get(componentPath)) {
      console.log(`(loader) Loaded component "${componentPath}" from cache`);
      return Promise.resolve(registry.get(componentPath));
    }

    const loadPromise = new Promise(resolve => {
      console.time('=> script load time');
      const script = document.createElement('script');
      script.src = getScriptPath(componentPath);
      script.setAttribute('data-component-path', componentPath);
      script.onload = () => {
        registry.set(componentPath, module.exports);
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
    registry.set(symbol, componentPath);
    return symbol;
  };

  console.log('(reactor) Initialized core');

})();