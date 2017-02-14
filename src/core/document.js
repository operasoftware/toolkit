{
  const getClassName = value => {

    if (!value) {
      return '';
    }

    if (value.constructor === Object) {
      value = Object.keys(value).map(key => value[key] && key);
    }

    if (value.constructor === Array) {
      const classNames = [];
      for (const item of value) {
        const className = getClassName(item);
        if (className) {
          classNames.push(className);
        }
      }
      value = classNames.join(' ');
    }

    if (value.constructor === String) {
      return value.trim();
    }

    return null;
  };

  const Document = class {

    static setAttribute(element, name, value) {
      switch (name) {
        case 'style': {
          element.style = '';
          Object.keys(value)
            .map(key => {
              element.style[key] = value[key];
            });
          return;
        }
        case 'class': {
          element.setAttribute(name, getClassName(value));
        }
        default:
          element.setAttribute(name, value);
      }
    }

    static createElement(node) {
      const {
        name,
        attrs,
        listeners,
        props,
        children,
        text
      } = node;

      const element = document.createElement(name);
      if (text) {
        element.innerText = text;
      }
      if (listeners) {
        Object.keys(listeners).forEach(key => {
          element.addEventListener(key, listeners[key]);
        });
      }
      if (attrs) {
        Object.entries(attrs)
          .forEach(([name, value]) => this.setAttribute(element, name, value));
      }
      return element;
    };

    static createTree(node) {
      const element = this.createElement(node);
      if (node.children) {
        for (let child of node.children) {
          while (child.isComponent()) {
            child = child.child;
          }
          if (child.isElement()) {
            element.appendChild(this.createTree(child));
            continue;
          }
        }
      }
      node.ref = element;
      return element;
    }
  };

  module.exports = Document;
}
