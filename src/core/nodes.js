
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
  /*
   * An abstract parent node.
   */
  class VirtualNode {

    constructor(description, parentNode = null) {
      this.description = description;
      this.key = description.key;
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
      if (this.isRoot()) {
        return this;
      }
      if (this.parentNode) {
        return this.parentNode.rootNode;
      }
      throw new Error('Inconsistent virtual DOM tree detected!');
    }

    get sourceNode() {
      return this.parentNode ? this.parentNode.sourceNode : this;
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

    isText() {
      return this instanceof Text;
    }

    isCompatible(node) {
      return node && this.nodeType === node.nodeType && this.key === node.key;
    }
  }

  /*
   * Node representing Component in the virtual DOM tree.
   * Components
   */
  class Component extends VirtualNode {

    static get NodeType() {
      return 'component';
    }

    static get displayName() {
      return this.name;
    }

    constructor(description, parentNode, attachDOM = true) {
      super(description, parentNode);
      this.sandbox = opr.Toolkit.Sandbox.create(this);
      this.cleanUpTasks = [];
      this.isInitialized = attachDOM;
      if (attachDOM) {
        this.attachDOM();
      }
      // the rendered child node is inserted right after instantiation
      this.child = null;
    }

    /*
     * This is the only method making modifications to the component's child as
     * Component always needs a child node to book it's place in the node tree.
     */
    replaceChild(child, node) {
      opr.Toolkit.assert(
          this.child === child, 'Replaced node is not a child of this node!');
      opr.Toolkit.assert(
          node.parentNode === this,
          'Specified node does not have a valid parent!');
      child.parentNode = null;
      node.parentNode = this;
      child.ref.replaceWith(node.ref);
      this.child = node;
    }

    hasOwnMethod(method) {
      return this.constructor.prototype.hasOwnProperty(method);
    }

    connectTo(service, listeners) {
      opr.Toolkit.assert(
          typeof service.connect === 'function',
          'Services have to define the connect() method');
      const disconnect = service.connect(listeners);
      opr.Toolkit.assert(
          typeof disconnect === 'function',
          'The result of the connect() method has to be a disconnect() method');
      disconnect.service = service;
      this.cleanUpTasks.push(disconnect);
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
      if (this.child.isComment()) {
        return this.child;
      }
      return this.child.placeholder || null;
    }

    render() {
      return undefined;
    }

    get commands() {
      return this.rootNode.commands;
    }

    destroy() {
      for (const cleanUpTask of this.cleanUpTasks) {
        cleanUpTask();
      }
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
      return this.child.ref;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.constructor === node.constructor;
    }

    attachDOM() {
      if (this.child) {
        this.child.attachDOM();
      }
    }

    detachDOM() {
      if (this.child) {
        this.child.detachDOM();
      }
    }
  }

  const CONTAINER = Symbol('container');
  const CUSTOM_ELEMENT = Symbol('custom-element');
  const COMMANDS = Symbol('commands');

  class Root extends Component {

    static get NodeType() {
      return 'root';
    }

    static get styles() {
      return [];
    }

    constructor(description, originator = null) {
      super(description, /*= parentNode */ null, /*= attachDOM */ false);
      if (originator === null) {
        throw new Error('No originator specified for rendered root component!');
      }
      this.originator = originator;
      this.plugins = this.createPlugins();
      this.subroots = new Set();
      this.state = opr.Toolkit.Reducers.create(this);
      this.reducer = opr.Toolkit.utils.combineReducers(...this.getReducers());
      this.dispatch = command => {
        const prevState = this.state.current;
        const nextState = this.reducer(prevState, command);
        opr.Toolkit.Renderer.update(this, prevState, nextState, command);
      };
      this.commands = this.createCommandsDispatcher();
      this.ready = new Promise(resolve => {
        this.markAsReady = resolve;
      });
      this.child = opr.Toolkit.VirtualDOM.createFromDescription(
          new opr.Toolkit.Description.CommentDescription(
              this.constructor.displayName));
      this.attachDOM();
    }

    normalize(props) {
      return opr.Toolkit.Template.normalizeComponentProps(
          props, this.constructor);
    }

    /*
     * Triggers the initial rendering of the component in given container.
     */
    async init(container) {
      this.container = container;
      await this.plugins.installAll();
      this.originator.track(this);

      const state = await this.getInitialState.call(
          this.sandbox, this.description.props || {});
      if (state.constructor !== Object) {
        throw new Error('Initial state must be a plain object!');
      }

      this.commands.init(this.normalize(state));
      if (this.pendingDescription) {
        const description = this.pendingDescription;
        delete this.pendingDescription;
        setTimeout(() => this.update(description));
      }
      this.isInitialized = true;
      this.markAsReady();
    }

    /*
     * The default implementation delegating the calculation of initial state
     * to the state manager.
     */
    async getInitialState(props) {
      return this.state.getInitialState(props);
    }

    /*
     * Triggers the component update.
     */
    update(description) {
      if (!this.isInitialized) {
        this.pendingDescription = description;
        return;
      }
      const state = this.getUpdatedState(
          description.props || {}, this.description.props || {});
      if (state.constructor !== Object) {
        throw new Error('Updated state must be a plain object!');
      }
      this.commands.setState(this.normalize(state));
    }

    /*
     * The default implementation delegating the calculation of updated state
     * to the state manager.
     */
    getUpdatedState(props, state) {
      return this.state.getUpdatedState(props, state);
    }

    set commands(commands) {
      this[COMMANDS] = commands;
    }

    get commands() {
      return this[COMMANDS];
    }

    track(root) {
      this.subroots.add(root);
    }

    stopTracking(root) {
      this.subroots.delete(root);
    }

    get tracked() {
      const tracked = [];
      for (const root of this.subroots) {
        tracked.push(root, ...root.tracked);
      }
      return tracked;
    }

    createCommandsDispatcher() {
      const dispatcher = {};
      for (const key of Object.keys(this.reducer.commands)) {
        dispatcher[key] = (...args) => {
          if (this.reducer) {
            const command = this.reducer.commands[key](...args);
            this.dispatch(command);
          }
        };
      }
      return dispatcher;
    }

    createPlugins(toolkit) {
      const plugins = new opr.Toolkit.Plugins(this);
      for (const plugin of this.originator.plugins) {
        plugins.register(plugin);
      }
      return plugins;
    }

    addPluginsAPI(element) {
      const {
        Plugin,
      } = opr.Toolkit.Plugins;
      element.install = (plugin, cascade = true) => {
        const installTo = root => {
          if (plugin instanceof Plugin) {
            root.plugins.use(plugin);
          } else {
            root.plugins.install(plugin);
          }
          if (cascade) {
            for (const subroot of root.subroots) {
              installTo(subroot);
            }
          }
        };
        installTo(this);
      };
      element.uninstall = (plugin, cascade = true) => {
        const name = typeof plugin === 'string' ? plugin : plugin.name;
        const uninstallFrom = root => {
          root.plugins.uninstall(name);
          if (cascade) {
            for (const subroot of root.subroots) {
              uninstallFrom(subroot);
            }
          }
        };
        uninstallFrom(this);
      };
    }

    async mount(container) {
      if (this.constructor.elementName) {
        // triggers this.init() from element's connected callback
        container.appendChild(this.ref);
      } else {
        await this.init(container);
      }
    }

    attachDOM() {
      if (this.constructor.elementName) {
        this.ref = this.createCustomElement();
      } else {
        super.attachDOM();
      }
    }

    createCustomElement(toolkit) {
      const defineCustomElementClass = RootClass => {
        let ElementClass = customElements.get(RootClass.elementName);
        if (!ElementClass) {
          ElementClass = class RootElement extends ComponentElement {};
          customElements.define(RootClass.elementName, ElementClass);
          RootClass.prototype.elementClass = ElementClass;
        }
        return ElementClass;
      };
      const ElementClass = defineCustomElementClass(this.constructor);
      const customElement = new ElementClass(this, this.toolkit);
      this.addPluginsAPI(customElement);
      return customElement;
    }

    getStylesheets() {
      const stylesheets = [];
      const stylesheetProviders =
          [...this.plugins].filter(plugin => plugin.isStylesheetProvider());
      for (const plugin of stylesheetProviders) {
        if (typeof plugin.getStylesheets !== 'function') {
          throw new Error(
              `Plugin '${
                         plugin.name
                       }' must provide the getStylesheets() method!`);
        }
        stylesheets.push(...plugin.getStylesheets());
      }
      if (Array.isArray(this.constructor.styles)) {
        stylesheets.push(...this.constructor.styles);
      }
      return stylesheets;
    }

    get ref() {
      return this[CUSTOM_ELEMENT] || super.ref;
    }

    set ref(ref) {
      this[CUSTOM_ELEMENT] = ref;
    }

    set container(container) {
      this[CONTAINER] = container;
    }

    get container() {
      return this[CONTAINER];
    }

    get toolkit() {
      return this.originator.toolkit || this.originator;
    }

    getReducers() {
      return [];
    }

    destroy() {
      super.destroy();
      this.originator.stopTracking(this);
      this.state.destroy();
      this.state = null;
      this.plugins.destroy();
      this.plugins = null;
      this.reducer = null;
      this.dispatch = null;
      this.originator = null;
    }

    get nodeType() {
      return Root.NodeType;
    }
  }

  const cssImports = paths =>
      paths.map(loader.path).map(path => `@import url(${path});`).join('\n');

  class ComponentElement extends HTMLElement {

    constructor(root) {

      super();
      this.$root = root;

      const shadow = this.attachShadow({
        mode: 'open',
      });
      const slot = document.createElement('slot');

      const stylesheets = root.getStylesheets();

      if (stylesheets && stylesheets.length) {

        const style = document.createElement('style');
        style.textContent = cssImports(stylesheets);

        style.onload = () => root.init(slot);
        style.onerror = () => {
          throw new Error(
              `Error loading stylesheets: ${stylesheets.join(', ')}`);
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

    connectedCallback() {
      clearTimeout(this.pendingDestruction);
    }

    disconnectedCallback() {
      this.pendingDestruction = setTimeout(() => this.destroy(), 50);
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
      super(description, parentNode);
      if (description.children) {
        this.children = description.children.map(
            childDescription => opr.Toolkit.VirtualDOM.createFromDescription(
                childDescription, this));
      }
      this.attachDOM();
    }

    insertChild(child, index) {
      if (!this.children) {
        this.children = [];
      }
      if (index === undefined) {
        index = this.children.length;
      }
      const nextChild = this.children[index];
      this.children.splice(index, 0, child);
      this.ref.insertBefore(child.ref, nextChild && nextChild.ref || null);
      child.parentNode = this;
    }

    replaceChild(child, node) {
      const index = this.children.indexOf(child);
      opr.Toolkit.assert(
          index >= 0, 'Specified node is not a child of this element!');
      this.children.splice(index, 1, node);
      child.parentNode = null;
      node.parentNode = this;
      child.ref.replaceWith(node.ref);
    }

    moveChild(child, from, to) {
      opr.Toolkit.assert(
          this.children[from] === child,
          'Specified node is not a child of this element!');
      this.children.splice(from, 1);
      this.children.splice(to, 0, child);
      this.ref.removeChild(child.ref);
      this.ref.insertBefore(child.ref, this.ref.children[to]);
    }


    removeChild(child) {
      const index = this.children.indexOf(child);
      opr.Toolkit.assert(
          index >= 0, 'Specified node is not a child of this element!');
      this.children.splice(index, 1);
      child.parentNode = null;
      if (!this.children.length) {
        delete this.children;
      }
      this.ref.removeChild(child.ref);
    }

    get nodeType() {
      return VirtualElement.NodeType;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.name === node.name;
    }

    attachDOM() {
      this.ref = opr.Toolkit.Renderer.createElement(this.description);
      if (this.children) {
        for (const child of this.children) {
          this.ref.appendChild(child.ref);
        }
      }
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

    constructor(description, parentNode) {
      super(description, parentNode);
      this.attachDOM();
    }

    get nodeType() {
      return Comment.NodeType;
    }

    attachDOM() {
      this.ref = document.createComment(` ${this.description.text} `);
    }

    detachDOM() {
      this.ref = null;
    }
  }

  class Text extends VirtualNode {

    static get NodeType() {
      return 'text';
    }

    constructor(description, parentNode) {
      super(description, parentNode);
      this.attachDOM();
    }

    get nodeType() {
      return Text.NodeType;
    }

    attachDOM() {
      this.ref = document.createTextNode(this.description.text);
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
    Text,
  };

  module.exports = CoreTypes;
}
