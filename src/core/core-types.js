{
  const ID = Symbol('id');
  const CONTEXT = Symbol('context');

  const VirtualNode = class {

    get id() {
      return this[ID];
    }

    constructor() {
      this[ID] = Reactor.utils.createUUID();
      this.parentNode = null;
    }

    get parentElement() {
      if (this.parentNode) {
        return this.parentNode.isElement() ?
          this.parentNode : this.parentNode.parentElement;
      }
      return null;
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

    findDescendant(nodeId) {
      return null;
    }

    findNode(nodeId) {
      if (this.id === nodeId) {
        return this;
      }
      return this.findDescendant(nodeId);
    }
  };

  const Component = class extends VirtualNode {

    constructor() {
      super();
      this[CONTEXT] = this.createContext();
      this.child = null;
      this.comment = new Comment(this.constructor.name, this);
    }

    createContext() {
      const context = {};
      context.render = this.render.bind(context);
      context.render.bound = true;
      return context;
    }

    get context() {
      return this[CONTEXT];
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

    onCreated() {}

    onAttached() {}

    onPropsReceived(props) {}

    onUpdated() {}

    onDestroyed() {}

    onDetached() {}

    findDescendant(nodeId) {
      return this.child.findNode(nodeId);
    }

    get nodeType() {
      return 'component';
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

    getInitialState() {
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
      this.classNames = [...this.classNames, className];
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

    findDescendant(nodeId) {
      for (const child of this.children) {
        const node = child.findNode(nodeId);
        if (node) {
          return node;
        }
      }
      return null;
    }

    get nodeType() {
      return 'element';
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

  module.exports = CoreTypes;
}