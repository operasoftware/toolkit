{
  /** Path => module mapping. */
  const registry = new Map();

  /** Path => module dependency symbols mapping */
  const dependencySymbols = new Map();

  const prefixes = new Map();

  const getResourcePath = path => {
    for (let [name, prefix] of prefixes) {
      if (path.startsWith(name)) {
        return `${prefix}${path}.js`;
      }
    }
    return `${path}.js`;
  }

  const appendScriptToHead = async path => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = getResourcePath(path);
      script.onload = () => {
        registry.set(path, module.exports);
        resolve(module.exports);
      };
      document.head.appendChild(script);
    });
  };

  const requireUncached = path => {
    const resourcePath = getResourcePath(path);
    decache(resourcePath);
    return require(resourcePath);
  }

  const loadModule = async path => {
    if ('object' === typeof window) {
      return appendScriptToHead(path);
    }
    return requireUncached(path);
  };

  const getPath = symbol => String(symbol).slice(7, -1);

  let context = null;

  const ModuleLoader = class {

    static prefix(name, prefix) {
      prefixes.set(name, prefix);
      return this;
    };

    static symbol(path, ctx = context) {
      const symbol = Symbol.for(path);
      let moduleSymbols = dependencySymbols.get(ctx);
      if (!moduleSymbols) {
        moduleSymbols = [];
        dependencySymbols.set(ctx, moduleSymbols);
      }
      moduleSymbols.push(symbol);
      return symbol;
    }

    static define(path, module) {
      registry.set(path, module);
    }

    static get(path) {
      if ('symbol' === typeof path) {
        path = getPath(path);
      }
      const module = registry.get(path);
      if (module) {
        return module;
      }
      throw new Error(`No module found for path '${path}'`);
    }

    static async require(path) {
      let module = registry.get(path);
      if (module) {
        return module;
      }
      context = path;
      module = await loadModule(path);
      if (module.init) {
        const result = module.init();
        if (result instanceof Promise) {
          await result;
        }
      }
      registry.set(path, module);
      return module;
    }

    static async resolve(symbol) {
      const path = getPath(symbol);
      return this.require(path);
    }

    static async preload(symbol) {
      const path = getPath(symbol);
      let module = registry.get(path);
      if (module) {
        return module;
      }
      module = await this.require(path);
      const symbols = dependencySymbols.get(path) || [];
      for (const symbol of symbols) {
        await this.preload(symbol);
      }
      return module;
    }

    static get debug_() {
      return {
        getSymbols: path => dependencySymbols.get(path) || [],
        getModules: () => Array.from(registry.entries()),
        reset: () => {
          registry.clear();
          dependencySymbols.clear();
        }
      }
    }
  };

  const isBrowser = 'object' === typeof window;

  if (isBrowser) {
    window.loader = ModuleLoader;
    window.module = {};
  } else {
    global.loader = ModuleLoader;
  }
}


{
  const SUPPORTED_EVENTS = [
    // clipboard events
    'onCopy',
    'onCut',
    'onPaste',
    // composition events
    'onCompositionEnd',
    'onCompositionStart',
    'onCompositionUpdate',
    // keyboard events
    'onKeyDown',
    'onKeyPress',
    'onKeyUp',
    // focus events
    'onFocus',
    'onBlur',
    // form events
    'onChange',
    'onInput',
    'onSubmit',
    // mouse events
    'onAuxClick',
    'onClick',
    'onContextMenu',
    'onDoubleClick',
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragExit',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',
    'onMouseDown',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseOut',
    'onMouseOver',
    'onMouseUp',
    // selection events
    'onSelect',
    // touch events
    'onTouchCancel',
    'onTouchEnd',
    'onTouchMove',
    'onTouchStart',
    // UI events
    'onScroll',
    // wheel events
    'onWheel',
    // media events
    'onAbort',
    'onCanPlay',
    'onCanPlayThrough',
    'onDurationChange',
    'onEmptied',
    'onEncrypted',
    'onEnded',
    'onError',
    'onLoadedData',
    'onLoadedMetadata',
    'onLoadStart',
    'onPause',
    'onPlay',
    'onPlaying',
    'onProgress',
    'onRateChange',
    'onSeeked',
    'onSeeking',
    'onStalled',
    'onSuspend',
    'onTimeUpdate',
    'onVolumeChange',
    'onWaiting',
    // image events
    'onLoad',
    'onError',
    // animation events
    'onAnimationStart',
    'onAnimationEnd',
    'onAnimationIteration',
    // transition events
    'onTransitionEnd',
  ];

  const SUPPORTED_ATTRIBUTES = [
    'accept',
    'acceptCharset',
    'accessKey',
    'action',
    'allowFullScreen',
    'allowTransparency',
    'alt',
    'async',
    'autoComplete',
    'autoFocus',
    'autoPlay',
    'capture',
    'cellPadding',
    'cellSpacing',
    'challenge',
    'charSet',
    'checked',
    'cite',
    'classID',
    // 'class',
    'colSpan',
    'cols',
    'content',
    'contentEditable',
    'contextMenu',
    'controls',
    'coords',
    'crossOrigin',
    'data',
    'dateTime',
    'default',
    'defer',
    'dir',
    'disabled',
    'download',
    'draggable',
    'encType',
    'form',
    'formAction',
    'formEncType',
    'formMethod',
    'formNoValidate',
    'formTarget',
    'frameBorder',
    'headers',
    'height',
    'hidden',
    'high',
    'href',
    'hrefLang',
    'htmlFor',
    'httpEquiv',
    'icon',
    'id',
    'inputMode',
    'integrity',
    'is',
    'keyParams',
    'keyType',
    'kind',
    'label',
    'lang',
    'list',
    'loop',
    'low',
    'manifest',
    'marginHeight',
    'marginWidth',
    'max',
    'maxLength',
    'media',
    'mediaGroup',
    'method',
    'min',
    'minLength',
    'multiple',
    'muted',
    'name',
    'noValidate',
    'nonce',
    'open',
    'optimum',
    'pattern',
    'placeholder',
    'poster',
    'preload',
    'profile',
    'radioGroup',
    'readOnly',
    'rel',
    'required',
    'reversed',
    'role',
    'rowSpan',
    'rows',
    'sandbox',
    'scope',
    'scoped',
    'scrolling',
    'seamless',
    'selected',
    'shape',
    'size',
    'sizes',
    'span',
    'spellCheck',
    'src',
    'srcDoc',
    'srcLang',
    'srcSet',
    'start',
    'step',
    // 'style',
    'summary',
    'tabindex',
    'target',
    'title',
    'type',
    'useMap',
    'value',
    'width',
    'wmode',
    'wrap ',
  ];

  const SUPPORTED_STYLES = Object.keys(document.documentElement.style);

  const SUPPORTED_FILTERS = [
    'blur',
    'brightness',
    'contrast',
    'dropShadow',
    'grayscale',
    'hueRotate',
    'invert',
    'opacity',
    'sepia',
    'saturate'
  ];

  const SUPPORTED_TRANSFORMS = [
    'matrix',
    'matrix3d',
    'translate',
    'translate3d',
    'translateX',
    'translateY',
    'translateZ',
    'scale',
    'scale3d',
    'scaleX',
    'scaleY',
    'scaleZ',
    'rotate',
    'rotate3d',
    'rotateX',
    'rotateY',
    'rotateZ',
    'skew',
    'skewX',
    'skewY',
    'perspective'
  ];

  const Consts = {
    SUPPORTED_ATTRIBUTES,
    SUPPORTED_EVENTS,
    SUPPORTED_STYLES,
    SUPPORTED_FILTERS,
    SUPPORTED_TRANSFORMS
  };

  loader.define('core/consts', Consts);
}


