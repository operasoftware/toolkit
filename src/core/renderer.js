{
  const Renderer = class {

    createElement(node) {
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
        Object.keys(attrs)
          .forEach(name => {
            if (name === 'style') {
              const style = attrs[name];
              Object.keys(style)
                .map(key => {
                  element.style[key] = style[key];
                });
            } else {
              element.setAttribute(name, attrs[name]);
            }
          });
      }
      return element;
    };

    render(container, node) {
      const rootElement = this.createElement(node);
      node.element = rootElement;
      container.innerHTML = '';
      container.appendChild(rootElement);
    }
  };

  module.exports = Renderer;
}
