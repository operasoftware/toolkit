{
  const VirtualNode = class {

    constructor() {
      this.parentNode = null;
    }

    get parentElement() {
      if (this.parentNode) {
        return this.parentNode.isElement() ?
          this.parentNode : this.parentNode.parentElement;
      }
      return null;
    }

    get childElement() {
      return null;
    }

    remove() {
      // TODO: support parent elements!
      this.parentNode.child = null;
      this.parentNode = null;
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
  };

  const Component = class extends VirtualNode {

    constructor() {
      super();
      this.child = null;
      this.comment = new Comment(this.constructor.name);
    }

    appendChild(child) {
      this.child = child;
      this.child.parentNode = this;
      this.comment = null;
    }

    removeChild() {
      this.child.parentNode = null;
      this.child = null;
      this.comment = new Comment(this.constructor.name);
    }

    get childElement() {
      if (this.child) {
        if (this.child.isComponent()) {
          return this.child.childElement;
        } else if (this.child.isElement()) {
          return this.child;
        }
      }
      return null;
    }

    get placeholder() {
      if (this.comment) {
        return this.comment;
      }
      if (this.child.isComponent()) {
        return this.child.placeholder;
      }
      return null;
    }

    render() {
      return undefined;
    }

    onCreated() {

    }

    onAttached() {

    }

    onUpdated() {

    }

    onDetached() {

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
      return {
        ref: this.container
      };
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

    removeDataAttibute(name) {
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
      }
    }

    get nodeType() {
      return 'element';
    }
  };

  const Comment = class extends VirtualNode {

    constructor(text) {
      super();
      this.text = text;
      this.ref = null;
    }

    get nodeType() {
      return 'comment';
    }
  };

  const External = class extends Element {

  };

  module.exports = {
    VirtualNode, Component, Root, VirtualElement, Comment,
  };
}