{
  const SANDBOX_CONTEXT = Symbol('sandbox-context');

  const ID = Symbol('id');

  const VirtualNode = class {

    constructor() {
      this[ID] = opr.Toolkit.utils.createUUID();
      this.parentNode = null;
    }

    get id() {
      return this[ID];
    }

    get parentElement() {
      if (this.parentNode) {
        return this.parentNode.isElement() ?
          this.parentNode : this.parentNode.parentElement;
      }
      return null;
    }

    get rootElement() {
      if (this.parentElement) {
        return this.parentElement.rootElement;
      }
      return this;
    }

    isRoot() {
      return this instanceof Root;
    }

    isComponent() {
      return this instanceof Component;
    }

    isElement() {
      return this instanceof VirtualElement;
    }

    isComment() {
      return this instanceof Comment;
    }

    isCompatible(node) {
      return node && this.nodeType === node.nodeType;
    }
  };

  const Component = class extends VirtualNode {

    constructor() {
      super();
      this.child = null;
      this.comment = new Comment(this.constructor.name, this);
      this.cleanUpTasks = [];
    }

    get sandbox() {
      let sandbox = this[SANDBOX_CONTEXT];
      if (!sandbox) {
        sandbox = opr.Toolkit.Sandbox.create(this);
        this[SANDBOX_CONTEXT] = sandbox;
      }
      return sandbox;
    }

    registerService(service, listeners) {
      console.assert(service.connect instanceof Function);
      const disconnect = service.connect(listeners);
      console.assert(disconnect instanceof Function);
      disconnect.service = service;
      this.cleanUpTasks.push(disconnect);
    }

    appendChild(child) {
      this.child = child;
      this.child.parentNode = this;
      this.comment.parentNode = null; // TODO: unit test
      this.comment = null;
    }

    removeChild(child) {
      console.assert(this.child === child);
      this.child.parentNode = null;
      this.child = null;
      this.comment = new Comment(this.constructor.name, this);
    }

    get childElement() {
      if (this.child) {
        if (this.child.isComponent()) {
          return this.child.childElement;
        }
        if (this.child.isElement()) {
          return this.child;
        }
      }
      return null;
    }

    get placeholder() {
      if (this.comment) {
        return this.comment;
      }
      if (this.child && this.child.isComponent()) {
        return this.child.placeholder;
      }
      return null;
    }

    render() {
      return undefined;
    }

    broadcast(name, data) {
      this.rootElement.ref.dispatchEvent(
        new CustomEvent(name, {
          detail: data,
          bubbles: true,
          composed: true,
        }))
    }

    onCreated() {}

    onAttached() {}

    onPropsReceived(props) {}

    onUpdated() {}

    onDestroyed() {}

    onDetached() {}

    get nodeType() {
      return 'component';
    }

    get ref() {
      return this.childElement ? this.childElement.ref : this.placeholder.ref;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.constructor === node.constructor;
    }
  };

  const Root = class extends Component {

    constructor(container, dispatch) {
      super();
      this.container = container;
      this.dispatch = dispatch;
    }

    get parentElement() {
      const containerElement = new VirtualElement('root');
      containerElement.children.push(this);
      containerElement.ref = this.container;
      return containerElement;
    }

    async getInitialState() {
      return {};
    }

    getReducers() {
      return [];
    }

    get nodeType() {
      return 'root';
    }
  };

  const VirtualElement = class extends VirtualNode {

    constructor(name) {
      super();
      this.name = name;
      this.attrs = {};
      this.dataset = {};
      this.style = {};
      this.classNames = [];
      this.listeners = {};
      this.children = [];
      this.text = null;
      this.key = null;
      this.ref = null;
    }

    setAttribute(name, value) {
      this.attrs[name] = String(value);
    }

    removeAttribute(name) {
      delete this.attrs[name];
    }

    setDataAttribute(name, value) {
      this.dataset[name] = String(value);
    }

    removeDataAttribute(name) {
      delete this.dataset[name];
    }

    addClassName(className) {
      this.classNames.push(className);
    }

    removeClassName(className) {
      this.classNames = this.classNames.filter(item => item !== className);
    }

    setStyleProperty(prop, value) {
      this.style[prop] = String(value);
    }

    removeStyleProperty(prop) {
      delete this.style[prop];
    }

    addListener(name, listener) {
      this.listeners[name] = listener;
    }

    removeListener(name, listener) {
      delete this.listeners[name];
    }

    insertChild(child, index = this.children.length) {
      this.children.splice(index, 0, child);
      child.parentNode = this;
    }

    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) {
        this.children.splice(index, 1);
        child.parentNode = null;
        return true;
      }
      return false;
    }

    moveChild(child, from, to) {
      console.assert(this.children[from] === child);
      this.children.splice(from, 1);
      this.children.splice(to, 0, child);
    }

    get nodeType() {
      return 'element';
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.name === node.name;
    }
  };

  const Comment = class extends VirtualNode {

    constructor(text, parentNode) {
      super();
      this.text = text;
      this.parentNode = parentNode;
      this.ref = null;
    }

    get nodeType() {
      return 'comment';
    }
  };

  const External = class extends Element {

  };

  const CoreTypes = {
    VirtualNode,
    Component,
    Root,
    VirtualElement,
    Comment,
  };

  loader.define('core/core-types', CoreTypes);
}


