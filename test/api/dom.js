{

  // TODO: use a subclass of an Array
  Array.prototype.add = Array.prototype.push;
  Array.prototype.remove = function(element) {
    const index = this.indexOf(element);
    if (index >= 0) {
      this.splice(index, 1);
    }
  };

  const Node = class {

    constructor() {
      this.parentNode = null;
      this.childNodes = [];
    }

    remove() {
      if (this.parentNode) {
        this.parentNode.childNodes = this.parentNode.childNodes
          .filter(node => node !== this);
      }
      this.parentNode = null;
    }
  }

  const Attributes = class {

    get length() {
      return Object.keys(this).length;
    }
  };

  const DOMTokenList = class {

    constructor() {
      this.array = [];
      this[Symbol.iterator] = function* () {
        for (const item of this.array) {
          yield item;
        }
      };
    }

    add(item) {
      this.array.push(item);
    }

    remove(item) {
      const index = this.array.indexOf(item);
      if (index >= 0) {
        this.array.splice(index, 1);
      }
    }
  };

  global.Element = class extends Node {

    constructor(name) {
      super();
      // TODO: move to utils
      const dataAttr = attr => {
        return ('data' + attr[0].toUpperCase() + attr.slice(1))
          .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      };
      this.tagName = name.toUpperCase();
      this.attributes = new Attributes();
      this.dataset = new Proxy({}, {
        set: (target, attr, value) => {
          target[attr] = String(value);
          this.setAttribute(dataAttr(attr), value);
          return true;
        },
        deleteProperty: (target, attr) => {
          delete target[attr];
          this.removeAttribute(dataAttr(attr));
          return true;
        }
      });
      this.style = {};
      this.classList = new DOMTokenList();
      this.eventListeners = {};
    }

    setAttribute(name, value) {
      this.attributes[name] = String(value);
    }

    getAttribute(name) {
      return this.attributes[name];
    }

    removeAttribute(name) {
      delete this.attributes[name];
    }

    appendChild(child) {
      this.childNodes.push(child);
      child.parentNode = this;
    }

    insertBefore(child, target) {
      const index = this.childNodes.indexOf(target);
      if (index >= 0) {
        this.childNodes.splice(index, 0, child);
        child.parentNode = this;
      } else {
        this.appendChild(child);
      }
    }

    addEventListener(name, listener) {
      this.eventListeners[name] = this.eventListeners[name] || [];
      this.eventListeners[name].push(listener);
    }

    removeEventListener(name, listener) {
      const listeners = this.eventListeners[name];
      if (listeners) {
        this.eventListeners[name] = listeners.filter(item => item !== listener);
      }
    }
  };

  global.Comment = class extends Node {

    constructor(text) {
      super();
      this.textContent = text;
    }
  };

  global.document = {
    createElement: name => new Element(name),
    createComment: text => new Comment(text),
  };
}