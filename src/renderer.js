
class Renderer {

  static createElement(node) {
    const {
      name,
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
    if (node.listeners) {
      Object.keys(node.listeners).forEach(key => {
        element.addEventListener(key, node.listeners[key]);
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