{
  const Document = class {

    static setTextContent(element, text) {
      element.textContent = text;
    }

    static setAttribute(element, name, value) {
      const attr = Reactor.utils.lowerDash(name);
      element.setAttribute(attr, value);
    }

    static removeAttribute(element, name) {
      const attr = Reactor.utils.lowerDash(name);
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

    static attachElementTree(node) {
      const element = node.isComponent() ? node.childElement : node;
      if (element) {
        const domElement = this.createElement(element);
        if (element.children) {
          for (let child of element.children) {
            const childElement = this.attachElementTree(child);
            if (childElement) {
              domElement.appendChild(childElement);
            }
          }
        }
        element.ref = domElement;
        return domElement;
      }
      const comment = document.createComment(node.placeholder.text);
      node.placeholder.ref = comment;
      return comment;
    }
  };

  module.exports = Document;
}