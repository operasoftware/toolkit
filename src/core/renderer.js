{
  const Renderer = class {



    render(container, node) {
      const rootElement = this.createElement(node);
      node.element = rootElement;
      container.innerHTML = '';
      container.appendChild(rootElement);
    }
  };

  module.exports = Renderer;
}