{
  const ID = Symbol('id');

  const App = class {

    constructor(path) {
      this[ID] = opr.Toolkit.utils.createUUID();
      this.root = this.getRoot(path);
      this.preloaded = false;
      this.store = new opr.Toolkit.Store();
    }

    getRoot(path) {
      const type = typeof path;
      switch (type) {
        case 'symbol':
          return path;
        case 'string':
          return loader.symbol(path);
        default:
          throw new Error(`Invalid path: ${path}`);
      }
    }

    get id() {
      return this[ID];
    }

    async preload() {
      this.preloaded = true;
      await loader.preload(this.root);
    }

    async render(container) {

      this.container = container;

      const RootClass = await loader.resolve(this.root);
      if (!this.preloaded) {
        await RootClass.init();
      }

      this.root = new RootClass(container, command => {
        this.store.state = this.reducer(this.store.state, command);
        this.updateDOM();
      });

      this.reducer = opr.Toolkit.utils.combineReducers(
        ...this.root.getReducers());
      const state = await this.root.getInitialState();
      this.root.dispatch(this.reducer.commands.init(state));
    }

    calculatePatches() {
      const patches = [];
      if (!opr.Toolkit.Diff.deepEqual(this.store.state, this.root.props)) {
        if (this.root.props === undefined) {
          patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
        }
        patches.push(opr.Toolkit.Patch.updateComponent(this.root, this.store.state));
        const componentTree = opr.Toolkit.ComponentTree.createChildTree(
          this.root, this.store.state, this.root.child);
        const childTreePatches = opr.Toolkit.Diff.calculate(
          this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    async updateDOM() {
      if (opr.Toolkit.debug) {
        console.time('=> Render');
      }
      const patches = this.calculatePatches();
      opr.Toolkit.ComponentLifecycle.beforeUpdate(patches);
      for (const patch of patches) patch.apply();
      opr.Toolkit.ComponentLifecycle.afterUpdate(patches);
      if (opr.Toolkit.debug) {
        console.log('Patches:', patches.length);
        console.timeEnd('=> Render');
      }
    }
  };

  loader.define('core/app', App);
}


{
  const isFunction = (target, property) =>
    typeof target[property] === 'function';

  const properties = [
    'id', 'constructor', 'dispatch',
  ];
  const methods = [
    'broadcast', 'registerService',
  ];
  const stateProperties = [
    'props', 'children',
  ];

  const createBoundListener = (listener, component, context) => {
    const boundListener = listener.bind(context);
    boundListener.source = listener;
    boundListener.component = component;
    return boundListener;
  };

  const Sandbox = class {

    static create(component) {
      const blacklist = Object.getOwnPropertyNames(
        opr.Toolkit.Component.prototype);
      const autobound = {};
      const state = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (properties.includes(property)) {
            return target[property];
          }
          if (stateProperties.includes(property)) {
            return state[property];
          }
          if (methods.includes(property) && isFunction(target, property)) {
            return createBoundListener(target[property], target, target);
          }
          if (blacklist.includes(property)) {
            return undefined;
          }
          if (isFunction(autobound, property)) {
            return autobound[property];
          }
          if (isFunction(target, property)) {
            return autobound[property] =
              createBoundListener(target[property], target, receiver);
          }
          return undefined;
        },
        set: (target, property, value) => {
          if (stateProperties.includes(property)) {
            state[property] = value;
          }
          return true;
        }
      });
    }
  }

  loader.define('core/sandbox', Sandbox);
}


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

  loader.define('core/store', Store);
}


{
  const Template = class {

    static get ItemType() {
      return {
        STRING: 'string',
        NUMBER: 'number',
        BOOLEAN: 'boolean',
        UNDEFINED: 'undefined',
        NULL: 'null',
        COMPONENT: 'component',
        ELEMENT: 'element',
        PROPS: 'props',
        FUNCTION: 'function',
      };
    }

    static getClassNames(value) {
      const getClassNamesString = value => {
        if (!value) {
          return '';
        }
        if (value.constructor === Object) {
          value = Object.keys(value).map(key => value[key] && key);
        }
        if (value.constructor === Array) {
          const classNames = [];
          for (const item of value) {
            const className = getClassNamesString(item);
            if (className) {
              classNames.push(className);
            }
          }
          value = classNames.join(' ');
        }
        if (value.constructor === String) {
          return value.trim();
        }
        return '';
      };
      let classNames = getClassNamesString(value);
      if (classNames === '') {
        return [];
      }
      classNames = classNames
        .replace(/( )+/g, ' ')
        .trim()
        .split(' ');
      return [...new Set(classNames)];
    }

    static getCompositeValue(obj = {}, whitelist) {
      const names = Object.keys(obj)
        .filter(name => whitelist.includes(name));
      return this.getAttributeValue(names.reduce((result, name) => {
        const value = this.getAttributeValue(obj[name], false);
        if (value) {
          result[name] = value;
        }
        return result;
      }, {}));
    }

    static getAttributeValue(value, allowEmptyString = true) {
      if (value === undefined || value === null) {
        return null;
      }
      if (value.constructor === Function) {
        return null;
      }
      if (value.constructor === Array) {
        return value.length > 0 ? value.join('') : null;
      }
      if (value.constructor === Object) {
        const entries = Object.entries(value);
        if (entries.length > 0) {
          return entries.map(([name, value]) => `${name}(${value})`).join(' ');
        }
        return null;
      }
      if (value === '') {
        return allowEmptyString ? '' : null;
      }
      return String(value);
    }

    static getStyleValue(value, prop = null) {
      switch (prop) {
        case 'filter':
          return this.getCompositeValue(value, opr.Toolkit.SUPPORTED_FILTERS);
        case 'transform':
          return this.getCompositeValue(value, opr.Toolkit.SUPPORTED_TRANSFORMS);
        default:
          return this.getAttributeValue(value);
      }
    }

    static getItemType(item) {

      const Type = Template.ItemType;
      const type = typeof item;

      switch (type) {
        case 'string':
          return Type.STRING;
        case 'number':
          return Type.NUMBER;
        case 'boolean':
          return Type.BOOLEAN;
        case 'undefined':
          return Type.UNDEFINED;
        case 'symbol':
          return Type.COMPONENT;
        case 'function':
          return Type.FUNCTION;
        case 'object':
          if (item === null) {
            return Type.NULL;
          } else if (Array.isArray(item)) {
            return Type.ELEMENT;
          } else {
            return Type.PROPS;
          }
      }
    }

    static validate(template) {

      if (template === null || template === false) {
        return {
          types: null
        };
      }

      if (!Array.isArray(template)) {
        const error = new Error(`Specified template: "${template}" is not an array!`);
        console.error('Specified template', template, 'is not an array!');
        return {
          error
        };
      }

      const Type = Template.ItemType;
      const types = template.map(this.getItemType);

      if (![Type.STRING, Type.COMPONENT].includes(types[0])) {
        console.error('Invalid element:', template[0],
          ', expecting component or tag name');
        const error = new Error(`Invalid parameter type "${types[0]}" at index 0`);
        return {
          error,
          types
        };
      }

      if (types.length <= 1) {
        return {
          types
        };
      }

      let firstChildIndex = 1;

      switch (types[1]) {
        case Type.STRING:
          if (types.length > 2) {
            const error = new Error('Text elements cannot have child nodes');
            console.error('Text elements cannot have child nodes:', template.slice(1));
            return {
              error,
              types
            };
          } else if (types[0] === Type.COMPONENT) {
            const error = new Error('Subcomponents do not accept text content');
            console.error('Subcomponents do not accept text content:', template[1]);
            return {
              error,
              types
            };
          }
        case Type.PROPS:
          firstChildIndex = 2;
        case Type.NULL:
        case Type.BOOLEAN:
          if (template[1] === true) {
            const error = new Error(`Invalid parameter type "${types[1]}" at index 1, expecting: properties object, text content or first child element`);
            console.error('Invalid parameter', template[1], ', expecting: properties object, text content or first child element');
            return {
              error,
              types
            };
          }
        case Type.ELEMENT:
          if (types.length > 2) {
            if (types[2] === Type.STRING) {
              if (types.length > 3) {
                const error = new Error('Text elements cannot have child nodes');
                console.error('Text elements cannot have child nodes:',
                  template.slice(2));
                return {
                  error,
                  types
                };
              } else if (types[0] === Type.COMPONENT) {
                const error = new Error('Subcomponents do not accept text content');
                console.error('Subcomponents do not accept text content:', template[2]);
                return {
                  error,
                  types
                };
              }
              return {
                types
              };
            }
          }
          for (let i = firstChildIndex; i < template.length; i++) {
            const expected = i === 1 ? 'properties object, text content or first child element' : 'child element';
            if (types[i] !== Type.ELEMENT && template[i] !== null && template[i] !== false) {
              const error = new Error(`Invalid parameter type "${types[i]}" at index ${i}`);
              console.error('Invalid parameter:', template[i],
                ', expecting ' + expected);
              return {
                error,
                types
              };
            }
          }
          return {
            types
          };
        default:
          const error = new Error(`Invalid parameter type "${types[1]}" at index 1, expecting: properties object, text content or first child element`);
          console.error('Invalid parameter', template[1], ', expecting: properties object, text content or first child element');
          return {
            error,
            types
          };
      }
    }

    static describe(template) {

      const {
        types,
        error
      } = this.validate(template);

      if (error) {
        console.error('Invalid template definition:', template);
        throw error;
      }

      if (types === null) {
        return null;
      }

      const Type = Template.ItemType;
      const type = (types[0] === Type.COMPONENT ? 'component' : 'name');

      const onlyValidElements = element => Array.isArray(element);

      switch (template.length) {
        case 1:
          return {
            [type]: template[0],
          };
        case 2:
          if (types[1] === Type.STRING) {
            const text = template[1];
            return {
              [type]: template[0],
              text,
            };
          } else if (types[1] === Type.PROPS) {
            return {
              [type]: template[0],
              props: template[1]
            };
          } else if (types[1] === Type.ELEMENT) {
            return {
              [type]: template[0],
              children: template.slice(1).filter(onlyValidElements),
            };
          }
        default:
          if (types[1] === Type.PROPS) {
            if (types[2] === Type.STRING) {
              return {
                [type]: template[0],
                props: template[1],
                text: template[2],
              };
            }
            return {
              [type]: template[0],
              props: template[1],
              children: template.slice(2).filter(onlyValidElements),
            };
          }
          return {
            [type]: template[0],
            children: template.slice(1).filter(onlyValidElements),
          };
      }
    }
  };

  loader.define('core/template', Template);
}


