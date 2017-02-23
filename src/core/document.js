{
  const Document = class {

    static setAttribute(element, name, value) {
      const key = Reactor.utils.lowerDash(name);
      switch (name) {
        case 'style':
          {
            element.style = '';
            Object.keys(value)
            .map(key => {
              element.style[key] = value[key];
            });
            return;
          }
        case 'class':
          {
            element.setAttribute(key, value);
            return;
          }
        default:
          element.setAttribute(key, value);
      }
    }

    static setDataAttribute(element, name, value) {
      element.dataset[name] = value;
    }

    static removeAttribute(element, name) {
      const key = Reactor.utils.lowerDash(name);
      element.removeAttribute(key);
    }

    static setStyleProperty(element, name, value) {
      element.style[name] = value;
    }

    static addClassName(element, className) {
      element.classList.add(className);
    }

    static createElement(node) {
      const {
        name,
        attrs,
        dataset,
        listeners,
        style,
        classNames,
        text
      } = node;

      const element = document.createElement(name);
      if (text) {
        element.textContent = text;
      }
      Object.keys(listeners).forEach(key => {
        element.addEventListener(key, listeners[key]);
      });
      Object.entries(attrs)
        .forEach(([name, value]) => this.setAttribute(element, name, value));
      Object.entries(dataset)
        .forEach(([name, value]) => this.setDataAttribute(element, name, value));
      Object.entries(style)
        .forEach(([name, value]) => this.setStyleProperty(element, name, value));
      classNames.forEach(className => this.addClassName(element, className));
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