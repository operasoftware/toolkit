{

  const extractElement = component => {
    if (!component.child) {
      return null;
    }
    if (component.child.isElement()) {
      return component.child;
    }
    return extractElement(component.child);
  };

  const Document = class {

    static setAttribute(element, name, value) {
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
            // TODO: ???
            element.setAttribute(name, value);
            return;
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
        text
      } = node;

      const element = document.createElement(name);
      if (text) {
        element.textContent = text;
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

    static createBoundTree(node) {
      if (node && node.isComponent()) {
        node = extractElement(node);
      }
      if (node) {
        const element = this.createElement(node);
        if (node.children) {
          for (let child of node.children) {
            const childElement = this.createBoundTree(child);
            if (childElement) {
              element.appendChild(childElement);
            }
          }
        }
        node.ref = element;
        return element;
      }
      return null;
    }
  };

  module.exports = Document;
}