{
  const ComponentTree = class {

    static createComponentInstance(def, key) {
      const ComponentClass = loader.get(def);
      const instance = new ComponentClass();
      if (key !== undefined) {
        instance.key = key;
      }
      return instance;
    }

    static createElementInstance(description) {
      const element = new opr.Toolkit.VirtualElement(description.name);
      if (description.props) {
        const props = description.props;
        // attributes
        Object.keys(props)
          .filter(attr => opr.Toolkit.SUPPORTED_ATTRIBUTES.includes(attr))
          .forEach(attr => {
            const value = opr.Toolkit.Template.getAttributeValue(props[attr]);
            if (value !== null && value !== undefined) {
              element.setAttribute(attr, value);
            }
          });
        // data attributes
        const dataset = props.dataset || {};
        Object.keys(dataset)
          .forEach(attr => {
            const value = opr.Toolkit.Template.getAttributeValue(dataset[attr]);
            element.setDataAttribute(attr, value);
          });
        // class names
        const classNames = opr.Toolkit.Template.getClassNames(props.class);
        classNames.forEach(className => {
          element.addClassName(className);
        });
        // style
        const style = props.style || {};
        Object.keys(style)
          .filter(prop => opr.Toolkit.SUPPORTED_STYLES.includes(prop))
          .forEach(prop => {
            const value = opr.Toolkit.Template.getStyleValue(style[prop], prop);
            if (value !== null && value !== undefined) {
              element.setStyleProperty(prop, value);
            }
          });
        // listeners
        Object.keys(props)
          .filter(event => opr.Toolkit.SUPPORTED_EVENTS.includes(event))
          .forEach(event => {
            const name = opr.Toolkit.utils.getEventName(event);
            const listener = props[event];
            if (typeof listener === 'function') {
              element.addListener(name, listener);
            }
          });
        // key
        if (props.key) {
          element.key = props.key;
        }
      }
      // text
      if (description.text) {
        element.text = description.text;
      }
      return element;
    }

    static createFromTemplate(template, previousNode) {
      if (template === undefined) {
        throw new Error('Invalid undefined template!');
      }
      if (template === null || template === false || template.length === 0) {
        return null;
      }
      const description = opr.Toolkit.Template.describe(template);
      if (description.component) {
        return this.createComponent(
          description.component, description.props, description.children,
          previousNode);
      }
      return this.createElement(description, previousNode);
    }

    static createElement(description, previousNode) {
      const element = this.createElementInstance(description);
      const getPreviousChild = index => {
        if (element.isCompatible(previousNode)) {
          return previousNode.children[index] || null;
        } else {
          return null;
        }
      };
      if (description.children) {
        element.children = description.children.map(
          (desc, index) => {
            const child = this.createFromTemplate(desc, getPreviousChild(index));
            child.parentNode = element;
            return child;
          });
      }
      return element;
    }

    static createChildTree(root, props, previousTree) {

      const sandbox = root.sandbox;
      sandbox.props = props;

      const template = root.render.call(sandbox);
      const tree = this.createFromTemplate(template, previousTree);
      if (tree) {
        tree.parentNode = root;
      }
      return tree;
    }

    static createComponent(symbol, props = {}, children = [], previousNode) {
      try {
        const instance = this.createComponentInstance(symbol, props.key);
        instance.props = props;

        const sandbox = instance.isCompatible(previousNode) ?
          previousNode.sandbox :
          instance.sandbox;

        sandbox.props = props;
        sandbox.children = children;

        const template = instance.render.call(sandbox);
        if (template) {
          // TODO: handle undefined, false, null
          const previousChild = previousNode && previousNode.isComponent() ?
            previousNode.child : null;
          instance.appendChild(
            this.createFromTemplate(template, previousChild));
        }
        return instance;
      } catch (e) {
        console.error('Error creating Component Tree:', symbol);
        throw e;
      }
    }

    static async resolve() {
      // TODO: implement
    }
  };

  loader.define('core/component-tree', ComponentTree);
}


