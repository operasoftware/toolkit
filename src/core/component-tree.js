{
  const ComponentTree = class {

    static createComponentInstance(def) {
      const ComponentClass = loader.get(def);
      return new ComponentClass();
    }

    static createElementInstance(description) {
      const element = new Reactor.VirtualElement(description.name);
      if (description.props) {
        const props = description.props;
        // attributes
        Object.keys(props)
          .filter(attr => Reactor.SUPPORTED_ATTRIBUTES.includes(attr))
          .forEach(attr => {
            const value = Reactor.Template.getAttributeValue(props[attr]);
            if (value !== null && value !== undefined) {
              element.setAttribute(attr, value);
            }
          });
        // data attributes
        const dataset = props.dataset || {};
        Object.keys(dataset)
          .forEach(attr => {
            const value = Reactor.Template.getAttributeValue(dataset[attr]);
            element.setDataAttribute(attr, value);
          });
        // class names
        const classNames = Reactor.Template.getClassNames(props.class);
        classNames.forEach(className => {
          element.addClassName(className);
        });
        // style
        const style = props.style || {};
        Object.keys(style)
          .filter(prop => Reactor.SUPPORTED_STYLES.includes(prop))
          .forEach(prop => {
            const value = Reactor.Template.getStyleValue(style[prop], prop);
            if (value !== null && value !== undefined) {
              element.setStyleProperty(prop, value);
            }
          });
        // listeners
        Object.keys(props)
          .filter(event => Reactor.SUPPORTED_EVENTS.includes(event))
          .forEach(event => {
            const name = Reactor.utils.getEventName(event);
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
      const description = Reactor.Template.describe(template);
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
      root.context.props = props;
      root.context.dispatch = root.dispatch;
      const template = root.context.render();
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
        instance.context.props = props;
        instance.context.children = children;
        const template = instance.context.render();
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
