{
  const ComponentTree = class {

    static createComponentInstance(def) {
      const ComponentClass = loader.get(def);
      return new ComponentClass();
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

    static createFromTemplate(template) {
      if (template === undefined) {
        throw new Error('Invalid undefined template!');
      }
      if (template === null || template === false || template.length === 0) {
        return null;
      }
      const description = opr.Toolkit.Template.describe(template);
      if (description.component) {
        return this.create(
          description.component, description.props, description.children);
      }
      return this.createElement(description);
    }

    static createElement(description) {
      const element = this.createElementInstance(description);
      if (description.children) {
        element.children = description.children.map(
          child => this.createFromTemplate(child));
        for (const child of element.children) {
          child.parentNode = element;
        }
      }
      return element;
    }

    static createChildTree(root, props) {

      const sandbox = root.sandbox();
      sandbox.dispatch = root.dispatch;
      sandbox.broadcast = root.broadcast.bind(root);
      sandbox.props = props;

      const template = root.render.call(sandbox);
      const tree = this.createFromTemplate(template);
      if (tree) {
        tree.parentNode = root;
      }
      return tree;
    }

    static create(symbol, props = {}, children = []) {
      try {
        const instance = this.createComponentInstance(symbol);
        instance.props = props;

        const sandbox = instance.sandbox();
        sandbox.broadcast = instance.broadcast.bind(instance);
        sandbox.props = props;
        sandbox.children = children;

        const template = instance.render.call(sandbox);
        if (template) {
          // TODO: handle undefined, false, null
          instance.appendChild(this.createFromTemplate(template));
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
  };

  module.exports = ComponentTree;
}