{
  const ComponentLifecycle = class {

    /*
     * onCreated(),
     * onAttached(),
     * onPropsReceived(),
     * onUpdated(),
     * onDestroyed(),
     * onDetached()
     */

    static onComponentCreated(component) {
      component.onCreated.call(component.sandbox);
      if (component.child) {
        this.onNodeCreated(component.child);
      }
    }

    static onElementCreated(element) {
      for (const child of element.children) {
        this.onNodeCreated(child);
      }
    }

    static onNodeCreated(node) {
      switch (node.nodeType) {
        case 'root':
        case 'component':
          return this.onComponentCreated(node);
        case 'element':
          return this.onElementCreated(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentAttached(component) {
      if (component.child) {
        this.onNodeAttached(component.child);
      }
      component.onAttached.call(component.sandbox);
    }

    static onElementAttached(element) {
      for (const child of element.children) {
        this.onNodeAttached(child);
      }
    }

    static onNodeAttached(node) {
      switch (node.nodeType) {
        case 'root':
        case 'component':
          return this.onComponentAttached(node);
        case 'element':
          return this.onElementAttached(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentReceivedProps(component, props) {
      component.onPropsReceived.call(component.sandbox, props);
    }

    static onComponentUpdated(component, props) {
      component.onUpdated.call(component.sandbox, props);
    }

    static onComponentDestroyed(component) {
      for (const cleanUpTask of component.cleanUpTasks) {
        cleanUpTask();
      }
      component.onDestroyed.call(component.sandbox);
      if (component.child) {
        this.onNodeDestroyed(component.child);
      }
    }

    static onElementDestroyed(element) {
      for (const child of element.children) {
        this.onNodeDestroyed(child);
      }
    }

    static onNodeDestroyed(node) {
      switch (node.nodeType) {
        case 'root':
        case 'component':
          return this.onComponentDestroyed(node);
        case 'element':
          return this.onElementDestroyed(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentDetached(component) {
      if (component.child) {
        this.onNodeDetached(component.child);
      }
      component.onDetached.call(component.sandbox);
    }

    static onElementDetached(element) {
      for (const child of element.children) {
        this.onNodeDetached(child);
      }
    }

    static onNodeDetached(node) {
      switch (node.nodeType) {
        case 'root':
        case 'component':
          return this.onComponentDetached(node);
        case 'element':
          return this.onElementDetached(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static beforePatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentReceivedProps(patch.target, patch.props);
        case Type.CREATE_ROOT_COMPONENT:
          return this.onComponentCreated(patch.root);
        case Type.ADD_COMPONENT:
          return this.onComponentCreated(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementCreated(patch.element);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeCreated(patch.node);
        case Type.REMOVE_COMPONENT:
          return this.onComponentDestroyed(patch.component);
        case Type.REMOVE_ELEMENT:
          return this.onElementDestroyed(patch.element);
        case Type.REMOVE_CHILD_NODE:
          return this.onNodeDestroyed(patch.node);
      }
    }

    static beforeUpdate(patches) {
      for (const patch of patches) {
        this.beforePatchApplied(patch);
      }
    }

    static afterPatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentUpdated(patch.target, patch.props);
        case Type.CREATE_ROOT_COMPONENT:
          return this.onComponentAttached(patch.root);
        case Type.ADD_COMPONENT:
          return this.onComponentAttached(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementAttached(patch.element);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeAttached(patch.node);
        case Type.REMOVE_COMPONENT:
          return this.onComponentDetached(patch.component);
        case Type.REMOVE_ELEMENT:
          return this.onElementDetached(patch.element);
        case Type.REMOVE_CHILD_NODE:
          return this.onNodeDetached(patch.node);
      }
    }

    static afterUpdate(patches) {
      for (const patch of patches) {
        this.afterPatchApplied(patch);
      }
    }
  }

  loader.define('core/component-lifecycle', ComponentLifecycle);
}


{
  const getType = item => {
    const type = typeof item;
    switch (type) {
      case 'object':
        if (item === null) {
          return 'null';
        } else if (Array.isArray(item)) {
          return 'array'
        } else {
          return 'object'
        }
      default:
        return type;
    }
  };

  const listenerPatches = (current = {}, next = {}, target = null, patches) => {
    const Patch = opr.Toolkit.Patch;

    const listeners = Object.keys(current);
    const nextListeners = Object.keys(next);

    const added = nextListeners.filter(event => !listeners.includes(event));
    const removed = listeners.filter(event => !nextListeners.includes(event));
    const changed = listeners.filter(
      event => nextListeners.includes(event) && current[event] !== next[event] &&
      (current[event].source === undefined && next[event].source === undefined ||
        current[event].source !== next[event].source));

    for (let event of added) {
      patches.push(Patch.addListener(event, next[event], target));
    }
    for (let event of removed) {
      patches.push(Patch.removeListener(event, current[event], target));
    }
    for (let event of changed) {
      patches.push(Patch.replaceListener(event, current[event], next[event], target));
    }
  };

  const stylePatches = (current = {}, next = {}, target, patches) => {

    const props = Object.keys(current);
    const nextProps = Object.keys(next);

    const added = nextProps.filter(prop => !props.includes(prop));
    const removed = props.filter(prop => !nextProps.includes(prop));
    const changed = props.filter(
      prop => nextProps.includes(prop) && current[prop] !== next[prop]);

    for (let prop of added) {
      patches.push(opr.Toolkit.Patch.addStyleProperty(prop, next[prop], target));
    }
    for (let prop of removed) {
      patches.push(opr.Toolkit.Patch.removeStyleProperty(prop, target));
    }
    for (let prop of changed) {
      patches.push(opr.Toolkit.Patch.replaceStyleProperty(prop, next[prop], target));
    }
  };

  const classNamePatches = (current = [], next = [], target, patches) => {

    const added = next.filter(attr => !current.includes(attr));
    const removed = current.filter(attr => !next.includes(attr));

    for (let name of added) {
      patches.push(opr.Toolkit.Patch.addClassName(name, target));
    }
    for (let name of removed) {
      patches.push(opr.Toolkit.Patch.removeClassName(name, target));
    }
  };

  const datasetPatches = (current = {}, next = {}, target, patches) => {

    const attrs = Object.keys(current);
    const nextAttrs = Object.keys(next);

    const added = nextAttrs.filter(attr => !attrs.includes(attr));
    const removed = attrs.filter(attr => !nextAttrs.includes(attr));
    const changed = attrs.filter(
      attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

    for (let attr of added) {
      patches.push(opr.Toolkit.Patch.addDataAttribute(attr, next[attr], target));
    }
    for (let attr of removed) {
      patches.push(opr.Toolkit.Patch.removeDataAttribute(attr, target));
    }
    for (let attr of changed) {
      patches.push(opr.Toolkit.Patch.replaceDataAttribute(attr, next[attr], target));
    }
  };

  const attributePatches = (current = {}, next = {}, target = null, patches) => {
    const attrs = Object.keys(current);
    const nextAttrs = Object.keys(next);

    const added = nextAttrs.filter(attr => !attrs.includes(attr));
    const removed = attrs.filter(attr => !nextAttrs.includes(attr));
    const changed = attrs.filter(
      attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

    for (let attr of added) {
      patches.push(opr.Toolkit.Patch.addAttribute(attr, next[attr], target));
    }
    for (let attr of removed) {
      patches.push(opr.Toolkit.Patch.removeAttribute(attr, target));
    }
    for (let attr of changed) {
      patches.push(opr.Toolkit.Patch.replaceAttribute(attr, next[attr], target));
    }
  };

  const areCompatible = (current, next) => {
    if (current.nodeType !== next.nodeType) {
      return false;
    }
    if (current.isComponent()) {
      return current.constructor === next.constructor;
    }
    if (current.isElement()) {
      return current.name === next.name;
    }
  };

  const childrenPatches = (current = [], next = [], parent, patches) => {

    const Patch = opr.Toolkit.Patch;
    const Move = opr.Toolkit.Reconciler.Move;

    const source = current.map((node, index) => node.key || index);
    const target = next.map((node, index) => node.key || index);

    const getNode = key => {
      if (source.includes(key)) {
        return current[source.indexOf(key)];
      } else {
        return next[target.indexOf(key)];
      }
    };

    const moves = opr.Toolkit.Reconciler.calculateMoves(source, target);

    const children = [...current];
    for (const move of moves) {
      const node = getNode(move.item);
      switch (move.name) {
        case Move.Name.INSERT:
          patches.push(Patch.insertChildNode(node, move.at, parent));
          Move.insert(node, move.at).make(children);
          continue;
        case Move.Name.MOVE:
          patches.push(Patch.moveChildNode(node, move.from, move.to, parent));
          Move.move(node, move.from, move.to).make(children);
          continue;
        case Move.Name.REMOVE:
          patches.push(Patch.removeChildNode(node, move.at, parent));
          Move.remove(node, move.at).make(children);
          continue;
      }
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      reconcileNode(child, next[i], parent, i, patches);
    }
  };

  const elementPatches = (current, next, patches) => {
    attributePatches(current.attrs, next.attrs, current, patches);
    datasetPatches(current.dataset, next.dataset, current, patches);
    stylePatches(current.style, next.style, current, patches);
    classNamePatches(current.classNames, next.classNames, current, patches);
    listenerPatches(current.listeners, next.listeners, current, patches);
    if (current.text !== null && next.text === null) {
      patches.push(opr.Toolkit.Patch.removeTextContent(current));
    }
    childrenPatches(current.children, next.children, current, patches);
    if (next.text !== null && current.text !== next.text) {
      patches.push(opr.Toolkit.Patch.setTextContent(current, next.text));
    }
  };

  const reconcileNode = (current, next, parent, index, patches) => {

    if (current === next) {
      // already inserted
      return;
    }
    if (areCompatible(current, next)) {
      if (current.isElement()) {
        elementPatches(current, next, patches);
      }
      if (current.isComponent()) {
        if (!Diff.deepEqual(current.props, next.props)) {
          patches.push(opr.Toolkit.Patch.updateComponent(current, next.props));
          calculatePatches(current.child, next.child, current, patches);
        } else {
          // no patch needed
        }
      }
    } else {
      patches.push(opr.Toolkit.Patch.removeChildNode(current, index, parent));
      patches.push(opr.Toolkit.Patch.insertChildNode(next, index, parent));
    }
  };

  const calculatePatches = (current, next, parent = null, patches = []) => {

    const Patch = opr.Toolkit.Patch;

    if (!current && !next) {
      return patches;
    }

    if (!current && next) {
      if (next.isComponent()) {
        patches.push(Patch.addComponent(next, parent));
      } else if (next.isElement()) {
        patches.push(Patch.addElement(next, parent));
      }
      return patches;
    }

    if (current && !next) {
      if (current.isComponent()) {
        patches.push(Patch.removeComponent(current, parent));
      } else if (current.isElement()) {
        patches.push(Patch.removeElement(current, parent));
      }
      return patches;
    }

    if (current.isComponent()) {
      if (next.isComponent()) {
        if (current.constructor === next.constructor) {
          if (!Diff.deepEqual(current.props, next.props)) {
            // component props change
            patches.push(Patch.updateComponent(current, next.props));
            calculatePatches(current.child, next.child, current, patches);
          } else {
            // no component props change - no patch needed
          }
        } else {
          // different components
          patches.push(Patch.removeComponent(current, parent));
          patches.push(Patch.addComponent(next, parent));
        }
      } else if (next.isElement()) {
        // replace component with an element
        patches.push(Patch.removeComponent(current, parent));
        patches.push(Patch.addElement(next, parent));
      }
    } else if (current.isElement()) {
      if (next.isComponent()) {
        // replace element with a component
        patches.push(Patch.removeElement(current, parent));
        patches.push(Patch.addComponent(next, parent));
      } else if (next.isElement()) {
        if (current.name === next.name) {
          // compatible elements
          elementPatches(current, next, patches);
        } else {
          // different elements
          patches.push(Patch.removeElement(current, parent));
          patches.push(Patch.addElement(next, parent));
        }
      }
    }
    return patches;
  }

  const Diff = class {

    static deepEqual(current, next) {
      const type = getType(current);
      const nextType = getType(next);
      if (type !== nextType) {
        return false;
      }
      if (type === 'array') {
        if (current.length !== next.length) {
          return false;
        }
        for (let i = 0; i < current.length; i++) {
          const equal = this.deepEqual(current[i], next[i]);
          if (!equal) {
            return false;
          }
        }
        return true;
      } else if (type === 'object') {
        const keys = Object.keys(current);
        const nextKeys = Object.keys(next);
        if (keys.length !== nextKeys.length) {
          return false;
        }
        keys.sort();
        nextKeys.sort();
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key !== nextKeys[i]) {
            return false;
          }
          const equal = this.deepEqual(current[key], next[key]);
          if (!equal) {
            return false;
          }
        }
        return true;
      } else {
        return current === next;
      }
    }

    static calculate(tree, nextTree, root) {
      return calculatePatches(tree, nextTree, root);
    }
  };

  loader.define('core/diff', Diff);
}


{
  const Type = Object.freeze({

    CREATE_ROOT_COMPONENT: Symbol('init-root-component'),
    UPDATE_COMPONENT: Symbol('update-component'),

    ADD_ELEMENT: Symbol('add-element'),
    REMOVE_ELEMENT: Symbol('remove-element'),

    ADD_COMPONENT: Symbol('add-component'),
    REMOVE_COMPONENT: Symbol('remove-component'),

    ADD_ATTRIBUTE: Symbol('add-attribute'),
    REPLACE_ATTRIBUTE: Symbol('replace-attribute'),
    REMOVE_ATTRIBUTE: Symbol('remove-attribute'),

    ADD_DATA_ATTRIBUTE: Symbol('add-data-attribute'),
    REPLACE_DATA_ATTRIBUTE: Symbol('replace-data-attribute'),
    REMOVE_DATA_ATTRIBUTE: Symbol('remove-data-attribute'),

    ADD_STYLE_PROPERTY: Symbol('add-style-property'),
    REPLACE_STYLE_PROPERTY: Symbol('replace-style-property'),
    REMOVE_STYLE_PROPERTY: Symbol('remove-style-property'),

    ADD_CLASS_NAME: Symbol('add-class-name'),
    REMOVE_CLASS_NAME: Symbol('remove-class-name'),

    ADD_LISTENER: Symbol('add-listener'),
    REPLACE_LISTENER: Symbol('replace-listener'),
    REMOVE_LISTENER: Symbol('remove-listener'),

    INSERT_CHILD_NODE: Symbol('insert-child-node'),
    MOVE_CHILD_NODE: Symbol('move-child-node'),
    REMOVE_CHILD_NODE: Symbol('remove-child-node'),

    SET_TEXT_CONTENT: Symbol('set-text-content'),
    REMOVE_TEXT_CONTENT: Symbol('remove-text-content'),
  });

  const Patch = class {

    constructor(type, props) {
      Object.assign(this, {
        type
      }, props);
    }

    static createRootComponent(root) {
      return new Patch(Type.CREATE_ROOT_COMPONENT, {
        root,
        apply: () => {
          root.props = null;
        }
      });
    }

    static updateComponent(target, props) {
      return new Patch(Type.UPDATE_COMPONENT, {
        target,
        props,
        apply: () => {
          target.props = props;
        }
      });
    }

    static addAttribute(name, value, target) {
      return new Patch(Type.ADD_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setAttribute(name, value);
          opr.Toolkit.Document.setAttribute(target.ref, name, value);
        }
      });
    }

    static replaceAttribute(name, value, target) {
      return new Patch(Type.REPLACE_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setAttribute(name, value);
          opr.Toolkit.Document.setAttribute(target.ref, name, value);
        }
      });
    }

    static removeAttribute(name, target) {
      return new Patch(Type.REMOVE_ATTRIBUTE, {
        name,
        target,
        apply: () => {
          target.removeAttribute(name);
          opr.Toolkit.Document.removeAttribute(target.ref, name);
        }
      });
    }

    static addDataAttribute(name, value, target) {
      return new Patch(Type.ADD_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setDataAttribute(name, value);
          opr.Toolkit.Document.setDataAttribute(target.ref, name, value);
        }
      });
    }

    static replaceDataAttribute(name, value, target) {
      return new Patch(Type.REPLACE_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setDataAttribute(name, value);
          opr.Toolkit.Document.setDataAttribute(target.ref, name, value);
        }
      });
    }

    static removeDataAttribute(name, target) {
      return new Patch(Type.REMOVE_DATA_ATTRIBUTE, {
        name,
        target,
        apply: () => {
          target.removeDataAttribute(name);
          opr.Toolkit.Document.removeDataAttribute(target.ref, name);
        }
      });
    }
    static addStyleProperty(property, value, target) {
      return new Patch(Type.ADD_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: () => {
          target.setStyleProperty(property, value);
          opr.Toolkit.Document.setStyleProperty(target.ref, property, value);
        }
      });
    }

    static replaceStyleProperty(property, value, target) {
      return new Patch(Type.REPLACE_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: () => {
          target.setStyleProperty(property, value);
          opr.Toolkit.Document.setStyleProperty(target.ref, property, value);
        }
      });
    }

    static removeStyleProperty(property, target) {
      return new Patch(Type.REMOVE_STYLE_PROPERTY, {
        property,
        target,
        apply: () => {
          target.removeStyleProperty(property);
          opr.Toolkit.Document.removeStyleProperty(target.ref, property);
        }
      });
    }

    static addClassName(name, target) {
      return new Patch(Type.ADD_CLASS_NAME, {
        name,
        target,
        apply: () => {
          target.addClassName(name);
          opr.Toolkit.Document.addClassName(target.ref, name);
        }
      });
    }

    static removeClassName(name, target) {
      return new Patch(Type.REMOVE_CLASS_NAME, {
        name,
        target,
        apply: () => {
          target.removeClassName(name);
          opr.Toolkit.Document.removeClassName(target.ref, name);
        }
      });
    }

    static addListener(event, listener, target) {
      return new Patch(Type.ADD_LISTENER, {
        event,
        listener,
        target,
        apply: () => {
          target.addListener(event, listener);
          opr.Toolkit.Document.addEventListener(target.ref, event, listener);
        }
      });
    }

    static replaceListener(event, removed, added, target) {
      return new Patch(Type.REPLACE_LISTENER, {
        event,
        removed,
        added,
        target,
        apply: () => {
          target.removeListener(event, removed);
          opr.Toolkit.Document.removeEventListener(target.ref, event, removed);
          target.addListener(event, added);
          opr.Toolkit.Document.addEventListener(target.ref, event, added);
        }
      });
    }

    static removeListener(event, listener, target) {
      return new Patch(Type.REMOVE_LISTENER, {
        event,
        listener,
        target,
        apply: () => {
          target.removeListener(event, listener);
          opr.Toolkit.Document.removeEventListener(target.ref, event, listener);
        }
      });
    }

    static addElement(element, parent) {
      return new Patch(Type.ADD_ELEMENT, {
        element,
        parent,
        apply: () => {
          parent.appendChild(element);
          opr.Toolkit.Document.attachElementTree(element, domElement => {
            parent.parentElement.ref.appendChild(domElement);
          });
        }
      });
    }

    static removeElement(element, parent) {
      return new Patch(Type.REMOVE_ELEMENT, {
        element,
        parent,
        apply: () => {
          parent.removeChild(element);
          element.ref.remove();
        }
      });
    }

    static addComponent(component, parent) {
      return new Patch(Type.ADD_COMPONENT, {
        component,
        parent,
        apply: () => {
          const comment = parent.placeholder.ref;
          const parentDomNode = parent.parentElement.ref;
          if (parent.isRoot()) {
            parent.appendChild(component);
            opr.Toolkit.Document.attachElementTree(component, domNode => {
              if (parentDomNode.hasChildNodes()) {
                opr.Toolkit.Document.replaceChild(
                  domNode, parentDomNode.firstChild, parentDomNode);
              } else {
                opr.Toolkit.Document.appendChild(domNode, parentDomNode);
              }
            });
          } else {
            parent.appendChild(component);
            opr.Toolkit.Document.attachElementTree(component, domNode => {
              opr.Toolkit.Document.replaceChild(domNode, comment, parentDomNode);
            });
          }
        }
      });
    }

    static removeComponent(component, parent) {
      return new Patch(Type.REMOVE_COMPONENT, {
        component,
        parent,
        apply: () => {
          const domChildNode = (component.childElement || component.placeholder).ref;
          parent.removeChild(component);
          parent.placeholder.ref = opr.Toolkit.Document.createComment(parent.placeholder);
          parent.parentElement.ref.replaceChild(parent.placeholder.ref, domChildNode);
        }
      });
    }

    static insertChildNode(node, at, parent) {
      return new Patch(Type.INSERT_CHILD_NODE, {
        node,
        at,
        parent,
        apply: () => {
          parent.insertChild(node, at);
          opr.Toolkit.Document.attachElementTree(node, domNode => {
            parent.ref.insertBefore(domNode, parent.ref.childNodes[at]);
          });
        }
      });
    }

    static moveChildNode(node, from, to, parent) {
      return new Patch(Type.MOVE_CHILD_NODE, {
        node,
        from,
        to,
        parent,
        apply: () => {
          parent.moveChild(node, from, to);
          opr.Toolkit.Document.moveChild(node.ref, from, to, parent.ref);
        }
      });
    }

    static removeChildNode(node, at, parent) {
      return new Patch(Type.REMOVE_CHILD_NODE, {
        node,
        at,
        parent,
        apply: () => {
          parent.removeChild(node);
          opr.Toolkit.Document.removeChild(node.ref, parent.ref);
        }
      });
    }

    static setTextContent(element, text) {
      return new Patch(Type.SET_TEXT_CONTENT, {
        element,
        text,
        apply: () => {
          element.text = text;
          opr.Toolkit.Document.setTextContent(element.ref, text);
        }
      });
    }

    static removeTextContent(element) {
      return new Patch(Type.REMOVE_TEXT_CONTENT, {
        element,
        apply: () => {
          element.text = null;
          opr.Toolkit.Document.setTextContent(element.ref, '');
        }
      });
    }

    static get Type() {
      return Object.assign({}, Type);
    }
  };

  loader.define('core/patch', Patch);
}


