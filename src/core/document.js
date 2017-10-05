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
    };

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

  module.exports = Document;
}
