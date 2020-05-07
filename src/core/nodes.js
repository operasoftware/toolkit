
/*
Copyright 2017-2020 Opera Software AS

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

    constructor(description, parentNode = null, context = null) {
      this.description = description;
      this.key = description.key;
      this.parentNode = parentNode;
      this.context = context;
    }

    createChildren() {
      this.children = this.description.children.map(
          childDescription => this.createChild(childDescription));
    }

    createChild(description) {
      return opr.Toolkit.VirtualDOM.createFromDescription(
          description, this, this.context);
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

    attachChildren() {
      if (this.children) {
        for (const child of this.children) {
          this.ref.appendChild(child.ref);
        }
      }
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
      if (!this.children.length) {
        delete this.children;
      }
      this.ref.removeChild(child.ref);
    }

    isRoot() {
      return this instanceof WebComponent;
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
   * Node representing experimental Component in the virtual DOM tree.
   */
  class XPComponent extends VirtualNode {

    static get NodeType() {
      return 'component';
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.constructor === node.constructor;
    }

    constructor(description, attachDOM = true) {
      super(description, null, null);
      this.sandbox = opr.Toolkit.Sandbox.create(this);
      this.cleanUpTasks = [];
    }

    mount(container) {
      const content = opr.Toolkit.Renderer.render(this, this.description.props);
      const node = opr.Toolkit.VirtualDOM.createFromDescription(content);
      this.ref = node.ref;
      container.appendChild(node.ref);
    }

    render() {
      return undefined;
    }
  }

  /*
   * Node representing Component in the virtual DOM tree.
   */
  class Component extends VirtualNode {

    static get NodeType() {
      return 'component';
    }

    static get displayName() {
      return this.name;
    }

    constructor(description, parent, context, attachDOM = true) {
      super(description, parent, context);
      this.sandbox = opr.Toolkit.Sandbox.create(this);
      this.cleanUpTasks = [];
      this.isInitialized = attachDOM;
      if (attachDOM) {
        this.attachDOM();
      }
      // the rendered content is inserted right after instantiation
      this.content = null;
    }

    /*
     * Sets the component content.
     */
    setContent(node) {
      opr.Toolkit.assert(
          node.parentNode === this,
          'Specified node does not have a valid parent!');
      this.content.parentNode = null;
      node.parentNode = this;
      this.content.ref.replaceWith(node.ref);
      this.content = node;
    }

    hasOwnMethod(method) {
      // eslint-disable-next-line no-prototype-builtins
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
      if (this.content) {
        if (this.content.isElement() || this.content.isRoot()) {
          return this.content;
        }
        if (this.content.isComponent()) {
          return this.content.childElement;
        }
      }
      return null;
    }

    get placeholder() {
      if (this.content.isComment()) {
        return this.content;
      }
      return this.content.placeholder || null;
    }

    render() {
      return undefined;
    }

    get commands() {
      return this.context ? this.context.commands : this.rootNode.commands;
    }

    get dispatcher() {
      return this.context ? this.context.dispatcher : this.rootNode.dispatcher;
    }

    destroy() {
      for (const cleanUpTask of this.cleanUpTasks) {
        cleanUpTask();
      }
    }

    get nodeType() {
      return Component.NodeType;
    }

    get ref() {
      return this.content.ref;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.constructor === node.constructor;
    }

    attachDOM() {
      if (this.content) {
        this.content.attachDOM();
      }
    }

    detachDOM() {
      if (this.content) {
        this.content.detachDOM();
      }
    }
  }

  const CONTAINER = Symbol('container');
  const CUSTOM_ELEMENT = Symbol('custom-element');
  const DISPATCHER = Symbol('dispatcher');

  class WebComponent extends Component {

    static get NodeType() {
      return 'root';
    }

    static get styles() {
      return [];
    }

    constructor(description, parent = null, context = null) {
      super(description, parent, context, /*= attachDOM */ false);
      this.subroots = new Set();
      this.dispatcher = new opr.Toolkit.Dispatcher(this);
      this.ready = new Promise(resolve => {
        this.markAsReady = resolve;
      });
      this.plugins = this.createPlugins();
      this.content = this.createPlaceholder();
      this.shadow = null;
      this.attachDOM();
    }

    attachDOM() {
      if (this.constructor.elementName) {
        this.ref = opr.Toolkit.Renderer.createCustomElement(this);
        this.plugins.installAll();
        if (this.description.children) {
          this.createChildren();
          this.attachChildren();
        }
      } else {
        this.plugins.installAll();
        super.attachDOM();
      }
    }

    createPlaceholder() {
      return opr.Toolkit.VirtualDOM.createFromDescription(
          new opr.Toolkit.Description.CommentDescription(
              this.constructor.displayName));
    }

    /*
     * Triggers the initial rendering of the component in given container.
     */
    async init() {
      opr.Toolkit.track(this);

      const state = await this.getInitialState.call(
          this.sandbox, this.description.props || {});
      this.setState(state);

      if (this.pendingDescription) {
        const description = this.pendingDescription;
        delete this.pendingDescription;
        setTimeout(() => this.update(description));
      }
      this.isInitialized = true;
      this.markAsReady();
    }

    setState(state) {
      if (state.constructor !== Object) {
        throw new Error('Web Component state must be a plain object!');
      }
      this.commands.setState(opr.Toolkit.Template.normalizeComponentProps(
          state, this.constructor));
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
          description.props || {}, this.state || {});
      this.setState(state);
    }

    /*
     * The default implementation delegating the calculation of initial state
     * to the state manager.
     */
    async getInitialState(props) {
      return {
        ...props,
      };
    }

    /*
     * The default implementation delegating the calculation of updated state
     * to the state manager.
     */
    getUpdatedState(props, state) {
      return {
        ...state,
        ...props,
      };
    }

    get dispatcher() {
      return this[DISPATCHER];
    }

    set dispatcher(dispatcher) {
      this[DISPATCHER] = dispatcher;
    }

    get commands() {
      return this.dispatcher.commands;
    }

    createPlugins() {
      const plugins = new opr.Toolkit.Plugins(this);
      const inherited =
          this.parentNode ? this.parentNode.plugins : opr.Toolkit.plugins;
      for (const plugin of inherited) {
        plugins.register(plugin);
      }
      return plugins;
    }

    async mount(container) {
      if (this.constructor.elementName) {
        // triggers this.init() from element's connected callback
        container.appendChild(this.ref);
        await this.ready;
      } else {
        this.container = container;
        await this.init();
      }
      return this;
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

    get tracked() {
      const tracked = [];
      for (const root of this.subroots) {
        tracked.push(root, ...root.tracked);
      }
      return tracked;
    }

    destroy() {
      super.destroy();
      try {
        this.stopTracking();
      } catch (e) {
        return;
      }
      this.dispatcher.ignoreIncoming();
      this.plugins.destroy();
      this.plugins = null;
      this.parentNode = null;
    }

    get nodeType() {
      return WebComponent.NodeType;
    }
  }

  class VirtualElement extends VirtualNode {

    static get NodeType() {
      return 'element';
    }

    constructor(description, parent, context) {
      super(description, parent, context);
      if (description.children) {
        this.createChildren();
      }
      this.attachDOM();
    }

    get nodeType() {
      return VirtualElement.NodeType;
    }

    isCompatible(node) {
      return super.isCompatible(node) && this.name === node.name;
    }

    attachDOM() {
      this.ref = opr.Toolkit.Renderer.createElement(this.description);
      this.attachChildren();
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
    XPComponent,
    Component,
    WebComponent,
    Root: WebComponent,
    VirtualElement,
    Comment,
    Text,
  };

  module.exports = CoreTypes;
}
