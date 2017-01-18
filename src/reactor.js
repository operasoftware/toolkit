const Actions = {
  ADD_ITEM: 'ADD_ITEM',
};

const ActionCreator = {

  addItem: label => ({
    type: Actions.ADD_ITEM,
    label
  })
};

(async () => {

  window.module = {};

  const registry = new Map();

  let currentVirtualDOM;
  let rootElement;
  let rootComponent;

  const getScriptPath = componentPath => '/' + componentPath + '.js';

  let setState;

  const createStore = async () => {

    let currentState = {};
    setState = state => currentState = state;

    currentState.items = ['bookmarks', 'news', 'extensions', 'tabs', 'settings'];

    return {
      getState: () => currentState,
    };
  };

  let store;

  const reducer = (state = currentState, action) => {

    if (action.type === Actions.ADD_ITEM) {
       const nextState = Object.assign({}, state);
       nextState.items = [...state.items];
       for (let i = 0; i < 100; i++) {
         nextState.items.push(action.label);
       }
       return nextState;
    }

    console.warn('Returning the same state');
    return state;
  };

  const dispatch = action => {
    const nextState = reducer(store.getState(), action);
    setState(nextState);
    Reactor.update();
  };

  window.Reactor = {

    instantiate: async (def) => {
      const componentPath = typeof def === 'symbol' ? registry.get(def) : def;
      const ComponentClass = await require(componentPath);
      const component = new ComponentClass();
      await component.init();
      return component;
    },

    render: async (definition, containerElement) => {

      rootElement = containerElement;
      store = await createStore();

      console.log('Rendering in:', containerElement);
      if (typeof definition === 'symbol') {
        const componentPath = registry.get(definition);
        console.log('(reactor) Loading component:', componentPath);
 
        const component = await Reactor.instantiate(componentPath);
        rootComponent = component;

        // init component with properties
        component.props = store.getState();
        component.dispatch = dispatch;

        const virtualDOM = await VirtualDOM.resolve(component);
        console.log('(reactor) Virtual DOM:', virtualDOM);

        Renderer.renderInElement(containerElement, virtualDOM);

        currentVirtualDOM = virtualDOM;
      }
    },

    // TODO: is it needed?
    update: async () => {
      
      rootComponent.props = store.getState();
      const virtualDOM = await VirtualDOM.resolve(rootComponent);

      Renderer.renderInElement(rootElement, virtualDOM);
      currentVirtualDOM = virtualDOM;

      console.timeEnd('update');
    },

    Component: class  Component{

      async init() {
      }
    }
  };

  window.require = componentPath => {

    if (registry.get(componentPath)) {
//       console.log(`(loader) Loaded component "${componentPath}" from cache`);
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