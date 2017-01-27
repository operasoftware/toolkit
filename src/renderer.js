
class Renderer {

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
    } else if (children) {
      children.forEach(child => {
        const childElement = this.createElement(child);
        child.element = childElement;
        element.appendChild(childElement);
      });
    }
    if (listeners) {
      Object.keys(listeners).forEach(key => {
        element.addEventListener(key, listeners[key]);
      });
    }
    if (attrs) {
      Object.keys(attrs).forEach(key => {
        element.setAttribute(key, attrs[key]);
      });
    }
    return element;
  };

  static renderInElement(rootElement, node) {

    const element = this.createElement(node);
    node.element = element;
    
    rootElement.innerHTML = '';
    rootElement.appendChild(element);
  }

};