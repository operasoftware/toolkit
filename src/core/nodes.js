/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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

    get rootNode() {
      if (this.parentNode) {
        return this.parentNode.rootNode;
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
        if (this.child.isElement() || this.child.isRoot()) {
          return this.child;
        }
        if (this.child.isComponent()) {
          return this.child.childElement;
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
      return this.renderedNode;
    }

    get renderedNode() {
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

  const CONTAINER = Symbol('container');
  const CUSTOM_ELEMENT = Symbol('custom-element');

  class Root extends Component {

    static get NodeType() {
      return 'root';
    }

    constructor(id, props, settings, origin = null) {
      super(id, props, /*= children */ null, /*= parentNode */ null);
      const {utils} = opr.Toolkit;
      this.state = null;
      this.reducer = utils.combineReducers(...this.getReducers());
      this.dispatch = command => {
        const prevState = this.state;
        const nextState = this.reducer(prevState, command);
        this.renderer.updateDOM(command, prevState, nextState);
      };
      this.commands =
          utils.createCommandsDispatcher(this.reducer, this.dispatch);
      this.settings = settings;
      this.origin = origin;
      this.plugins = new Map();
      this.ready = new Promise(resolve => {
        this.markAsReady = resolve;
      });
    }

    get ref() {
      return this[CUSTOM_ELEMENT] || super.renderedNode;
    }

    set ref(ref) {
      this[CUSTOM_ELEMENT] = ref;
    }

    attachDOM() {
      const customElementName = this.constructor.elementName;
      if (customElementName) {
        const ElementClass = this.constructor.register();
        this.ref = new ElementClass(this);
      } else {
        super.attachDOM();
      }
    }

    async init(container) {
      this.container = container;
      this.renderer = new opr.Toolkit.Renderer(this, this.settings);
      this.plugins = new opr.Toolkit.Plugins(this);
      await this.plugins.installAll(this.settings.plugins);
      const state = await this.getInitialState.call(this.sandbox, this.props);
      this.commands.init(state);
      this.markAsReady();
    }

    async mount(container) {
      this.attachDOM();
      const elementName = this.constructor.elementName;
      if (elementName) {
        container.appendChild(this.ref);
      } else {
        await this.init(container);
      }
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
      return ElementClass;
    }

    static get styles() {
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

  const cssImports = paths =>
      paths.map(loader.getPath).map(path => `@import url(${path});`).join('\n');

  class ComponentElement extends HTMLElement {

    constructor(root) {
      super();

      this.$root = root;
      this.isBeingMoved_ = false;

      const shadow = this.attachShadow({
        mode: 'open',
      });
      const slot = document.createElement('slot');

      const styles = root.constructor.styles;

      if (styles && styles.length) {

        const style = document.createElement('style');
        style.textContent = cssImports(styles);

        style.onload = () => root.init(slot);
        style.onerror = () => {
          throw new Error(`Error loading styles: ${styles.join(', ')}`);
        };
        shadow.appendChild(style);
        shadow.appendChild(slot);
      } else {
        shadow.appendChild(slot);
        root.init(slot);
      }
    }

    get isComponentElement() {
      return true;
    }

    async connectedCallback() {
      opr.Toolkit.assert(
          this.$root, 'Custom Element is not bound to Root component!');
      if (this.isBeingMoved_) {
        this.isBeingMoved_ = false;
      }
    }

    disconnectedCallback() {
      if (!this.isBeingMoved_) {
        this.destroy();
      }
    }

    destroy() {
      const Lifecycle = opr.Toolkit.Lifecycle;
      const root = this.$root;
      Lifecycle.onComponentDestroyed(root);
      Lifecycle.onComponentDetached(root);
      root.ref = null;
      this.$root = null;
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
        className = '',
        style = {},
        metadata = {},
      } = props;
      this.listeners = listeners;
      this.attrs = attrs;
      this.dataset = dataset;
      this.style = style;
      this.className = className;
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

    setClassName(className = '') {
      this.className = className;
      this.ref.className = className;
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
      if (child.ref.isComponentElement) {
        child.ref.isBeingMoved_ = true;
      }
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
      if (this.className) {
        element.className = this.className;
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

  module.exports = CoreTypes;
}