{
  const Name = {
    INSERT: Symbol('insert'),
    MOVE: Symbol('move'),
    REMOVE: Symbol('remove'),
  };

  const Move = class {

    constructor(name, item, props, make) {
      Object.assign(this, {
        name, item, make
      }, props);
    }

    static insert(item, at) {
      return new Move(Name.INSERT, item, { at }, items => {
        items.splice(at, 0, item);
      });
    }

    static move(item, from, to) {
      return new Move(Name.MOVE, item, { from, to }, items => {
        items.splice(from, 1);
        items.splice(to, 0, item);
      });
    }

    static remove(item, at) {
      return new Move(Name.REMOVE, item, { at }, items => {
        items.splice(at, 1);
      });
    }
  };

  const Reconciler = class {

    static calculateMoves(current, next) {

      const makeMoves = (reversed = false) => {
        const source = [...current];
        const target  = [...next];
        const moves = [];

        const makeMove = move => {
          move.make(source);
          moves.push(move);
        };
        for (let i = 0; i < source.length; i++) {
          const item = source[i];
          if (!target.includes(item)) {
            makeMove(Move.remove(item, i));
          }
        }
        for (const item of target) {
          if (!source.includes(item)) {
            const index = target.indexOf(item);
            makeMove(Move.insert(item, index));
          }
        }
        const moveAndInsert = index => {
          const item = target[index];
          if (source[index] !== item) {
            const from = source.indexOf(item);
            makeMove(Move.move(item, from, index));
          }
        };

        if (reversed) {
          for (let i = target.length - 1; i >= 0; i--) {
            moveAndInsert(i);
          }
        } else {
          for (let i = 0; i < target.length; i++) {
            moveAndInsert(i);
          }
        }
        moves.result = source;
        return moves;
      };

      const moves = makeMoves();
      if (moves.filter(move => (move.name === Name.MOVE)).length > 1) {
        const alternativeMoves = makeMoves(true);
        return alternativeMoves.length < moves.length ? alternativeMoves : moves;
      }
      return moves;
    }
  };

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  loader.define('core/reconciler', Reconciler);
}


