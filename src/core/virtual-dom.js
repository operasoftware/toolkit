{
  class VirtualDOM {

    static createFromDescription(description, parent, root) {
      if (!description) {
        return null;
      }
      if (description.element) {
        return this.createElement(description, parent, root);
      }
      const children = description.children ?
          description.children.map(child => child.toTemplate()) :
          [];
      const component = this.createComponent(
          description.component, description.props, children, parent, root);
      const childDescription = opr.Toolkit.Renderer.render(component);
      if (childDescription) {
        component.description = childDescription;
        component.appendChild(
            this.createFromDescription(childDescription, component, root));
      }
      return component;
    }

    static createElement(description, parent, root) {
      const props = description.props || {};
      const children = this.createChildren(description.children, root);
      const element = new opr.Toolkit.VirtualElement(
          description.element, props, description.text || children,
          description.key);
      return element;
    }

    static createChildren(descriptions, root) {
      if (!descriptions) {
        return null;
      }
      return descriptions.map(
          description => this.createFromDescription(description, null, root));
    }

    static createComponent(symbol, props = {}, children = [], parent, root) {
      try {
        const component =
            this.createComponentInstance(symbol, props, children, parent);
        opr.Toolkit.assert(
            !component.isRoot(), 'Invalid root instance passed as a child!')
        console.assert(
            root, 'Root instance not passed for construction of a component ');
        component.commands = root && root.commands || {};
        return component;
      } catch (e) {
        console.error('Error creating Component Tree:', symbol);
        throw e;
      }
    }

    static createComponentInstance(symbol, props, children, parent) {
      const ComponentClass = this.getComponentClass(symbol);
      const normalizedProps = this.normalizeProps(ComponentClass, props);
      return new ComponentClass(normalizedProps, children, parent);
    }

    static normalizeProps(ComponentClass, props = {}) {
      const defaultProps = ComponentClass.defaultProps;
      if (defaultProps) {
        const result = Object.assign({}, props);
        const keys = Object.keys(defaultProps);
        for (const key of keys) {
          if (props[key] === undefined) {
            result[key] = defaultProps[key];
          }
        }
        return result;
      }
      return props;
    }

    static getComponentClass(path) {
      const ComponentClass = loader.get(path);
      opr.Toolkit.assert(ComponentClass, `No component found for: ${path}`);
      opr.Toolkit.assert(
          ComponentClass.prototype instanceof opr.Toolkit.Component,
          'Component class', ComponentClass.name,
          'must extend opr.Toolkit.Component');
      return ComponentClass;
    }
  }

  module.exports = VirtualDOM;
}
