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
  class VirtualNode {

    constructor(key, parentNode) {
      this.key = key;
      this.parentNode = parentNode;
    }

    get parentElement() {
      if (this.parentNode) {
        return this.parentNode.isElement() ? this.parentNode :
                                             this.parentNode.parentElement;
      }
      return null;
    }

    get container() {
      if (this.parentNode) {
        return this.parentNode.container;
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

    static get NodeType() {
      return 'component';
    }

    constructor(id, props = {}, children = [], parentNode) {
      super(props.key, parentNode);
      this.id = id;
      this.props = props;
      this.children = children;
      this.sandbox = opr.Toolkit.Sandbox.create(this);
      if (this.key === undefined && this.getKey) {
        this.key = this.getKey.call(this.sandbox);
      }
      this.child = null;
      this.comment = this.createComment();
      this.cleanUpTasks = [];
      this.attachDOM();
    }

    createComment() {
      return new Comment(` ${this.constructor.name} `, this);
    }

    hasOwnMethod(method) {
      return this.constructor.prototype.hasOwnProperty(method);
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
      this.comment.parentNode = null;
      this.comment = null;
    }

    removeChild(child) {
      console.assert(this.child === child);
      this.child.parentNode = null;
      this.child = null;
      this.comment = this.createComment();
    }

    replaceChild(child, node) {
      console.assert(this.child === child);
      this.child.parentNode = null;
      this.child = node;
      this.child.parentNode = this;
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
      this.container.dispatchEvent(new CustomEvent(name, {
        detail: data,
        bubbles: true,
        composed: true,
      }))
    }

    preventDefault(event) {
      event.preventDefault();
    }

    stopEvent(event) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    get nodeType() {
      return Component.NodeType;
    }

    get ref() {
      return this.childElement ? this.childElement.ref : this.placeholder.ref;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.constructor === node.constructor;
    }

    attachDOM() {
      if (this.child) {
        this.child.attachDOM();
      } else {
        this.comment.attachDOM();
      }
    }

    detachDOM() {
      if (this.child) {
        this.child.detachDOM();
      } else {
        this.comment.detachDOM();
      }
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

  const CONTAINER = Symbol('container');

  class Root extends Component {

    static get NodeType() {
      return 'root';
    }

    constructor(id, props, container, settings) {
      super(id, props, /*= children */ null, /*= parentNode */ null);
      const {utils, Renderer} = opr.Toolkit;
      this.state = null;
      this.reducer = utils.combineReducers(...this.getReducers());
      this.container = container;
      this.renderer = new Renderer(this, settings);
      this.dispatch = command => {
        const prevState = this.state;
        const nextState = this.reducer(prevState, command);
        this.renderer.updateDOM(command, prevState, nextState);
      };
      this.commands = opr.Toolkit.utils.createCommandsDispatcher(
          this.reducer, this.dispatch);
      this.plugins = new Map();
    }

    set container(container) {
      this[CONTAINER] = container;
    }

    get container() {
      return this[CONTAINER];
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

    get nodeType() {
      return Root.NodeType;
    }
  }

  class VirtualElement extends VirtualNode {

    static get NodeType() {
      return 'element';
    }

    constructor(description, parentNode) {
      super(description.key || null, parentNode);

      const {
        element,
        props = {},
        text = null,
      } = description;
      this.description = description;

      opr.Toolkit.assert(element, 'Element name is mandatory');
      this.name = element;
      const {
        listeners = {},
        attrs = {},
        dataset = {},
        classNames = [],
        style = {},
        metadata = {},
      } = props;
      this.listeners = listeners;
      this.attrs = attrs;
      this.dataset = dataset;
      this.style = style;
      this.classNames = classNames;
      this.metadata = metadata;
      this.text = text;
      this.children = [];
      this.attachDOM();
    }

    setAttribute(name, value) {
      this.attrs[name] = value;
      this.ref.setAttribute(opr.Toolkit.utils.getAttributeName(name), value);
    }

    removeAttribute(name) {
      delete this.attrs[name];
      this.ref.removeAttribute(opr.Toolkit.utils.getAttributeName(name));
    }

    setDataAttribute(name, value) {
      this.dataset[name] = String(value);
      this.ref.dataset[name] = value;
    }

    removeDataAttribute(name) {
      delete this.dataset[name];
      delete this.ref.dataset[name];
    }

    addClassName(className) {
      this.classNames.push(className);
      this.ref.classList.add(className);
    }

    removeClassName(className) {
      this.classNames = this.classNames.filter(item => item !== className);
      this.ref.classList.remove(className);
    }

    setStyleProperty(prop, value) {
      this.style[prop] = String(value);
      this.ref.style[prop] = String(value);
    }

    removeStyleProperty(prop) {
      delete this.style[prop];
      this.ref.style[prop] = null;
    }

    addListener(name, listener) {
      this.listeners[name] = listener;
      const event = opr.Toolkit.utils.getEventName(name);
      this.ref.addEventListener(event, listener);
    }

    removeListener(name, listener) {
      delete this.listeners[name];
      const event = opr.Toolkit.utils.getEventName(name);
      this.ref.removeEventListener(event, listener);
    }

    setMetadata(key, value) {
      this.metadata[key] = value;
      this.ref[key] = value;
    }

    removeMetadata(key, value) {
      delete this.metadata[key];
      delete this.ref[key];
    }

    insertChild(child, index = this.children.length) {
      const nextChild = this.children[index];
      this.children.splice(index, 0, child);
      this.ref.insertBefore(child.ref, nextChild && nextChild.ref);
      child.parentNode = this;
    }

    moveChild(child, from, to) {
      console.assert(this.children[from] === child);
      this.children.splice(from, 1);
      this.children.splice(to, 0, child);
      this.ref.removeChild(child.ref);
      this.ref.insertBefore(child.ref, this.ref.children[to]);
    }

    replaceChild(child, node) {
      const index = this.children.indexOf(child);
      console.assert(index >= 0);
      this.children.splice(index, 1, node);
      child.parentNode = null;
      node.parentNode = this;
      child.ref.replaceWith(node.ref);
    }

    removeChild(child) {
      const index = this.children.indexOf(child);
      opr.Toolkit.assert(
          index >= 0, 'Specified element:', child, 'is not a child of:', this);
      this.children.splice(index, 1);
      child.parentNode = null;
      this.ref.removeChild(child.ref);
    }

    setTextContent(text) {
      this.text = text;
      this.ref.textContent = text;
    }

    removeTextContent() {
      this.text = null;
      this.ref.textContent = '';
    }

    get nodeType() {
      return VirtualElement.NodeType;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.name === node.name;
    }

    attachDOM() {
      const element = document.createElement(this.name);
      if (this.text) {
        element.textContent = this.text;
      }
      Object.entries(this.listeners).forEach(([name, listener]) => {
        const event = opr.Toolkit.utils.getEventName(name);
        element.addEventListener(event, listener);
      });
      Object.entries(this.attrs).forEach(([attr, value]) => {
        const name = opr.Toolkit.utils.getAttributeName(attr);
        element.setAttribute(name, value);
      });
      Object.entries(this.dataset).forEach(([attr, value]) => {
        element.dataset[attr] = value;
      });
      if (this.classNames.length) {
        element.className = this.classNames.join(' ');
      }
      Object.entries(this.style).forEach(([prop, value]) => {
        element.style[prop] = value;
      });
      Object.entries(this.metadata).forEach(([prop, value]) => {
        element[prop] = value;
      });
      this.ref = element;
    }

    detachDOM() {
      for (const child of this.children) {
        child.detachDOM();
      }
      this.ref = null;
    }
  }

  class Comment extends VirtualNode {

    static get NodeType() {
      return 'comment';
    }

    constructor(text, parentNode) {
      super(null, parentNode);
      this.text = text;
      this.attachDOM();
    }

    get nodeType() {
      return Comment.NodeType;
    }

    attachDOM() {
      this.ref = document.createComment(this.text);
    }

    detachDOM() {
      this.ref = null;
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
  class Diff {

    constructor(root) {
      this.root = root;
      this.patches = [];
    }

    addPatch(patch) {
      return this.patches.push(patch);
    }

    updateComponent(component, prevProps, description) {
      if (!Diff.deepEqual(component.description, description) ||
          !Diff.deepEqual(component.props, prevProps)) {
        if ((component.hasOwnMethod('onPropsReceived') ||
             component.hasOwnMethod('onUpdated')) &&
            !Diff.deepEqual(prevProps, component.props)) {
          this.addPatch(
              opr.Toolkit.Patch.updateComponent(component, prevProps));
        }
        this.componentChildPatches(component.child, description, component);
        component.description = description;
      }
    }

    rootPatches(prevState, nextState, initial) {
      const description = opr.Toolkit.Renderer.render(this.root);
      if (initial) {
        this.addPatch(opr.Toolkit.Patch.initRootComponent(this.root));
      }
      this.updateComponent(this.root, prevState, description);
      return this.patches;
    }

    /**
     * Calculates patches for conversion of a component to match the given
     * description.
     */
    componentPatches(component, description) {

      const {
        props = {},
        children = [],
      } = description;

      const ComponentClass =
          opr.Toolkit.VirtualDOM.getComponentClass(description.component);

      opr.Toolkit.assert(
          ComponentClass,
          `Module not found for path: ${String(description.component)}`);
      opr.Toolkit.assert(component.constructor === ComponentClass);

      const prevProps = component.props;

      component.props =
          opr.Toolkit.VirtualDOM.normalizeProps(component.constructor, props);
      component.children = children;

      this.updateComponent(
          component, prevProps, opr.Toolkit.Renderer.render(component));
    }

    /**
     * Calculates patches for conversion of an element to match the given
     * description.
     */
    elementPatches(element, description, parent) {

      const {
        props = {},
        children,
        text,
      } = description;

      const {
        attrs,
        dataset,
        style,
        classNames,
        listeners,
        metadata,
      } = props;

      this.attributePatches(element.attrs, attrs, element);
      this.datasetPatches(element.dataset, dataset, element);
      this.stylePatches(element.style, style, element);
      this.classNamePatches(element.classNames, classNames, element);
      this.listenerPatches(element.listeners, listeners, element);
      this.metadataPatches(element.metadata, metadata, element);
      // TODO: handle text as a child
      if (element.text !== null && text === null) {
        this.addPatch(opr.Toolkit.Patch.removeTextContent(element));
      }
      this.elementChildrenPatches(element.children, children, element);
      if (text !== null && element.text !== text) {
        this.addPatch(opr.Toolkit.Patch.setTextContent(element, text));
      }

      element.description = description;
    }

    listenerPatches(current = {}, next = {}, target = null) {
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
        this.addPatch(Patch.addListener(event, next[event], target));
      }
      for (let event of removed) {
        this.addPatch(Patch.removeListener(event, current[event], target));
      }
      for (let event of changed) {
        this.addPatch(
            Patch.replaceListener(event, current[event], next[event], target));
      }
    }

    metadataPatches(current = {}, next = {}, target = null) {
      const Patch = opr.Toolkit.Patch;

      const keys = Object.keys(current);
      const nextKeys = Object.keys(next);

      const added = nextKeys.filter(key => !keys.includes(key));
      const removed = keys.filter(key => !nextKeys.includes(key));
      const changed = keys.filter(
          key => nextKeys.includes(key) &&
              !Diff.deepEqual(current[key], next[key]));

      for (let key of added) {
        this.addPatch(Patch.addMetadata(key, next[key], target));
      }
      for (let key of removed) {
        this.addPatch(Patch.removeMetadata(key, target));
      }
      for (let key of changed) {
        this.addPatch(Patch.replaceMetadata(key, next[key], target));
      }
    }

    stylePatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const props = Object.keys(current);
      const nextProps = Object.keys(next);

      const added = nextProps.filter(prop => !props.includes(prop));
      const removed = props.filter(prop => !nextProps.includes(prop));
      const changed = props.filter(
          prop => nextProps.includes(prop) && current[prop] !== next[prop]);

      for (let prop of added) {
        this.addPatch(Patch.addStyleProperty(prop, next[prop], target));
      }
      for (let prop of removed) {
        this.addPatch(Patch.removeStyleProperty(prop, target));
      }
      for (let prop of changed) {
        this.addPatch(Patch.replaceStyleProperty(prop, next[prop], target));
      }
    }

    classNamePatches(current = [], next = [], target) {
      const Patch = opr.Toolkit.Patch;

      const added = next.filter(attr => !current.includes(attr));
      const removed = current.filter(attr => !next.includes(attr));

      for (let name of added) {
        this.addPatch(Patch.addClassName(name, target));
      }
      for (let name of removed) {
        this.addPatch(Patch.removeClassName(name, target));
      }
    }

    datasetPatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const attrs = Object.keys(current);
      const nextAttrs = Object.keys(next);

      const added = nextAttrs.filter(attr => !attrs.includes(attr));
      const removed = attrs.filter(attr => !nextAttrs.includes(attr));
      const changed = attrs.filter(
          attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

      for (let attr of added) {
        this.addPatch(Patch.addDataAttribute(attr, next[attr], target));
      }
      for (let attr of removed) {
        this.addPatch(Patch.removeDataAttribute(attr, target));
      }
      for (let attr of changed) {
        this.addPatch(Patch.replaceDataAttribute(attr, next[attr], target));
      }
    }

    attributePatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const attrs = Object.keys(current);
      const nextAttrs = Object.keys(next);

      const added = nextAttrs.filter(attr => !attrs.includes(attr));
      const removed = attrs.filter(attr => !nextAttrs.includes(attr));
      const changed = attrs.filter(
          attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

      for (let attr of added) {
        this.addPatch(Patch.addAttribute(attr, next[attr], target));
      }
      for (let attr of removed) {
        this.addPatch(Patch.removeAttribute(attr, target));
      }
      for (let attr of changed) {
        this.addPatch(Patch.replaceAttribute(attr, next[attr], target));
      }
    }

    elementChildrenPatches(current = [], templates = [], parent) {
      const {Patch, Reconciler, VirtualDOM} = opr.Toolkit;
      const Move = Reconciler.Move;

      const created = [];

      const createNode = template => {
        const node = VirtualDOM.createFromTemplate(template, parent, this.root);
        created.push(node);
        return node;
      };

      const from = current.map((node, index) => node.key || index);
      const to = templates.map(
          (template, index) => template[1] && template[1].key || index);

      const getNode = key => {
        if (from.includes(key)) {
          return current[from.indexOf(key)];
        }
        const index = to.indexOf(key);
        return createNode(templates[index]);
      };

      const moves = Reconciler.calculateMoves(from, to);

      const children = [...current];
      for (const move of moves) {
        const node = getNode(move.item);
        switch (move.name) {
          case Move.Name.INSERT:
            this.addPatch(Patch.insertChildNode(node, move.at, parent));
            Move.insert(node, move.at).make(children);
            continue;
          case Move.Name.MOVE:
            this.addPatch(
                Patch.moveChildNode(node, move.from, move.to, parent));
            Move.move(node, move.from, move.to).make(children);
            continue;
          case Move.Name.REMOVE:
            this.addPatch(Patch.removeChildNode(node, move.at, parent));
            Move.remove(node, move.at).make(children);
            continue;
        }
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!created.includes(child)) {
          const index = from.indexOf(child.key || i);
          let sourceTemplate = null;
          if (index >= 0) {
            sourceTemplate = parent.description.children[index];
          }
          this.elementChildPatches(
              child, sourceTemplate, templates[i], parent, i);
        }
      }
    }

    elementChildPatches(child, sourceTemplate, template, parent, index) {
      const {Patch, VirtualDOM, Template} = opr.Toolkit;

      if (sourceTemplate && sourceTemplate[0] === template[0]) {
        if (opr.Toolkit.Diff.deepEqual(sourceTemplate, template)) {
          return;
        }
        const description = Template.describe(template);
        if (child.isElement()) {
          this.elementPatches(child, description, parent);
        } else {
          this.componentPatches(child, description);
        }
        child.description = description;
      } else {
        const node = VirtualDOM.createFromTemplate(template, parent, this.root);
        this.addPatch(Patch.replaceChildNode(child, node, parent));
      }
    }

    componentChildPatches(child, description, parent) {
      const {Diff, Patch, VirtualDOM} = opr.Toolkit;

      if (!child && !description) {
        return;
      }

      // insert
      if (!child && description) {
        const node =
            VirtualDOM.createFromDescription(description, parent, this.root);
        if (node.isElement()) {
          return this.addPatch(Patch.addElement(node, parent));
        }
        return this.addPatch(Patch.addComponent(node, parent));
      }

      // remove
      if (child && !description) {
        if (child.isElement()) {
          return this.addPatch(Patch.removeElement(child, parent));
        }
        return this.addPatch(Patch.removeComponent(child, parent));
      }

      const areCompatible = (node, description) => {
        if (node.isElement()) {
          return node.name === description.element;
        }
        return node.id === description.component;
      };

      // update
      if (areCompatible(child, description)) {
        if (Diff.deepEqual(child, description)) {
          return;
        }
        if (child.isElement()) {
          return this.elementPatches(child, description, parent);
        }
        return this.componentPatches(child, description);
      }

      // replace
      const node =
          VirtualDOM.createFromDescription(description, parent, this.root);
      this.addPatch(Patch.replaceChild(child, node, parent));
    }

    static getType(item) {
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
    }

    static deepEqual(current, next) {
      if (Object.is(current, next)) {
        return true;
      }
      const type = this.getType(current);
      const nextType = this.getType(next);
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
        if (current.constructor !== next.constructor) {
          return false;
        }
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
  }

  loader.define('core/diff', Diff);
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
      if (component.hasOwnMethod('onCreated')) {
        component.onCreated.call(component.sandbox);
      }
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

    static onRootCreated(root) {
      if (root.hasOwnMethod('onCreated')) {
        root.onCreated.call(root.sandbox);
      }
    }

    static onComponentAttached(component) {
      if (component.child) {
        this.onNodeAttached(component.child);
      }
      if (component.hasOwnMethod('onAttached')) {
        component.onAttached.call(component.sandbox);
      }
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

    static onRootAttached(root) {
      if (root.hasOwnMethod('onAttached')) {
        root.onAttached.call(root.sandbox);
      }
    }

    static onComponentReceivedProps(component, nextProps) {
      if (component.hasOwnMethod('onPropsReceived')) {
        component.onPropsReceived.call(component.sandbox, nextProps);
      }
    }

    static onComponentUpdated(component, prevProps) {
      if (component.hasOwnMethod('onUpdated')) {
        component.onUpdated.call(component.sandbox, prevProps);
      }
    }

    static onComponentDestroyed(component) {
      for (const cleanUpTask of component.cleanUpTasks) {
        cleanUpTask();
      }
      if (component.hasOwnMethod('onDestroyed')) {
        component.onDestroyed.call(component.sandbox);
      }
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
      if (component.hasOwnMethod('onDetached')) {
        component.onDetached.call(component.sandbox);
      }
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
        case Type.ADD_COMPONENT:
          return this.onComponentCreated(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementCreated(patch.element);
        case Type.INIT_ROOT_COMPONENT:
          return this.onRootCreated(patch.root);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeCreated(patch.node);
        case Type.REMOVE_CHILD_NODE:
          return this.onNodeDestroyed(patch.node);
        case Type.REMOVE_COMPONENT:
          return this.onComponentDestroyed(patch.component);
        case Type.REMOVE_ELEMENT:
          return this.onElementDestroyed(patch.element);
        case Type.REPLACE_CHILD:
          this.onNodeDestroyed(patch.child);
          this.onNodeCreated(patch.node);
          return;
        case Type.UPDATE_COMPONENT:
          return this.onComponentReceivedProps(patch.target, patch.props);
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
        case Type.ADD_COMPONENT:
          return this.onComponentAttached(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementAttached(patch.element);
        case Type.INIT_ROOT_COMPONENT:
          return this.onRootAttached(patch.root);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeAttached(patch.node);
        case Type.REMOVE_CHILD_NODE:
          return this.onNodeDetached(patch.node);
        case Type.REMOVE_COMPONENT:
          return this.onComponentDetached(patch.component);
        case Type.REMOVE_ELEMENT:
          return this.onElementDetached(patch.element);
        case Type.REPLACE_CHILD:
          this.onNodeDetached(patch.child);
          this.onNodeAttached(patch.node);
          return;
        case Type.UPDATE_COMPONENT:
          return this.onComponentUpdated(patch.target, patch.prevProps);
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
  const INIT_ROOT_COMPONENT = {
    type: Symbol('init-root-component'),
    apply: function() {
      this.root.container.appendChild(this.root.ref);
    },
  };
  const UPDATE_COMPONENT = {
    type: Symbol('update-component'),
  };

  const ADD_ELEMENT = {
    type: Symbol('add-element'),
    apply: function() {
      const ref = this.parent.ref;
      this.parent.appendChild(this.element);
      ref.replaceWith(this.element.ref);
    },
  };
  const REMOVE_ELEMENT = {
    type: Symbol('remove-element'),
    apply: function() {
      const ref = this.element.ref;
      this.parent.removeChild(this.element);
      ref.replaceWith(this.parent.ref);
    },
  };

  const ADD_COMPONENT = {
    type: Symbol('add-component'),
    apply: function() {
      const ref = this.parent.ref;
      this.parent.appendChild(this.component);
      ref.replaceWith(this.component.ref);
    },
  };
  const REMOVE_COMPONENT = {
    type: Symbol('remove-component'),
    apply: function() {
      const ref = this.component.ref;
      this.parent.removeChild(this.component);
      ref.replaceWith(this.parent.ref);
    },
  };

  const REPLACE_CHILD = {
    type: Symbol('replace-child'),
    apply: function() {
      const ref = this.parent.ref;
      this.parent.replaceChild(this.child, this.node);
      ref.replaceWith(this.node.ref);
    },
  };

  const ADD_ATTRIBUTE = {
    type: Symbol('add-attribute'),
    apply: function() {
      this.target.setAttribute(this.name, this.value);
    },
  };
  const REPLACE_ATTRIBUTE = {
    type: Symbol('replace-attribute'),
    apply: function() {
      this.target.setAttribute(this.name, this.value);
    },
  };
  const REMOVE_ATTRIBUTE = {
    type: Symbol('remove-attribute'),
    apply: function() {
      this.target.removeAttribute(this.name);
    },
  };

  const ADD_DATA_ATTRIBUTE = {
    type: Symbol('add-data-attribute'),
    apply: function() {
      this.target.setDataAttribute(this.name, this.value);
    },
  };
  const REPLACE_DATA_ATTRIBUTE = {
    type: Symbol('replace-data-attribute'),
    apply: function() {
      this.target.setDataAttribute(this.name, this.value);
    },
  };
  const REMOVE_DATA_ATTRIBUTE = {
    type: Symbol('remove-data-attribute'),
    apply: function() {
      this.target.removeDataAttribute(this.name);
    },
  };

  const ADD_STYLE_PROPERTY = {
    type: Symbol('add-style-property'),
    apply: function() {
      this.target.setStyleProperty(this.property, this.value);
    },
  };
  const REPLACE_STYLE_PROPERTY = {
    type: Symbol('replace-style-property'),
    apply: function() {
      this.target.setStyleProperty(this.property, this.value);
    },
  };
  const REMOVE_STYLE_PROPERTY = {
    type: Symbol('remove-style-property'),
    apply: function() {
      this.target.removeStyleProperty(this.property);
    },
  };

  const ADD_CLASS_NAME = {
    type: Symbol('add-class-name'),
    apply: function() {
      this.target.addClassName(this.name);
    },
  };
  const REMOVE_CLASS_NAME = {
    type: Symbol('remove-class-name'),
    apply: function() {
      this.target.removeClassName(this.name);
    },
  };

  const ADD_LISTENER = {
    type: Symbol('add-listener'),
    apply: function() {
      this.target.addListener(this.name, this.listener);
    },
  };
  const REPLACE_LISTENER = {
    type: Symbol('replace-listener'),
    apply: function() {
      this.target.removeListener(this.name, this.removed);
      this.target.addListener(this.name, this.added);
    },
  };
  const REMOVE_LISTENER = {
    type: Symbol('remove-listener'),
    apply: function() {
      this.target.removeListener(this.name, this.listener);
    },
  };

  const ADD_METADATA = {
    type: Symbol('add-metadata'),
    apply: function() {
      this.target.setMetadata(this.key, this.value);
    },
  };
  const REPLACE_METADATA = {
    type: Symbol('replace-metadata'),
    apply: function() {
      this.target.setMetadata(this.key, this.value);
    },
  };
  const REMOVE_METADATA = {
    type: Symbol('remove-metadata'),
    apply: function() {
      this.target.removeMetadata(this.key);
    },
  };

  const INSERT_CHILD_NODE = {
    type: Symbol('insert-child-node'),
    apply: function() {
      this.parent.insertChild(this.node, this.at);
    },
  };
  const MOVE_CHILD_NODE = {
    type: Symbol('move-child-node'),
    apply: function() {
      this.parent.moveChild(this.node, this.from, this.to);
    },
  };
  const REPLACE_CHILD_NODE = {
    type: Symbol('replace-child-node'),
    apply: function() {
      this.parent.replaceChild(this.child, this.node);
    },
  };
  const REMOVE_CHILD_NODE = {
    type: Symbol('remove-child-node'),
    apply: function() {
      this.parent.removeChild(this.node);
    },
  };

  const SET_TEXT_CONTENT = {
    type: Symbol('set-text-content'),
    apply: function() {
      this.element.setTextContent(this.text);
    },
  };
  const REMOVE_TEXT_CONTENT = {
    type: Symbol('remove-text-content'),
    apply: function() {
      this.element.removeTextContent();
    },
  };

  const Types = {
    INIT_ROOT_COMPONENT,
    UPDATE_COMPONENT,
    ADD_ELEMENT,
    REMOVE_ELEMENT,
    ADD_COMPONENT,
    REMOVE_COMPONENT,
    REPLACE_CHILD,
    ADD_ATTRIBUTE,
    REPLACE_ATTRIBUTE,
    REMOVE_ATTRIBUTE,
    ADD_DATA_ATTRIBUTE,
    REPLACE_DATA_ATTRIBUTE,
    REMOVE_DATA_ATTRIBUTE,
    ADD_STYLE_PROPERTY,
    REPLACE_STYLE_PROPERTY,
    REMOVE_STYLE_PROPERTY,
    ADD_CLASS_NAME,
    REMOVE_CLASS_NAME,
    ADD_LISTENER,
    REPLACE_LISTENER,
    REMOVE_LISTENER,
    ADD_METADATA,
    REPLACE_METADATA,
    REMOVE_METADATA,
    INSERT_CHILD_NODE,
    MOVE_CHILD_NODE,
    REPLACE_CHILD_NODE,
    REMOVE_CHILD_NODE,
    SET_TEXT_CONTENT,
    REMOVE_TEXT_CONTENT,
  };
  const PatchTypes = Object.keys(Types).reduce((result, key) => {
    result[key] = Types[key].type;
    return result;
  }, {});

  class Patch {
    constructor(def) {
      this.type = def.type;
      this.apply = def.apply || opr.Toolkit.noop;
    }

    static initRootComponent(root) {
      const patch = new Patch(INIT_ROOT_COMPONENT);
      patch.root = root;
      return patch;
    }

    static updateComponent(target, prevProps) {
      const patch = new Patch(UPDATE_COMPONENT);
      patch.target = target;
      patch.prevProps = prevProps;
      patch.props = target.sandbox.props;
      return patch;
    }

    static addElement(element, parent) {
      const patch = new Patch(ADD_ELEMENT);
      patch.element = element;
      patch.parent = parent;
      return patch;
    }

    static removeElement(element, parent) {
      const patch = new Patch(REMOVE_ELEMENT);
      patch.element = element;
      patch.parent = parent;
      return patch;
    }

    static addComponent(component, parent) {
      const patch = new Patch(ADD_COMPONENT);
      patch.component = component;
      patch.parent = parent;
      return patch;
    }

    static removeComponent(component, parent) {
      const patch = new Patch(REMOVE_COMPONENT);
      patch.component = component;
      patch.parent = parent;
      return patch;
    }

    static replaceChild(child, node, parent) {
      const patch = new Patch(REPLACE_CHILD);
      patch.child = child;
      patch.node = node;
      patch.parent = parent;
      return patch;
    }

    static addAttribute(name, value, target) {
      const patch = new Patch(ADD_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceAttribute(name, value, target) {
      const patch = new Patch(REPLACE_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeAttribute(name, target) {
      const patch = new Patch(REMOVE_ATTRIBUTE);
      patch.name = name;
      patch.target = target;
      return patch;
    }

    static addDataAttribute(name, value, target) {
      const patch = new Patch(ADD_DATA_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceDataAttribute(name, value, target) {
      const patch = new Patch(REPLACE_DATA_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeDataAttribute(name, target) {
      const patch = new Patch(REMOVE_DATA_ATTRIBUTE);
      patch.name = name;
      patch.target = target;
      return patch;
    }

    static addStyleProperty(property, value, target) {
      const patch = new Patch(ADD_STYLE_PROPERTY);
      patch.property = property;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceStyleProperty(property, value, target) {
      const patch = new Patch(REPLACE_STYLE_PROPERTY);
      patch.property = property;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeStyleProperty(property, target) {
      const patch = new Patch(REMOVE_STYLE_PROPERTY);
      patch.property = property;
      patch.target = target;
      return patch;
    }

    static addClassName(name, target) {
      const patch = new Patch(ADD_CLASS_NAME);
      patch.name = name;
      patch.target = target;
      return patch;
    }

    static removeClassName(name, target) {
      const patch = new Patch(REMOVE_CLASS_NAME);
      patch.name = name;
      patch.target = target;
      return patch;
    }

    static addListener(name, listener, target) {
      const patch = new Patch(ADD_LISTENER);
      patch.name = name;
      patch.listener = listener;
      patch.target = target;
      return patch;
    }

    static replaceListener(name, removed, added, target) {
      const patch = new Patch(REPLACE_LISTENER);
      patch.name = name;
      patch.removed = removed;
      patch.added = added;
      patch.target = target;
      return patch;
    }

    static removeListener(name, listener, target) {
      const patch = new Patch(REMOVE_LISTENER);
      patch.name = name;
      patch.listener = listener;
      patch.target = target;
      return patch;
    }

    static addMetadata(key, value, target) {
      const patch = new Patch(ADD_METADATA);
      patch.key = key;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceMetadata(key, value, target) {
      const patch = new Patch(REPLACE_METADATA);
      patch.key = key;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeMetadata(key, target) {
      const patch = new Patch(REMOVE_METADATA);
      patch.key = key;
      patch.target = target;
      return patch;
    }

    static insertChildNode(node, at, parent) {
      const patch = new Patch(INSERT_CHILD_NODE);
      patch.node = node;
      patch.at = at;
      patch.parent = parent;
      return patch;
    }

    static moveChildNode(node, from, to, parent) {
      const patch = new Patch(MOVE_CHILD_NODE);
      patch.node = node;
      patch.from = from;
      patch.to = to;
      patch.parent = parent;
      return patch;
    }

    static replaceChildNode(child, node, parent) {
      const patch = new Patch(REPLACE_CHILD_NODE);
      patch.child = child;
      patch.node = node;
      patch.parent = parent;
      return patch;
    }

    static removeChildNode(node, at, parent) {
      const patch = new Patch(REMOVE_CHILD_NODE);
      patch.node = node;
      patch.at = at;
      patch.parent = parent;
      return patch;
    }

    static setTextContent(element, text) {
      const patch = new Patch(SET_TEXT_CONTENT);
      patch.element = element;
      patch.text = text;
      return patch;
    }

    static removeTextContent(element) {
      const patch = new Patch(REMOVE_TEXT_CONTENT);
      patch.element = element;
      return patch;
    }

    static get Type() {
      return PatchTypes;
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
      this.name = name;
      this.item = item;
      this.at = props.at;
      this.from = props.from;
      this.to = props.to;
      this.make = make;
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

    static comparator(a, b) {
      if (Object.is(a.key, b.key)) {
        return 0;
      }
      return a.key > b.key ? 1 : -1;
    }

    static calculateMoves(source, target) {

      const moves = [];

      const createItem = function(key, index) {
        return ({key, index});
      };

      const before = source.map(createItem).sort(this.comparator);
      const after = target.map(createItem).sort(this.comparator);

      let removed = [];
      let inserted = [];

      while (before.length || after.length) {
        if (!before.length) {
          inserted = inserted.concat(after);
          break;
        }
        if (!after.length) {
          removed = removed.concat(before);
          break;
        }
        const result = this.comparator(after[0], before[0]);
        if (result === 0) {
          before.shift();
          after.shift()
        } else if (result === 1) {
          removed.push(before.shift());
        } else {
          inserted.push(after.shift());
        }
      }

      const sortByIndex = function(foo, bar) {
        return foo.index - bar.index
      };

      removed.sort(sortByIndex).reverse();
      inserted.sort(sortByIndex);

      const result = [...source];

      for (let item of removed) {
        const move = Move.remove(item.key, item.index);
        move.make(result);
        moves.push(move);
      }
      for (let item of inserted) {
        const move = Move.insert(item.key, item.index);
        move.make(result);
        moves.push(move);
      }

      if (opr.Toolkit.Diff.deepEqual(result, target)) {
        moves.result = result;
        return moves;
      }

      const calculateIndexChanges = (source, target, reversed = false) => {

        const moves = [];

        const moveItemIfNeeded = index => {
          const item = target[index];
          if (source[index] !== item) {
            const from = source.indexOf(item);
            const move = Move.move(item, from, index);
            move.make(source);
            moves.push(move);
          }
        };

        if (reversed) {
          for (let i = target.length - 1; i >= 0; i--) {
            moveItemIfNeeded(i);
          }
        } else {
          for (let i = 0; i < target.length; i++) {
            moveItemIfNeeded(i);
          }
        }
        moves.result = source;
        return moves;
      };

      const defaultMoves = calculateIndexChanges([...result], target);
      if (defaultMoves.length > 1) {
        const alternativeMoves =
            calculateIndexChanges([...result], target, /*= reversed*/ true);
        if (alternativeMoves.length < defaultMoves.length) {
          moves.push(...alternativeMoves);
          moves.result = alternativeMoves.result;
        } else {
          moves.push(...defaultMoves);
          moves.result = defaultMoves.result;
        }
        return moves;
      }
      moves.push(...defaultMoves);
      moves.result = defaultMoves.result;
      return moves;
    }
  }

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  loader.define('core/reconciler', Reconciler);
}

{
  class Renderer {

    constructor(root, settings) {
      this.settings = settings;
      this.root = root;
      this.plugins = new Map();
      this.installPlugins();
    }

    static render(component) {

      const template = component.render.call(component.sandbox);

      opr.Toolkit.assert(
          template !== undefined,
          'Invalid undefined template returned when rendering:', component);

      return opr.Toolkit.Template.describe(template);
    }

    updateDOM(command, prevState, nextState) {
      if (this.debug) {
        /* eslint-disable no-console */
        console.time('=> Render time');
        const patches = this.update(prevState, nextState);
        console.log(
            'Command:', command.type,
            `for "${this.root.constructor.displayName}"`);
        if (patches.length) {
          console.log('%cPatches:', 'color: hsl(54, 70%, 45%)', patches);
        } else {
          console.log('%c=> No update', 'color: #07a707');
        }
        console.timeEnd('=> Render time');
        console.log(''.padStart(48, '-'));
        /* eslint-enable no-console */
      } else {
        this.update(prevState, nextState);
      }
    }

    update(prevState, nextState) {

      const {Diff, Lifecycle, VirtualDOM} = opr.Toolkit;

      if (Diff.deepEqual(prevState, nextState)) {
        return [];
      }

      this.root.state =
          VirtualDOM.normalizeProps(this.root.constructor, nextState);

      const diff = new Diff(this.root);
      const initial = this.root.description === undefined;
      const patches = diff.rootPatches(prevState, nextState, initial);

      if (patches.length) {
        Lifecycle.beforeUpdate(patches);
        for (const patch of patches) {
          patch.apply();
        }
        Lifecycle.afterUpdate(patches);
      }

      return patches;
    }

    installPlugins() {
      if (!this.settings || !this.settings.plugins) {
        return;
      }
      for (const plugin of this.settings.plugins) {
        if (this.plugins.get(plugin.id)) {
          console.warn(`Plugin "${id}" is already installed!`);
          return;
        }
        const uninstall = plugin.install({
          container: this.root.container,
        });
        this.plugins.set(plugin.id, {
          ref: plugin,
          uninstall,
        });
      }
    }

    get debug() {
      return this.settings.level === 'debug';
    }
  }

  loader.define('core/renderer', Renderer);
}

{
  const isFunction = (target, property) =>
      typeof target[property] === 'function';

  const delegated = [
    'children',
    'commands',
    'constructor',
    'container',
    'dispatch',
    'elementName',
    'getKey',
    'id',
    'preventDefault',
    'ref',
    'stopEvent',
  ];
  const methods = [
    'broadcast',
    'connectTo',
  ];

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
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (property === '$component') {
            return component;
          }
          if (property === 'props') {
            if (target instanceof opr.Toolkit.Root) {
              return target.state;
            }
            return target.props;
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
        set: (target, property, value) => true,
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
  class Description {

    constructor(type, key, template) {
      this.type = type;
      this.key = key;
      Object.defineProperty(this, 'template', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: template,
      });
    }

    isCompatible(desc) {
      return desc && desc.type === this.type;
    }

    isComponent() {
      return this instanceof ComponentDescription;
    }

    isElement() {
      return this instanceof ElementDescription;
    }
  }

  class ComponentDescription extends Description {

    constructor({component, props, children}, template) {
      super(opr.Toolkit.Component.NodeType, props && props.key, template);
      this.component = component;
      if (props) {
        this.props = props;
      }
      if (children) {
        this.children = children;
      }
    }

    isCompatible(desc) {
      return super.isCompatible(desc) && desc.component === this.component;
    }
  }

  /*
   * Defines a normalized description of an element. Is used to determine the
   * differences between compatible elements (with the same tag name).
   *
   * Enumerable properties:
   * - element (a string representing tag name),
   * - text (a string representing text content),
   * - children (an array of child nodes),
   * - props (an object) defining:
   *    - listeners (an object for event name to listener mapping)
   *    - attrs (an object for normalized attribute name to value mapping)
   *    - dataset (an object representing data attributes)
   *    - classNames (an array of sorted class names)
   *    - style (an object for style property to string value mapping)
   *    - metadata (an object for properties set directly on DOM element)
   *
   * Non-enumerable properties:
   * - template: a reference to the source template.
   */
  class ElementDescription extends Description {

    constructor({element, text = null, children, props}, template) {
      super(opr.Toolkit.VirtualElement.NodeType, props && props.key, template);

      this.element = element;
      this.text = text;

      const {
        SUPPORTED_ATTRIBUTES,
        SUPPORTED_EVENTS,
        SUPPORTED_STYLES,
        Template,
      } = opr.Toolkit;

      if (children && children.length > 0) {
        this.children = children;
      }

      if (props) {

        if (opr.Toolkit.isDebug()) {
          const unknownAttrs = Object.keys(props).filter(
              attr => !opr.Toolkit.utils.isSupportedAttribute(attr));
          for (const unknownAttr of unknownAttrs) {
            const suggestion = SUPPORTED_ATTRIBUTES.find(
                attr => attr.toLowerCase() === unknownAttr.toLowerCase());
            if (suggestion) {
              opr.Toolkit.warn(
                  `Attribute name "${
                                     unknownAttr
                                   }" should be spelled "${suggestion}"`);
            } else {
              opr.Toolkit.warn(`Attribute name "${unknownAttr}" is not valid,`);
            }
          }
        }

        const normalized = {};

        const keys = Object.keys(props);

        // listeners
        const listeners = {};
        const events = keys.filter(key => SUPPORTED_EVENTS.includes(key));
        for (const event of events) {
          const listener = props[event];
          if (typeof listener === 'function') {
            listeners[event] = listener;
          }
        }
        if (Object.keys(listeners).length) {
          normalized.listeners = listeners;
        }

        // attributes
        const attrs = {};
        const attrNames =
            keys.filter(key => SUPPORTED_ATTRIBUTES.includes(key));
        for (const attr of attrNames) {
          const value = Template.getAttributeValue(props[attr]);
          if (value !== null && value !== undefined) {
            attrs[attr] = value;
          }
        }
        if (Object.keys(attrs).length) {
          normalized.attrs = attrs;
        }

        // data attributes
        if (props.dataset) {
          const dataset = {};
          for (const key of Object.keys(props.dataset)) {
            const value = Template.getAttributeValue(props.dataset[key]);
            if (value !== null && value !== undefined) {
              dataset[key] = String(value);
            }
          }
          if (Object.keys(dataset).length) {
            normalized.dataset = dataset;
          }
        }

        // class names
        if (props.class) {
          const classNames = Template.getClassNames(props.class);
          if (classNames.length) {
            normalized.classNames = classNames;
          }
        }

        // style
        if (props.style) {
          const style = {};
          const keys = Object.keys(props.style)
                           .filter(key => SUPPORTED_STYLES.includes(key));
          for (const key of keys) {
            const value = Template.getStyleValue(props.style[key], key);
            if (value !== null && value !== undefined) {
              style[key] = value;
            }
          }
          if (Object.keys(style).length) {
            normalized.style = style;
          }
        }

        // metadata
        if (props.metadata) {
          const metadata = {};
          for (const key of Object.keys(props.metadata)) {
            metadata[key] = props.metadata[key];
          }
          if (Object.keys(metadata).length) {
            normalized.metadata = metadata;
          }
        }

        if (Object.keys(normalized).length) {
          this.props = normalized;
        }
      }
    }

    isCompatible(desc) {
      return super.isCompatible(desc) && desc.element === this.element;
    }
  }

  const getClassNames = value => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.reduce((result, item) => {
        if (!item) {
          return result;
        }
        if (typeof item === 'string') {
          result.push(item);
        }
        result.push(...getClassNames(item, false));
        return result;
      }, []);
    }
    if (typeof value === 'string') {
      if (value.includes(' ')) {
        return value.split(' ');
      }
      return [value];
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return [];
      }
      return Object.keys(value)
          .map(key => value[key] && key)
          .filter(item => item);
    }
    return [];
  };

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
      const classNames = getClassNames(value);
      return [...new Set(classNames.filter(item => item))];
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

      const analyze = template => {

        const {types, error} = this.validate(template);

        if (error) {
          console.error('Invalid template definition:', template);
          throw error;
        }

        if (types === null) {
          return null;
        }

        const Type = Template.ItemType;

        let attr;
        let name

        const type = types[0];
        if (type === Type.COMPONENT) {
          attr = 'component';
          name = String(template[0]).slice(7, -1);
        } else {
          attr = 'element';
          name = template[0];
        }

        const getChildren = nodes => {
          const isValidNode = element => Array.isArray(element);
          const children = nodes.filter(isValidNode);
          switch (type) {
            case Type.COMPONENT:
            case Type.STRING:
              return children;
            default:
              throw new Error(`Unknown type: ${type}`);
          }
        };

        switch (template.length) {
          case 1:
            return {
              [attr]: name,
            };
          case 2:
            if (types[1] === Type.STRING) {
              const text = template[1];
              return {
                [attr]: name,
                text,
              };
            } else if (types[1] === Type.PROPS) {
              return {[attr]: name, props: template[1]};
            } else if (types[1] === Type.ELEMENT) {
              return {
                [attr]: name,
                children: getChildren(template.slice(1)),
              };
            }
          default:
            if (types[1] === Type.PROPS) {
              if (types[2] === Type.STRING) {
                return {
                  [attr]: name,
                  props: template[1],
                  text: template[2],
                };
              }
              return {
                [attr]: name,
                props: template[1],
                children: getChildren(template.slice(2)),
              };
            }
            return {
              [attr]: name,
              children: getChildren(template.slice(1)),
            };
        }
      };

      const details = analyze(template);

      if (details) {
        return this.normalize(details, template);
      }

      return null;
    }

    static normalize(details, template = null) {
      return details.component ? new ComponentDescription(details, template) :
                                 new ElementDescription(details, template);
    }
  }

  Template.Description = Description;

  loader.define('core/template', Template);
}

{
  class VirtualDOM {

    static createFromTemplate(template, parent, root) {
      const description = opr.Toolkit.Template.describe(template);
      return this.createFromDescription(description, parent, root);
    }

    static createFromDescription(description, parent, root) {
      if (!description) {
        return null;
      }
      if (description.element) {
        return this.createElement(description, parent, root);
      }
      const children = description.children || [];
      const component = this.createComponent(
          description.component, description.props, children, parent, root);
      const childDescription = opr.Toolkit.Renderer.render(component);
      component.description = childDescription;
      if (childDescription) {
        component.appendChild(
            this.createFromDescription(childDescription, component, root));
      }
      return component;
    }

    static createElement(description, parent, root) {
      const element = new opr.Toolkit.VirtualElement(description, parent);
      const children = this.createChildren(description.children, element, root);
      if (children) {
        element.children = children;
        for (const child of children) {
          element.ref.appendChild(child.ref);
        }
      }
      return element;
    }

    static createChildren(templates, parent, root) {
      if (!templates) {
        return null;
      }
      return templates.map(
          template => this.createFromTemplate(template, parent, root));
    }

    static createComponent(symbol, props = {}, children = [], parent, root) {
      try {
        const component =
            this.createComponentInstance(symbol, props, children, parent);
        opr.Toolkit.assert(
            !component.isRoot(), 'Invalid root instance passed as a child!')
        console.assert(
            root, 'Root instance not passed for construction of a component ');
        component.commands = root && root.commands || {};
        return component;
      } catch (e) {
        console.error('Error creating Component Tree:', symbol);
        throw e;
      }
    }

    static createComponentInstance(symbol, props, children, parent) {
      const ComponentClass = this.getComponentClass(symbol);
      const normalizedProps = this.normalizeProps(ComponentClass, props);
      return new ComponentClass(symbol, normalizedProps, children, parent);
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

    static getComponentClass(path) {
      const ComponentClass = loader.get(path);
      opr.Toolkit.assert(ComponentClass, `No component found for: ${path}`);
      opr.Toolkit.assert(
          ComponentClass.prototype instanceof opr.Toolkit.Component,
          'Component class', ComponentClass.name,
          'must extend opr.Toolkit.Component');
      return ComponentClass;
    }
  }

  loader.define('core/virtual-dom', VirtualDOM);
}

{
  const INIT = Symbol('init');
  const SET_STATE = Symbol('set-state');
  const UPDATE = Symbol('update');

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
    if (command.type === SET_STATE) {
      return command.state;
    }
    if (command.type === UPDATE) {
      return {
        ...state,
        ...command.state,
      };
    }
    return state;
  };

  coreReducer.commands = {
    init: state => ({
      type: INIT,
      state,
    }),
    setState: state => ({
      type: SET_STATE,
      state,
    }),
    update: state => ({
      type: UPDATE,
      state,
    }),
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
      const defined = Object.keys(commands);
      const incoming = Object.keys(reducer.commands);

      const overriden = incoming.find(key => defined.includes(key));
      if (overriden) {
        console.error(
            'Reducer:', reducer,
            `conflicts an with exiting one with method: "${overriden}"`);
        throw new Error(`The "${overriden}" command is already defined!`)
      }

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

  const throttle = (fn, wait = 200, delayFirstEvent = false) => {

    let lastTimestamp = 0;
    let taskId = null;

    let context;
    let params;

    return function throttled(...args) {
      if (!taskId) {
        const timestamp = Date.now();
        const elapsed = timestamp - lastTimestamp;
        const scheduleTask = delay => {
          taskId = setTimeout(() => {
            taskId = null;
            lastTimestamp = Date.now();
            return fn.call(context, ...params);
          }, delay);
        };
        if (elapsed >= wait) {
          lastTimestamp = timestamp;
          if (!delayFirstEvent) {
            return fn.call(this, ...args);
          }
          scheduleTask(wait);
        } else {
          scheduleTask(wait - elapsed);
        }
      }
      context = this;
      params = args;
    };
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
      case 'encType':
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
    throttle,
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
      }
      if (!condition) {
        throw new Error(messages.join(' '));
      }
    }

    warn(...messages) {
      if (this.isDebug()) {
        console.warn(...messages);
      }
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
          return class Anonymous extends opr.Toolkit.Root {
            render() {
              return component(this.props);
            }
          };
        default:
          throw new Error(`Invalid component type: ${type}`);
      }
    }

    async render(component, container, props = {}) {

      await this.ready();

      const RootClass = await this.getRootClass(component, props);

      const root = new RootClass(null, props, container, this.settings);

      let destroy;
      const init = async container => {
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

    noop() {
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