{
  const Document = class {

    static setAttribute(element, name, value) {
      const attr = opr.Toolkit.utils.lowerDash(name);
      element.setAttribute(attr, value);
    }

    static removeAttribute(element, name) {
      const attr = opr.Toolkit.utils.lowerDash(name);
      element.removeAttribute(attr);
    }

    static setDataAttribute(element, name, value) {
      element.dataset[name] = value;
    }

    static removeDataAttribute(element, name) {
      delete element.dataset[name];
    }

    static setStyleProperty(element, prop, value) {
      element.style[prop] = value;
    }

    static removeStyleProperty(element, prop, value) {
      element.style[prop] = null;
    }

    static addClassName(element, className) {
      element.classList.add(className);
    }

    static removeClassName(element, className) {
      element.classList.remove(className);
    }

    static addEventListener(element, name, listener) {
      element.addEventListener(name, listener);
    }

    static removeEventListener(element, name, listener) {
      element.removeEventListener(name, listener);
    }

    static appendChild(child, parent) {
      parent.appendChild(child);
    }

    static replaceChild(child, replaced, parent) {
      parent.replaceChild(child, replaced);
    }

    static removeChild(child, parent) {
      parent.removeChild(child);
    }

    static moveChild(child, from, to, parent) {
      parent.removeChild(child);
      parent.insertBefore(child, parent.childNodes[to]);
    }

    static setTextContent(element, text) {
      element.textContent = text;
    }

    static createElement(node) {
      const {
        name,
        text,
        attrs,
        dataset,
        listeners,
        style,
        classNames,
      } = node;

      const element = document.createElement(name);
      if (text) {
        this.setTextContent(element, text);
      }
      Object.entries(listeners).forEach(([name, listener]) => {
        this.addEventListener(element, name, listener);
      });
      Object.entries(attrs).forEach(([attr, value]) => {
        this.setAttribute(element, attr, value);
      });
      Object.entries(dataset).forEach(([attr, value]) => {
        this.setDataAttribute(element, attr, value);
      });
      Object.entries(style).forEach(([prop, value]) => {
        this.setStyleProperty(element, prop, value);
      });
      classNames.forEach(className => {
        this.addClassName(element, className);
      });
      return element;
    };

    static createComment(placeholder) {
      return document.createComment(placeholder.text);
    }

    static attachElementTree(node, callback) {
      const element = node.isComponent() ? node.childElement : node;
      let domNode;
      if (element) {
        domNode = this.createElement(element);
        if (element.children) {
          for (let child of element.children) {
            this.attachElementTree(child, childNode => {
              domNode.appendChild(childNode);
            });
          }
        }
        element.ref = domNode;
      } else {
        domNode = this.createComment(node.placeholder);
        node.placeholder.ref = domNode;
      }
      if (callback) {
        callback(domNode);
      }
      return domNode;
    }
  };

  loader.define('core/document', Document);
}


