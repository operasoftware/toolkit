{
  class ComponentTree {

    static createComponentInstance(id, props = {}) {
      const ComponentClass = loader.get(id);
      const instance = new ComponentClass();
      if (props.key !== undefined) {
        instance.key = props.key;
      }
      if (typeof instance.getKey === 'function') {
        const key = instance.getKey.bind({props})();
        if (key) {
          instance.key = key;
        }
      }
      return instance;
    }

    static createElementInstance(description) {
      const element = new opr.Toolkit.VirtualElement(description.name);
      if (description.props) {
        const props = description.props;
        // attributes
        Object.keys(props)
          .filter(attr => opr.Toolkit.SUPPORTED_ATTRIBUTES.includes(attr))
          .forEach(attr => {
            const value = opr.Toolkit.Template.getAttributeValue(props[attr]);
            if (value !== null && value !== undefined) {
              element.setAttribute(attr, value);
            }
          });
        // data attributes
        const dataset = props.dataset || {};
        Object.keys(dataset)
          .forEach(attr => {
            const value = opr.Toolkit.Template.getAttributeValue(dataset[attr]);
            element.setDataAttribute(attr, value);
          });
        // class names
        const classNames = opr.Toolkit.Template.getClassNames(props.class);
        classNames.forEach(className => {
          element.addClassName(className);
        });
        // style
        const style = props.style || {};
        Object.keys(style)
          .filter(prop => opr.Toolkit.SUPPORTED_STYLES.includes(prop))
          .forEach(prop => {
            const value = opr.Toolkit.Template.getStyleValue(style[prop], prop);
            if (value !== null && value !== undefined) {
              element.setStyleProperty(prop, value);
            }
          });
        // listeners
        Object.keys(props)
          .filter(event => opr.Toolkit.SUPPORTED_EVENTS.includes(event))
          .forEach(event => {
            const name = opr.Toolkit.utils.getEventName(event);
            const listener = props[event];
            if (typeof listener === 'function') {
              element.addListener(name, listener);
            }
          });
        // metadata
        if (props.metadata) {
          Object.keys(props.metadata)
            .forEach(key => { element.metadata[key] = props.metadata[key]; });
        }
        // key
        if (props.key) {
          element.key = props.key;
        }
      }
      // text
      if (description.text) {
        element.text = description.text;
      }
      return element;
    }

    static createFromTemplate(template, previousNode, root) {
      if (template === undefined) {
        throw new Error('Invalid undefined template!');
      }
      if (template === null || template === false || template.length === 0) {
        return null;
      }
      const description = opr.Toolkit.Template.describe(template);
      if (description.component) {
        return this.createComponent(
          description.component, description.props, description.children,
          previousNode, root);
      }
      return this.createElement(description, previousNode, root);
    }

    static createElement(description, previousNode, root) {
      const element = this.createElementInstance(description);
      const getPreviousChild = index => {
        if (element.isCompatible(previousNode)) {
          return previousNode.children[index] || null;
        } else {
          return null;
        }
      };
      if (description.children) {
        element.children = description.children.map((desc, index) => {
          const child =
              this.createFromTemplate(desc, getPreviousChild(index), root);
          child.parentNode = element;
          return child;
        });
      }
      return element;
    }

    static calculateProps(component, props = {}) {
      const defaultProps = component.constructor.defaultProps;
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

    static createChildTree(root, props, previousTree) {

      const sandbox = root.sandbox;
      sandbox.props = this.calculateProps(root, props);

      const template = root.render.call(sandbox);
      const tree = this.createFromTemplate(template, previousTree, root);
      if (tree) {
        tree.parentNode = root;
      }
      return tree;
    }

    static createComponent(
        symbol, props = {}, children = [], previousNode, root) {
      try {
        const instance = this.createComponentInstance(symbol, props);
        const calculatedProps = this.calculateProps(instance, props);
        instance.props = calculatedProps;
        instance.commands = root && root.commands || {};

        const sandbox = instance.isCompatible(previousNode) ?
          previousNode.sandbox :
          instance.sandbox;

        sandbox.props = calculatedProps;
        sandbox.children = children;

        const template = instance.render.call(sandbox);
        if (template) {
          // TODO: handle undefined, false, null
          const previousChild = previousNode && previousNode.isComponent() ?
            previousNode.child : null;
          instance.appendChild(
            this.createFromTemplate(template, previousChild, root));
        }
        return instance;
      } catch (e) {
        console.error('Error creating Component Tree:', symbol);
        throw e;
      }
    }

    static async resolve() {
      // TODO: implement
    }
  }

  module.exports = ComponentTree;
}
