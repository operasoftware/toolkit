{
  class ComponentTree {

    static createComponentInstance(def, key) {
      const ComponentClass = loader.get(def);
      const instance = new ComponentClass();
      if (key !== undefined) {
        instance.key = key;
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

    static createFromTemplate(template, previousNode) {
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
          previousNode);
      }
      return this.createElement(description, previousNode);
    }

    static createElement(description, previousNode) {
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
          const child = this.createFromTemplate(desc, getPreviousChild(index));
          child.parentNode = element;
          return child;
        });
      }
      return element;
    }

    static createChildTree(root, props, previousTree) {

      const sandbox = root.sandbox;
      sandbox.props = props;

      const template = root.render.call(sandbox);
      const tree = this.createFromTemplate(template, previousTree);
      if (tree) {
        tree.parentNode = root;
      }
      return tree;
    }

    static createComponent(symbol, props = {}, children = [], previousNode) {
      try {
        const instance = this.createComponentInstance(symbol, props.key);
        instance.props = props;

        const sandbox = instance.isCompatible(previousNode) ?
          previousNode.sandbox :
          instance.sandbox;

        sandbox.props = props;
        sandbox.children = children;

        const template = instance.render.call(sandbox);
        if (template) {
          // TODO: handle undefined, false, null
          const previousChild = previousNode && previousNode.isComponent() ?
            previousNode.child : null;
          instance.appendChild(
            this.createFromTemplate(template, previousChild));
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
