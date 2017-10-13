{
  const isBrowser = 'object' === typeof window;

  /** Path => module mapping. */
  const registry = new Map();

  /** Path => module dependency symbols mapping */
  const dependencySymbols = new Map();

  const prefixes = new Map();

  const concatenatePaths = (...paths) =>
      paths.map(path => path.replace(/(^\/)/g, ''))
          .join('/')
          .replace(/\/+/g, '/')
          .replace(/\:\//g, '://');

  const getResourcePath = path => {
    const getRealPath = path => {
      if (path.endsWith('.css')) {
        return path;
      }
      if (path.endsWith('/')) {
        return `${path}main.js`;
      }
      return `${path}.js`;
    };
    for (let [name, prefix] of prefixes) {
      if (path.startsWith(name)) {
        return getRealPath(concatenatePaths(prefix, path));
      }
    }
    return getRealPath(path);
  };

  const appendScriptToHead = async path => {
    return new Promise((resolve, reject) => {
      module.exports = null;
      const script = document.createElement('script');
      const resourcePath = getResourcePath(path);
      script.src = resourcePath;
      script.onload = () => {
        registry.set(path, module.exports);
        resolve(module.exports);
      };
      script.onerror = error => {
        console.error(`Error loading module "${path}" from "${resourcePath}"!`);
        reject(error);
      };
      document.head.appendChild(script);
    });
  };

  const requireUncached = path => {
    const resourcePath = getResourcePath(path);
    decache(resourcePath);
    return require(resourcePath);
  };

  const loadModule = async path => {
    if (isBrowser) {
      return appendScriptToHead(path);
    }
    return requireUncached(path);
  };

  const getPath = path =>
      typeof path === 'symbol' ? String(path).slice(7, -1) : path;

  let context = null;

  let readyPromise = Promise.resolve();

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
      if (!registry.get(path)) {
        registry.set(path, module);
      }
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
      return this.resolve(path, loadModule);
    }

    static async resolve(path, loader = loadModule) {
      path = getPath(path);
      let module = registry.get(path);
      if (module) {
        return module;
      }
      context = path;
      module = await loader(path);
      if (module.init) {
        const result = module.init();
        if (result instanceof Promise) {
          await result;
        }
      }
      registry.set(path, module);
      return module;
    }

    static async foreload(id) {

      let done;
      const currentReadyPromise = readyPromise;
      readyPromise = new Promise(resolve => {
        done = resolve;
      });
      await currentReadyPromise;

      const module = await this.preload(id);
      done();
      return module;
    }

    static async preload(id) {

      const path = getPath(id);
      let module = registry.get(path);
      if (module) {
        return module;
      }
      module = await this.require(path);
      const symbols = dependencySymbols.get(path) || [];
      for (let symbol of symbols) {
        await this.preload(symbol);
      }
      return module;
    }

    static getPath(id) {
      return getResourcePath(id);
    }

    static get $debug() {
      return {
        getSymbols: path => dependencySymbols.get(path) || [],
        getModules: () => Array.from(registry.entries()),
        reset: () => {
          readyPromise = Promise.resolve();
          registry.clear();
          dependencySymbols.clear();
        },
      };
    }
  };

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
    // search events
    'onSearch',
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
    'for',
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
    'httpEquiv',
    'icon',
    'id',
    'incremental',
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
    'summary',
    'tabIndex',
    'target',
    'title',
    'type',
    'useMap',
    'value',
    'width',
    'wmode',
    'wrap',
  ];

  const getSupportedStyles = element => {
    const keys = Object.keys(element.style);
    if (keys.length) {
      return keys;
    }
    return Object.keys(Object.getPrototypeOf(element.style))
        .filter(key => !key.includes('-'));
  };

  const SUPPORTED_STYLES = getSupportedStyles(document.documentElement);

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
    'saturate',
  ];

  const SUPPORTED_TRANSFORMS = [
    'matrix',      'matrix3d',   'translate', 'translate3d', 'translateX',
    'translateY',  'translateZ', 'scale',     'scale3d',     'scaleX',
    'scaleY',      'scaleZ',     'rotate',    'rotate3d',    'rotateX',
    'rotateY',     'rotateZ',    'skew',      'skewX',       'skewY',
    'perspective',
  ];

  const Consts = {
    SUPPORTED_ATTRIBUTES,
    SUPPORTED_EVENTS,
    SUPPORTED_STYLES,
    SUPPORTED_FILTERS,
    SUPPORTED_TRANSFORMS,
  };

  loader.define('core/consts', Consts);
}