{
  const INIT = Symbol('init');

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
    return state;
  };

  coreReducer.commands = {
    init: state => ({
      type: INIT,
      state
    })
  };

  const combineReducers = (...reducers) => {
    const commands = {};
    const reducer = (state, command) => {
      [coreReducer, ...reducers].forEach(reducer => {
        state = reducer(state, command);
      });
      return state;
    };
    [coreReducer, ...reducers].forEach(reducer => {
      // TODO: show warning or error when overriding
      Object.assign(commands, reducer.commands);
    });
    reducer.commands = commands;
    return reducer;
  };

  const addDataPrefix = attr => 'data' + attr[0].toUpperCase() + attr.slice(1);

  const lowerDash = name => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const getEventName = name => {
    switch (name) {
      case 'onDoubleClick':
        return  'dblclick';
    }
    return name.slice(2).toLowerCase();
  }

  const createUUID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
      .toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  const Utils = {
    combineReducers,
    addDataPrefix,
    lowerDash,
    getEventName,
    createUUID,
  };

  loader.define('core/utils', Utils);
}


{
  loader.prefix('core', '/src/');

  const {
    SUPPORTED_ATTRIBUTES,
    SUPPORTED_EVENTS,
    SUPPORTED_STYLES,
    SUPPORTED_FILTERS,
    SUPPORTED_TRANSFORMS
  } = loader.get('core/consts');
  const {
    VirtualNode, Root, Component, VirtualElement, Comment,
  } = loader.get('core/core-types');

  const App = loader.get('core/app');
  const Sandbox = loader.get('core/sandbox');
  const Store = loader.get('core/store');
  const Template = loader.get('core/template');
  const ComponentTree = loader.get('core/component-tree');
  const ComponentLifecycle = loader.get('core/component-lifecycle');
  const Diff = loader.get('core/diff');
  const Patch = loader.get('core/patch');
  const Reconciler = loader.get('core/reconciler');
  const Document = loader.get('core/document');
  const utils = loader.get('core/utils');
  const create = root => new App(root);

  const Toolkit = {
    // constants
    SUPPORTED_ATTRIBUTES, SUPPORTED_EVENTS,
    SUPPORTED_STYLES, SUPPORTED_FILTERS, SUPPORTED_TRANSFORMS,
    // core classes
    Store, App, ComponentTree, ComponentLifecycle, Document,
    Diff, Patch, Reconciler, Template, Sandbox,
    // core types
    VirtualNode, Root, Component, VirtualElement, Comment,
    // utils
    utils, create,

    debug: false,
    ready: async () => {},
  };
  Object.freeze(Toolkit);

  window.opr = window.opr || {};
  window.opr.Toolkit = Toolkit;
}