{
  const SANDBOX_CONTEXT = Symbol('sandbox-context');

  const ID = Symbol('id');

  class VirtualNode {

    constructor(key) {
      this.key = key;
      this[ID] = opr.Toolkit.utils.createUUID();
      this.parentNode = null;
    }

    get id() {
      return this[ID];
    }

    get parentElement() {
      if (this.parentNode) {
        return this.parentNode.isElement() ? this.parentNode :
                                             this.parentNode.parentElement;
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
      return node && this.nodeType === node.nodeType && this.key === node.key;
    }
  }

  class Component extends VirtualNode {

    constructor(props = {}, children = []) {
      super(props.key);
      this.props = props;
      this.children = children;
      if (this.key === undefined && this.getKey) {
        this.key = this.getKey.call(this.sandbox);
      }
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

    connectTo(service, listeners) {
      opr.Toolkit.assert(
          service.connect instanceof Function,
          'Services have to define the connect() method');
      const disconnect = service.connect(listeners);
      opr.Toolkit.assert(
          disconnect instanceof Function,
          'The result of the connect() method has to be a disconnect() method');
      disconnect.service = service;
      this.cleanUpTasks.push(disconnect);
    }

    appendChild(child) {
      this.child = child;
      this.child.parentNode = this;
      this.comment.parentNode = null;  // TODO: unit test
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
      this.rootElement.ref.dispatchEvent(new CustomEvent(name, {
        detail: data,
        bubbles: true,
        composed: true,
      }))
    }

    onCreated() {
    }

    onAttached() {
    }

    onPropsReceived(props) {
    }

    onUpdated() {
    }

    onDestroyed() {
    }

    onDetached() {
    }

    get nodeType() {
      return 'component';
    }

    get ref() {
      return this.childElement ? this.childElement.ref : this.placeholder.ref;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.constructor === node.constructor;
    }
  }

  class ComponentElement extends HTMLElement {

    cssImports(paths) {
      return paths.map(loader.getPath)
          .map(path => `@import url(${path});`)
          .join('\n');
    }

    async connectedCallback() {
      const shadow = this.attachShadow({
        mode: 'open',
      });
      const data = {
        styles: this.props.styles,
        onStylesLoaded: () =>
            this.props.onLoad(shadow.querySelector(':host > slot')),
      };
      opr.Toolkit.render(props => this.render(props), shadow, data);
    }

    disconnectedCallback() {
      this.props.onUnload();
    }

    render({styles = [], onStylesLoaded}) {
      return [
        'slot',
        [
          'style',
          {
            onLoad: onStylesLoaded,
          },
          this.cssImports(styles),
        ],
      ];
    }
  }

  class Root extends Component {

    constructor(props, children) {
      super(props, children);
      this.state = null;
      this.reducer = opr.Toolkit.utils.combineReducers(...this.getReducers());
      this.dispatch = command => {
        const prevState = this.state;
        this.state = this.reducer(prevState, command);
        this.renderer.updateDOM(command, prevState, this.state);
      };
      this.commands = opr.Toolkit.utils.createCommandsDispatcher(
          this.reducer, this.dispatch);
      this.plugins = new Map();
    }

    static get displayName() {
      return this.name;
    }

    static register() {
      let ElementClass = customElements.get(this.elementName);
      if (!ElementClass) {
        ElementClass = class extends ComponentElement {};
        customElements.define(this.elementName, ElementClass);
        this.prototype.elementClass = ElementClass;
      }
    }

    static styles() {
      return [];
    }

    getReducers() {
      return [];
    }

    async getInitialState(props = {}) {
      return props;
    }

    get parentElement() {
      const containerElement = new VirtualElement('root');
      containerElement.children.push(this);
      containerElement.ref = this.renderer.container;
      return containerElement;
    }

    get nodeType() {
      return 'root';
    }
  }

  class VirtualElement extends VirtualNode {

    constructor(name, key) {
      super(key);
      this.name = name;
      this.attrs = {};
      this.dataset = {};
      this.style = {};
      this.classNames = [];
      this.listeners = {};
      this.metadata = {};
      this.children = [];
      this.text = null;
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
  }

  class Comment extends VirtualNode {

    constructor(text, parentNode) {
      super();
      this.text = text;
      this.parentNode = parentNode;
      this.ref = null;
    }

    get nodeType() {
      return 'comment';
    }
  }

  const CoreTypes = {
    VirtualNode,
    Component,
    Root,
    VirtualElement,
    Comment,
  };

  loader.define('core/nodes', CoreTypes);
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
        event => nextListeners.includes(event) &&
            current[event] !== next[event] &&
            (current[event].source === undefined &&
                 next[event].source === undefined ||
             current[event].source !== next[event].source));

    for (let event of added) {
      patches.push(Patch.addListener(event, next[event], target));
    }
    for (let event of removed) {
      patches.push(Patch.removeListener(event, current[event], target));
    }
    for (let event of changed) {
      patches.push(
          Patch.replaceListener(event, current[event], next[event], target));
    }
  };

  const metadataPatches = (current = {}, next = {}, target = null, patches) => {
    const Patch = opr.Toolkit.Patch;

    const keys = Object.keys(current);
    const nextKeys = Object.keys(next);

    const added = nextKeys.filter(key => !keys.includes(key));
    const removed = keys.filter(key => !nextKeys.includes(key));
    const changed = keys.filter(
        key =>
            nextKeys.includes(key) && !Diff.deepEqual(current[key], next[key]));

    for (let key of added) {
      patches.push(Patch.addMetadata(key, next[key], target));
    }
    for (let key of removed) {
      patches.push(Patch.removeMetadata(key, target));
    }
    for (let key of changed) {
      patches.push(Patch.replaceMetadata(key, next[key], target));
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
      patches.push(
          opr.Toolkit.Patch.addStyleProperty(prop, next[prop], target));
    }
    for (let prop of removed) {
      patches.push(opr.Toolkit.Patch.removeStyleProperty(prop, target));
    }
    for (let prop of changed) {
      patches.push(
          opr.Toolkit.Patch.replaceStyleProperty(prop, next[prop], target));
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
      patches.push(
          opr.Toolkit.Patch.addDataAttribute(attr, next[attr], target));
    }
    for (let attr of removed) {
      patches.push(opr.Toolkit.Patch.removeDataAttribute(attr, target));
    }
    for (let attr of changed) {
      patches.push(
          opr.Toolkit.Patch.replaceDataAttribute(attr, next[attr], target));
    }
  };

  const attributePatches =
      (current = {}, next = {}, target = null, patches) => {
        const attrs = Object.keys(current);
        const nextAttrs = Object.keys(next);

        const added = nextAttrs.filter(attr => !attrs.includes(attr));
        const removed = attrs.filter(attr => !nextAttrs.includes(attr));
        const changed = attrs.filter(
            attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

        for (let attr of added) {
          patches.push(
              opr.Toolkit.Patch.addAttribute(attr, next[attr], target));
        }
        for (let attr of removed) {
          patches.push(opr.Toolkit.Patch.removeAttribute(attr, target));
        }
        for (let attr of changed) {
          patches.push(
              opr.Toolkit.Patch.replaceAttribute(attr, next[attr], target));
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
    metadataPatches(current.metadata, next.metadata, current, patches);
    if (current.text !== null && next.text === null) {
      patches.push(opr.Toolkit.Patch.removeTextContent(current));
    }
    childrenPatches(current.children, next.children, current, patches);
    if (next.text !== null && current.text !== next.text) {
      patches.push(opr.Toolkit.Patch.setTextContent(current, next.text));
    }
  };

  const componentPatches = (current, next, patches) => {
    if (!Diff.deepEqual(current.props, next.props)) {
      if (current.constructor.prototype.hasOwnProperty('onUpdated') ||
          current.constructor.prototype.hasOwnProperty('onPropsReceived')) {
        patches.push(opr.Toolkit.Patch.updateComponent(current, next.props));
      } else {
        current.props = next.props;
        current.sandbox.props = next.props;
      }
    }
    calculatePatches(current.child, next.child, current, patches);
  };

  const reconcileNode = (current, next, parent, index, patches) => {

    const Patch = opr.Toolkit.Patch;

    if (current === next) {
      // already inserted
      return;
    }
    if (areCompatible(current, next)) {
      if (current.isElement()) {
        elementPatches(current, next, patches);
      }
      if (current.isComponent()) {
        componentPatches(current, next, patches);
      }
    } else {
      patches.push(Patch.removeChildNode(current, index, parent));
      patches.push(Patch.insertChildNode(next, index, parent));
    }
  };

  const calculatePatches =
      (current, next, parent = null, patches = []) => {

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
              componentPatches(current, next, patches);
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

  class Diff {

    static deepEqual(current, next) {
      if (Object.is(current, next)) {
        return true;
      }
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
      }
      return false;
    }

    static calculate(tree, nextTree, root) {
      return calculatePatches(tree, nextTree, root);
    }
  }

  loader.define('core/diff', Diff);
}

{
  class Document {

    static setAttribute(element, name, value) {
      const attr = opr.Toolkit.utils.getAttributeName(name);
      element.setAttribute(attr, value);
    }

    static removeAttribute(element, name) {
      const attr = opr.Toolkit.utils.getAttributeName(name);
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

    static setMetadata(element, key, value) {
      element[key] = value;
    }

    static removeMetadata(element, key) {
      delete element[key];
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
    }

    static createComment(placeholder) {
      return document.createComment(placeholder.text);
    }

    static attachElementTree(node, callback) {
      const element = node.isComponent() ? node.childElement : node;
      let domNode;
      if (element) {
        domNode = this.createElement(element);
        Object.keys(element.metadata).forEach(key => {
          domNode[key] = element.metadata[key];
        });
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
  }

  loader.define('core/document', Document);
}

{
  class Lifecycle {

    /*
     * onCreated(),
     * onAttached(),
     * onPropsReceived(nextProps),
     * onUpdated(prevProps),
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
          throw new Error(`Unsupported node type: ${node.nodeType}`);
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
          throw new Error(`Unsupported node type: ${node.nodeType}`);
      }
    }

    static onComponentReceivedProps(component, nextProps) {
      component.onPropsReceived.call(component.sandbox, nextProps);
    }

    static onComponentUpdated(component, prevProps) {
      component.onUpdated.call(component.sandbox, prevProps);
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
          throw new Error(`Unsupported node type: ${node.nodeType}`);
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
          throw new Error(`Unsupported node type: ${node.nodeType}`);
      }
    }

    static beforePatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentReceivedProps(patch.target, patch.props);
        case Type.CREATE_ROOT_COMPONENT:
          return patch.root.onCreated.call(patch.root.sandbox);
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
          return this.onComponentUpdated(patch.target, patch.prevProps);
        case Type.CREATE_ROOT_COMPONENT:
          return patch.root.onAttached.call(patch.root.sandbox);
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
      patches = [...patches].reverse();
      for (const patch of patches) {
        this.afterPatchApplied(patch);
      }
    }
  }

  loader.define('core/lifecycle', Lifecycle);
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

    ADD_METADATA: Symbol('add-metadata'),
    REPLACE_METADATA: Symbol('replace-metadata'),
    REMOVE_METADATA: Symbol('remove-metadata'),

    INSERT_CHILD_NODE: Symbol('insert-child-node'),
    MOVE_CHILD_NODE: Symbol('move-child-node'),
    REMOVE_CHILD_NODE: Symbol('remove-child-node'),

    SET_TEXT_CONTENT: Symbol('set-text-content'),
    REMOVE_TEXT_CONTENT: Symbol('remove-text-content'),
  });

  class Patch {

    constructor(type, props) {
      Object.assign(this, {type}, props);
    }

    static createRootComponent(root) {
      return new Patch(Type.CREATE_ROOT_COMPONENT, {
        root,
        apply: function() {
          // TODO: investigate
          root.props = null;
        },
      });
    }

    static updateComponent(target, props) {
      return new Patch(Type.UPDATE_COMPONENT, {
        target,
        props,
        apply: function() {
          this.prevProps = target.props;
          if (target instanceof opr.Toolkit.Root) {
            return;
          }
          target.props = props;
        },
      });
    }

    static addAttribute(name, value, target) {
      return new Patch(Type.ADD_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setAttribute(name, value);
          opr.Toolkit.Document.setAttribute(target.ref, name, value);
        },
      });
    }

    static replaceAttribute(name, value, target) {
      return new Patch(Type.REPLACE_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setAttribute(name, value);
          opr.Toolkit.Document.setAttribute(target.ref, name, value);
        },
      });
    }

    static removeAttribute(name, target) {
      return new Patch(Type.REMOVE_ATTRIBUTE, {
        name,
        target,
        apply: function() {
          target.removeAttribute(name);
          opr.Toolkit.Document.removeAttribute(target.ref, name);
        },
      });
    }

    static addDataAttribute(name, value, target) {
      return new Patch(Type.ADD_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setDataAttribute(name, value);
          opr.Toolkit.Document.setDataAttribute(target.ref, name, value);
        },
      });
    }

    static replaceDataAttribute(name, value, target) {
      return new Patch(Type.REPLACE_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setDataAttribute(name, value);
          opr.Toolkit.Document.setDataAttribute(target.ref, name, value);
        },
      });
    }

    static removeDataAttribute(name, target) {
      return new Patch(Type.REMOVE_DATA_ATTRIBUTE, {
        name,
        target,
        apply: function() {
          target.removeDataAttribute(name);
          opr.Toolkit.Document.removeDataAttribute(target.ref, name);
        },
      });
    }
    static addStyleProperty(property, value, target) {
      return new Patch(Type.ADD_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: function() {
          target.setStyleProperty(property, value);
          opr.Toolkit.Document.setStyleProperty(target.ref, property, value);
        },
      });
    }

    static replaceStyleProperty(property, value, target) {
      return new Patch(Type.REPLACE_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: function() {
          target.setStyleProperty(property, value);
          opr.Toolkit.Document.setStyleProperty(target.ref, property, value);
        },
      });
    }

    static removeStyleProperty(property, target) {
      return new Patch(Type.REMOVE_STYLE_PROPERTY, {
        property,
        target,
        apply: function() {
          target.removeStyleProperty(property);
          opr.Toolkit.Document.removeStyleProperty(target.ref, property);
        },
      });
    }

    static addClassName(name, target) {
      return new Patch(Type.ADD_CLASS_NAME, {
        name,
        target,
        apply: function() {
          target.addClassName(name);
          opr.Toolkit.Document.addClassName(target.ref, name);
        },
      });
    }

    static removeClassName(name, target) {
      return new Patch(Type.REMOVE_CLASS_NAME, {
        name,
        target,
        apply: function() {
          target.removeClassName(name);
          opr.Toolkit.Document.removeClassName(target.ref, name);
        },
      });
    }

    static addListener(event, listener, target) {
      return new Patch(Type.ADD_LISTENER, {
        event,
        listener,
        target,
        apply: function() {
          target.addListener(event, listener);
          opr.Toolkit.Document.addEventListener(target.ref, event, listener);
        },
      });
    }

    static replaceListener(event, removed, added, target) {
      return new Patch(Type.REPLACE_LISTENER, {
        event,
        removed,
        added,
        target,
        apply: function() {
          target.removeListener(event, removed);
          opr.Toolkit.Document.removeEventListener(target.ref, event, removed);
          target.addListener(event, added);
          opr.Toolkit.Document.addEventListener(target.ref, event, added);
        },
      });
    }

    static removeListener(event, listener, target) {
      return new Patch(Type.REMOVE_LISTENER, {
        event,
        listener,
        target,
        apply: function() {
          target.removeListener(event, listener);
          opr.Toolkit.Document.removeEventListener(target.ref, event, listener);
        },
      });
    }

    static addMetadata(key, value, target) {
      return new Patch(Type.ADD_METADATA, {
        key,
        value,
        target,
        apply: function() {
          target.metadata[key] = value;
          opr.Toolkit.Document.setMetadata(target.ref, key, value);
        },
      });
    }

    static replaceMetadata(key, value, target) {
      return new Patch(Type.REPLACE_METADATA, {
        key,
        value,
        target,
        apply: function() {
          target.metadata[key] = value;
          opr.Toolkit.Document.setMetadata(target.ref, key, value);
        },
      });
    }

    static removeMetadata(key, target) {
      return new Patch(Type.REMOVE_METADATA, {
        key,
        target,
        apply: function() {
          delete target.metadata[key];
          opr.Toolkit.Document.removeMetadata(target.ref, key);
        },
      });
    }

    static addElement(element, parent) {
      return new Patch(Type.ADD_ELEMENT, {
        element,
        parent,
        apply: function() {
          parent.appendChild(element);
          opr.Toolkit.Document.attachElementTree(element, domElement => {
            parent.parentElement.ref.appendChild(domElement);
          });
        },
      });
    }

    static removeElement(element, parent) {
      return new Patch(Type.REMOVE_ELEMENT, {
        element,
        parent,
        apply: function() {
          parent.removeChild(element);
          element.ref.remove();
        },
      });
    }

    static addComponent(component, parent) {
      return new Patch(Type.ADD_COMPONENT, {
        component,
        parent,
        apply: function() {
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
              opr.Toolkit.Document.replaceChild(
                  domNode, comment, parentDomNode);
            });
          }
        },
      });
    }

    static removeComponent(component, parent) {
      return new Patch(Type.REMOVE_COMPONENT, {
        component,
        parent,
        apply: function() {
          const domChildNode =
              (component.childElement || component.placeholder).ref;
          parent.removeChild(component);
          parent.placeholder.ref =
              opr.Toolkit.Document.createComment(parent.placeholder);
          parent.parentElement.ref.replaceChild(
              parent.placeholder.ref, domChildNode);
        },
      });
    }

    static insertChildNode(node, at, parent) {
      return new Patch(Type.INSERT_CHILD_NODE, {
        node,
        at,
        parent,
        apply: function() {
          parent.insertChild(node, at);
          opr.Toolkit.Document.attachElementTree(node, domNode => {
            parent.ref.insertBefore(domNode, parent.ref.childNodes[at]);
          });
        },
      });
    }

    static moveChildNode(node, from, to, parent) {
      return new Patch(Type.MOVE_CHILD_NODE, {
        node,
        from,
        to,
        parent,
        apply: function() {
          parent.moveChild(node, from, to);
          opr.Toolkit.Document.moveChild(node.ref, from, to, parent.ref);
        },
      });
    }

    static removeChildNode(node, at, parent) {
      return new Patch(Type.REMOVE_CHILD_NODE, {
        node,
        at,
        parent,
        apply: function() {
          parent.removeChild(node);
          opr.Toolkit.Document.removeChild(node.ref, parent.ref);
        },
      });
    }

    static setTextContent(element, text) {
      return new Patch(Type.SET_TEXT_CONTENT, {
        element,
        text,
        apply: function() {
          element.text = text;
          opr.Toolkit.Document.setTextContent(element.ref, text);
        },
      });
    }

    static removeTextContent(element) {
      return new Patch(Type.REMOVE_TEXT_CONTENT, {
        element,
        apply: function() {
          element.text = null;
          opr.Toolkit.Document.setTextContent(element.ref, '');
        },
      });
    }

    static get Type() {
      return Object.assign({}, Type);
    }
  }

  loader.define('core/patch', Patch);
}

{
  const Name = {
    INSERT: Symbol('insert'),
    MOVE: Symbol('move'),
    REMOVE: Symbol('remove'),
  };

  class Move {

    constructor(name, item, props, make) {
      Object.assign(this, {name, item, make}, props);
    }

    static insert(item, at) {
      return new Move(Name.INSERT, item, {at}, items => {
        items.splice(at, 0, item);
      });
    }

    static move(item, from, to) {
      return new Move(Name.MOVE, item, {from, to}, items => {
        items.splice(from, 1);
        items.splice(to, 0, item);
      });
    }

    static remove(item, at) {
      return new Move(Name.REMOVE, item, {at}, items => {
        items.splice(at, 1);
      });
    }
  }

  class Reconciler {

    static calculateMoves(current, next) {

      const makeMoves = (reversed = false) => {
        const source = [...current];
        const target = [...next];
        const moves = [];

        const makeMove = move => {
          move.make(source);
          moves.push(move);
        };
        for (let i = source.length - 1; i >= 0; i--) {
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
        return alternativeMoves.length < moves.length ? alternativeMoves :
                                                        moves;
      }
      return moves;
    }
  }

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  loader.define('core/reconciler', Reconciler);
}

{
  class Renderer {

    constructor(container, settings, root) {
      this.container = container;
      this.settings = settings;
      this.root = root;
      this.plugins = new Map();
      this.installPlugins();
    }

    calculatePatches(command, prevState, nextState) {
      const patches = [];
      if (prevState === null) {
        patches.push(opr.Toolkit.Patch.createRootComponent(this.root));
      }
      if (!opr.Toolkit.Diff.deepEqual(prevState, nextState)) {
        patches.push(opr.Toolkit.Patch.updateComponent(this.root, nextState));
        const componentTree =
            opr.Toolkit.VirtualDOM.createChildTree(this.root, this.root.child);
        const childTreePatches = opr.Toolkit.Diff.calculate(
            this.root.child, componentTree, this.root);
        patches.push(...childTreePatches);
      }
      return patches;
    }

    get debug() {
      return this.settings.level === 'debug';
    }

    updateDOM(command, prevState, nextState) {
      /* eslint-disable no-console */
      if (this.debug) {
        console.time('=> Render time');
      }
      const patches = this.calculatePatches(command, prevState, nextState);
      if (patches.length) {
        opr.Toolkit.Lifecycle.beforeUpdate(patches);
        for (const patch of patches) {
          patch.apply();
        }
        opr.Toolkit.Lifecycle.afterUpdate(patches);
      }
      if (this.debug) {
        console.log(
            'Command:', command.type,
            `for "${this.root.constructor.displayName}"`);
        if (patches.length) {
          console.log('Patches:', patches);
        }
        console.timeEnd('=> Render time');
        console.log(''.padStart(48, '-'));
      }
      /* eslint-enable no-console */
    }

    installPlugins() {
      for (const plugin of this.settings.plugins) {
        if (this.plugins.get(plugin.id)) {
          console.warn(`Plugin "${id}" is already installed!`);
          return;
        }
        const uninstall = plugin.install({
          container: this.container,
        });
        this.plugins.set(plugin.id, {
          ref: plugin,
          uninstall,
        });
      }
    }
  }

  loader.define('core/renderer', Renderer);
}

{
  const isFunction = (target, property) =>
      typeof target[property] === 'function';

  const delegated = [
    'commands',
    'constructor',
    'container',
    'dispatch',
    'elementName',
    'getKey',
    'id',
    'ref',
  ];
  const methods = [
    'broadcast',
    'connectTo',
  ];

  const CHILDREN = 'children';
  const PROPS = 'props';

  const createBoundListener = (listener, component, context) => {
    const boundListener = listener.bind(context);
    boundListener.source = listener;
    boundListener.component = component;
    return boundListener;
  };

  class Sandbox {

    static create(component) {
      const blacklist =
          Object.getOwnPropertyNames(opr.Toolkit.Component.prototype);
      const autobound = {};
      const state = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (property === '$component') {
            return component;
          }
          if (property === PROPS) {
            if (state.props !== undefined) {
              return state.props;
            }
            return target instanceof opr.Toolkit.Root ? target.state :
                                                        target.props;
          }
          if (property === CHILDREN) {
            if (state.children !== undefined) {
              return state.children;
            }
            return target.children;
          }
          if (delegated.includes(property)) {
            return target[property];
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
          if ([CHILDREN, PROPS].includes(property)) {
            state[property] = value;
          }
          return true;
        },
      });
    }
  }

  loader.define('core/sandbox', Sandbox);
}

{
  class Service {

    static validate(listeners) {
      if (opr.Toolkit.isDebug()) {
        // clang-format off
        /* eslint-disable max-len */
        const keys = Object.keys(listeners);
        opr.Toolkit.assert(
            this.events instanceof Array,
            `Service "${this.name}" does not provide information about valid events, implement "static get events() { return ['foo', 'bar']; }"`);
        opr.Toolkit.assert(
            this.events.length > 0,
            `Service "${this.name}" returned an empty list of valid events, the list returned from "static get event()" must contain at least one event name`);
        const unsupportedKeys =
            Object.keys(listeners).filter(key => !this.events.includes(key));
        for (const unsupportedKey of unsupportedKeys) {
          opr.Toolkit.warn(
              `Unsupported listener specified "${unsupportedKey}" when connecting to ${this.name}`);
        }
        const supportedKeys = this.events.filter(event => keys.includes(event));
        opr.Toolkit.assert(
            supportedKeys.length > 0,
            `No valid listener specified when connecting to ${this.name}, use one of [${this.events.join(', ')}]`);
        for (const supportedKey of supportedKeys) {
          opr.Toolkit.assert(
              listeners[supportedKey] instanceof Function,
              `Specified listener "${supportedKey}" for ${this.name} is not a function`);
        }
        /* eslint-enable max-len */
        // clang-format on
      }
      return this.events.filter(event => listeners[event] instanceof Function);
    }
  }

  loader.define('core/service', Service);
}

{
  class Template {

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
      classNames = classNames.replace(/( )+/g, ' ').trim().split(' ');
      return [...new Set(classNames)];
    }

    static getCompositeValue(obj = {}, whitelist) {
      const names = Object.keys(obj).filter(name => whitelist.includes(name));
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
          return this.getCompositeValue(
              value, opr.Toolkit.SUPPORTED_TRANSFORMS);
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
          }
          return Type.PROPS;
      }
    }

    static validate(template) {

      const validParamTypes =
          'properties object, text content or first child element';

      const createErrorDescription = (val, i, types) =>
          `Invalid parameter type "${val}" at index ${i}, expecting: ${types}`;

      if (template === null || template === false) {
        return {types: null};
      }

      if (!Array.isArray(template)) {
        const error =
            new Error(`Specified template: "${template}" is not an array!`);
        console.error('Specified template', template, 'is not an array!');
        return {error};
      }

      const Type = Template.ItemType;
      const types = template.map(this.getItemType);

      if (![Type.STRING, Type.COMPONENT].includes(types[0])) {
        console.error(
            'Invalid element:', template[0],
            ', expecting component or tag name');
        const error =
            new Error(`Invalid parameter type "${types[0]}" at index 0`);
        return {error, types};
      }

      if (types.length <= 1) {
        return {types};
      }

      let firstChildIndex = 1;

      switch (types[1]) {
        case Type.STRING:
          if (types.length > 2) {
            const error = new Error('Text elements cannot have child nodes');
            console.error(
                'Text elements cannot have child nodes:', template.slice(1));
            return {
              error,
              types,
            };
          } else if (types[0] === Type.COMPONENT) {
            const error = new Error('Subcomponents do not accept text content');
            console.error(
                'Subcomponents do not accept text content:', template[1]);
            return {
              error,
              types,
            };
          }
        case Type.PROPS:
          firstChildIndex = 2;
        case Type.NULL:
        case Type.BOOLEAN:
          if (template[1] === true) {
            const error =
                new Error(createErrorDescription(types[1], 1, validParamTypes));
            console.error(
                'Invalid parameter', template[1],
                ', expecting:', validParamTypes);
            return {
              error,
              types,
            };
          }
        case Type.ELEMENT:
          if (types.length > 2) {
            if (types[2] === Type.STRING) {
              if (types.length > 3) {
                const error =
                    new Error('Text elements cannot have child nodes');
                console.error(
                    'Text elements cannot have child nodes:',
                    template.slice(2));
                return {
                  error,
                  types,
                };
              } else if (types[0] === Type.COMPONENT) {
                const error =
                    new Error('Subcomponents do not accept text content');
                console.error(
                    'Subcomponents do not accept text content:', template[2]);
                return {
                  error,
                  types,
                };
              }
              return {
                types,
              };
            }
          }
          for (let i = firstChildIndex; i < template.length; i++) {
            const expected = i === 1 ? validParamTypes : 'child element';
            if (types[i] !== Type.ELEMENT && template[i] !== null &&
                template[i] !== false) {
              const error = new Error(
                  `Invalid parameter type "${types[i]}" at index ${i}`);
              console.error(
                  'Invalid parameter:', template[i], ', expecting:', expected);
              return {
                error,
                types,
              };
            }
          }
          return {
            types,
          };
      }
      const error =
          new Error(createErrorDescription(types[1], 1, validParamTypes));
      console.error(
          'Invalid parameter', template[1], ', expecting:', validParamTypes);
      return {
        error,
        types,
      };
    }

    static describe(template) {

      const {types, error} = this.validate(template);

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
            return {[type]: template[0], props: template[1]};
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
  }

  loader.define('core/template', Template);
}

{
  class VirtualDOM {

    static getComponentClass(symbol) {
      const ComponentClass = loader.get(symbol);
      opr.Toolkit.assert(
          ComponentClass, `No component found for: ${String(symbol)}`);
      opr.Toolkit.assert(
          ComponentClass.prototype instanceof opr.Toolkit.Component,
          'Component class', ComponentClass.name,
          'must extend opr.Toolkit.Component');
      return ComponentClass;
    }

    static createComponentFrom(symbol, props, children) {
      const ComponentClass = this.getComponentClass(symbol);
      const normalizedProps = this.normalizeProps(ComponentClass, props);
      return new ComponentClass(normalizedProps, children);
    }

    static createElementInstance(description, component) {

      let element;

      if (description.props) {

        const props = description.props;
        element = new opr.Toolkit.VirtualElement(description.name, props.key);

        if (opr.Toolkit.isDebug()) {
          const unknownAttrs = Object.keys(props).filter(
              attr => !opr.Toolkit.utils.isSupportedAttribute(attr));
          for (const unknownAttr of unknownAttrs) {
            const suggestion = opr.Toolkit.SUPPORTED_ATTRIBUTES.find(
                attr => attr.toLowerCase() === unknownAttr.toLowerCase());
            if (suggestion) {
              opr.Toolkit.warn(
                  `Attribute name "${unknownAttr}"`,
                  `should be spelled "${suggestion}",`,
                  `check render() method of ${component.constructor.name}`);
            } else {
              opr.Toolkit.warn(
                  `Attribute name "${unknownAttr}" is not valid,`,
                  `check render() method of ${component.constructor.name}`);
            }
          }
        }

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
        Object.keys(dataset).forEach(attr => {
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
              const value =
                  opr.Toolkit.Template.getStyleValue(style[prop], prop);
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
        // metadata
        if (props.metadata) {
          Object.keys(props.metadata).forEach(key => {
            element.metadata[key] = props.metadata[key];
          });
        }
      } else {
        element = new opr.Toolkit.VirtualElement(description.name);
      }
      // text
      if (description.text) {
        element.text = description.text;
      }
      return element;
    }

    static createFromTemplate(template, previousNode, root, component) {
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
            previousNode, root);
      }
      return this.createElement(description, previousNode, root, component);
    }

    static createElement(description, previousNode, root, component) {
      const element = this.createElementInstance(description, component);
      const getPreviousChild = (index, {key = null}) => {
        if (element.isCompatible(previousNode)) {
          if (key !== null) {
            return previousNode.children.find(child => child.key === key);
          }
          return previousNode.children[index];
        }
        return null;
      };
      if (description.children) {
        element.children = description.children.map((childTemplate, index) => {
          const childDescription = opr.Toolkit.Template.describe(childTemplate);
          const child = this.createFromTemplate(
              childTemplate,
              getPreviousChild(index, childDescription.props || {}), root,
              component);
          child.parentNode = element;
          return child;
        });
      }
      return element;
    }

    static normalizeProps(ComponentClass, props = {}) {
      const defaultProps = ComponentClass.defaultProps;
      if (defaultProps) {
        const result = Object.assign({}, props);
        const keys = Object.keys(defaultProps);
        for (const key of keys) {
          if (props[key] === undefined) {
            result[key] = defaultProps[key];
          }
        }
        return result;
      }
      return props;
    }

    static createChildTree(root, previousTree) {

      let template;
      if (root.elementName) {
        // TODO: do better
        template = [
          root.elementName,
          {
            metadata: {
              component: root,
            },
          },
        ];
      } else {
        const sandbox = root.sandbox;
        sandbox.props = root.state;
        template = root.render.call(sandbox);

        opr.Toolkit.assert(
            template !== undefined,
            'Invalid undefined template returned when rendering:', root);
      }
      const tree = this.createFromTemplate(template, previousTree, root, root);
      if (tree) {
        tree.parentNode = root;
      }
      return tree;
    }

    static createComponent(
        symbol, props = {}, children = [], previousNode, root) {
      try {
        const instance = this.createComponentFrom(symbol, props, children);

        const sandbox = instance.isCompatible(previousNode) ?
            previousNode.sandbox :
            instance.sandbox;

        sandbox.props = instance.props;
        sandbox.children = children;

        let template;
        if (instance instanceof opr.Toolkit.Root) {
          const customElementName = instance.constructor.elementName;
          if (customElementName) {
            // TODO: static render after element will have attached
            template = [
              customElementName,
            ];
          } else {
            // clang-format off
            /* eslint-disable max-len */
            throw new Error(
                `No custom element name defined in "${instance.constructor.name}", implement "static get elementName()" method.`);
            /* eslint-enable max-len */
            // clang-format on
          }
        } else {
          instance.commands = root && root.commands || {};
          template = instance.render.call(sandbox);
        }

        opr.Toolkit.assert(
            template !== undefined,
            'Invalid undefined template returned when rendering:', instance);

        if (template) {
          const previousChild = previousNode && previousNode.isComponent() ?
              previousNode.child :
              null;
          instance.appendChild(
              this.createFromTemplate(template, previousChild, root, instance));
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
  }

  loader.define('core/virtual-dom', VirtualDOM);
}

{
  const INIT = Symbol('init');

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
    return state;
  };

  coreReducer.commands = {init: state => ({type: INIT, state})};

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

  const createCommandsDispatcher = (reducer, dispatch) => {
    const dispatcher = {};
    for (const key of Object.keys(reducer.commands)) {
      dispatcher[key] = (...args) => {
        dispatch(reducer.commands[key](...args));
      };
    }
    return dispatcher;
  };

  const addDataPrefix = attr => 'data' + attr[0].toUpperCase() + attr.slice(1);

  const lowerDash = name =>
      name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const getAttributeName = name => {
    switch (name) {
      case 'accessKey':
      case 'allowFullScreen':
      case 'allowTransparency':
      case 'autoComplete':
      case 'autoFocus':
      case 'autoPlay':
      case 'cellPadding':
      case 'cellSpacing':
      case 'charSet':
      case 'classID':
      case 'colSpan':
      case 'contentEditable':
      case 'contextMenu':
      case 'crossOrigin':
      case 'dateTime':
      case 'frameBorder':
      case 'hrefLang':
      case 'inputMode':
      case 'keyType':
      case 'marginHeight':
      case 'marginWidth':
      case 'maxLength':
      case 'minLength':
      case 'noValidate':
      case 'radioGroup':
      case 'readOnly':
      case 'rowSpan':
      case 'spellCheck':
      case 'srcDoc':
      case 'srcLang':
      case 'srcSet':
      case 'useMap':
      case 'tabIndex':
        return name.toLowerCase();
      case 'formAction':
      case 'formEncType':
      case 'formMethod':
      case 'formNoValidate':
      case 'formTarget':
      case 'htmlFor':
        return name.slice(4).toLowerCase();
      default:
        return lowerDash(name);
    }
  };

  const getEventName = name => {
    switch (name) {
      case 'onDoubleClick':
        return 'dblclick';
      default:
        return name.slice(2).toLowerCase();
    }
  };

  const createUUID = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() +
        s4() + s4();
  };

  const isSupportedAttribute = attr =>
      opr.Toolkit.SUPPORTED_ATTRIBUTES.includes(attr) ||
      opr.Toolkit.SUPPORTED_EVENTS.includes(attr) ||
      ['key', 'class', 'style', 'dataset', 'metadata'].includes(attr);

  const Utils = {
    combineReducers,
    createCommandsDispatcher,
    addDataPrefix,
    lowerDash,
    getAttributeName,
    getEventName,
    createUUID,
    isSupportedAttribute,
  };

  loader.define('core/utils', Utils);
}

{
  const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

  class Toolkit {

    constructor() {
      this.plugins = new Map();
      this.settings = null;
      this.readyPromise = new Promise(resolve => {
        this.init = resolve;
      });
    }

    async ready() {
      await this.readyPromise;
    }

    configure(options) {
      const settings = {};
      settings.plugins = options.plugins || [];
      settings.level =
          LOG_LEVELS.includes(options.level) ? options.level : 'info';
      settings.debug = options.debug || false;
      settings.preload = options.preload || false;
      settings.bundles = options.bundles || [];
      settings.bundleRootPath = options.bundleRootPath || '';
      Object.freeze(settings);
      this.settings = settings;
      this.init();
    }

    isDebug() {
      return Boolean(this.settings) && this.settings.debug;
    }

    assert(condition, ...messages) {
      if (this.isDebug()) {
        console.assert(condition, ...messages);
        if (!condition) {
          throw new Error();
        }
      }
    }

    warn(...messages) {
      console.warn(...messages);
    }

    getBundleName(root) {
      if (typeof root === 'symbol') {
        root = String(this.symbol).slice(7, -1);
      }
      for (const bundle of this.settings.bundles) {
        if (bundle.root === root) {
          return bundle.name;
        }
      }
      return null;
    }

    async preload(symbol) {
      if (this.settings.debug) {
        if (this.settings.preload) {
          await loader.foreload(symbol);
        }
      } else {
        const bundle = this.getBundleName(symbol);
        if (bundle) {
          await loader.require(`${this.settings.bundleRootPath}/${bundle}`);
        }
      }
    }

    async getRootClass(component, props) {
      const type = typeof component;
      switch (type) {
        case 'string':
        case 'symbol':
          await this.preload(component);
          const module = loader.get(component);
          this.assert(
              module.prototype instanceof opr.Toolkit.Root,
              'Module has to be an instance of opr.Toolkit.Root');
          return module;
        case 'function':
          if (component.prototype instanceof opr.Toolkit.Root) {
            return component;
          }
          return class RootClass extends opr.Toolkit.Root {
            render() {
              return component(props);
            }
          };
        default:
          throw new Error(`Invalid component type: ${type}`);
      }
    }

    // TODO: is this needed at all?
    renderStatic(templateProvider, container, props = {}) {
      const parent = new opr.Toolkit.Root();
      parent.renderer =
          new opr.Toolkit.Renderer(container, this.settings, parent);
      const template = templateProvider(props);
      if (template) {
        const element = this.VirtualDOM.createFromTemplate(template);
        this.Patch.addElement(element, parent).apply();
      }
      return props => {
        const template = templateProvider(props);
        let element;
        if (template) {
          element = this.VirtualDOM.createFromTemplate(template);
        }
        const patches = this.Diff.calculate(parent.child, element, parent);
        for (const patch of patches) {
          patch.apply();
        }
      };
    }

    async render(component, container, props = {}) {

      await this.ready();

      const RootClass = await this.getRootClass(component, props);

      const root = new RootClass(props);

      let destroy;
      const init = async container => {
        root.renderer =
            new opr.Toolkit.Renderer(container, this.settings, root);
        destroy = () => {
          this.Lifecycle.onComponentDestroyed(root);
          this.Lifecycle.onComponentDetached(root);
        };
        const initialState =
            await root.getInitialState.call(root.sandbox, props);
        root.commands.init(initialState);
      };

      if (RootClass.elementName) {
        RootClass.register();
        const customElement = document.createElement(RootClass.elementName);
        customElement.props = {
          onLoad: container => init(container),
          onUnload: () => destroy(),
          styles: RootClass.styles,
        };
        container.appendChild(customElement);
      } else {
        const observer = new MutationObserver(mutations => {
          const isContainerRemoved = mutations.find(
              mutation => [...mutation.removedNodes].find(
                  node => node === container));
          if (isContainerRemoved) {
            destroy();
          }
        });
        if (container.parentElement) {
          observer.observe(container.parentElement, {
            childList: true,
          });
        }
        await init(container);
      }

      return root;
    }
  }

  loader.define('core/toolkit', Toolkit);
}

{
  const Toolkit = loader.get('core/toolkit');

  const consts = loader.get('core/consts');
  const nodes = loader.get('core/nodes');

  Object.assign(Toolkit.prototype, consts, nodes, {
    Diff: loader.get('core/diff'),
    Document: loader.get('core/document'),
    Lifecycle: loader.get('core/lifecycle'),
    Patch: loader.get('core/patch'),
    Reconciler: loader.get('core/reconciler'),
    Renderer: loader.get('core/renderer'),
    Sandbox: loader.get('core/sandbox'),
    Service: loader.get('core/service'),
    Template: loader.get('core/template'),
    VirtualDOM: loader.get('core/virtual-dom'),
    utils: loader.get('core/utils'),
  });

  window.opr = window.opr || {};
  window.opr.Toolkit = new Toolkit();
}
