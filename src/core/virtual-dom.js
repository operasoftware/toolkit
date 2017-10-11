{
  class VirtualDOM {

    static getComponentClass(symbol) {
      const ComponentClass = loader.get(symbol);
      opr.Toolkit.assert(
          ComponentClass, `No component found for: ${String(symbol)}`);
      opr.Toolkit.assert(
          ComponentClass.prototype instanceof opr.Toolkit.Component,
          'Component class', ComponentClass.name,
          'must extend opr.Toolkit.Component');
      return ComponentClass;
    }

    static createComponentFrom(symbol, props, children) {
      const ComponentClass = this.getComponentClass(symbol);
      const normalizedProps = this.normalizeProps(ComponentClass, props);
      return new ComponentClass(normalizedProps, children);
    }

    static createElementInstance(description, component) {

      let element;

      if (description.props) {

        const props = description.props;
        element = new opr.Toolkit.VirtualElement(description.name, props.key);

        if (opr.Toolkit.isDebug()) {
          const unknownAttrs = Object.keys(props).filter(
              attr => !opr.Toolkit.utils.isSupportedAttribute(attr));
          for (const unknownAttr of unknownAttrs) {
            const suggestion = opr.Toolkit.SUPPORTED_ATTRIBUTES.find(
                attr => attr.toLowerCase() === unknownAttr.toLowerCase());
            if (suggestion) {
              opr.Toolkit.warn(
                  `Attribute name "${unknownAttr}"`,
                  `should be spelled "${suggestion}",`,
                  `check render() method of ${component.constructor.name}`);
            } else {
              opr.Toolkit.warn(
                  `Attribute name "${unknownAttr}" is not valid,`,
                  `check render() method of ${component.constructor.name}`);
            }
          }
        }

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
        Object.keys(dataset).forEach(attr => {
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
              const value =
                  opr.Toolkit.Template.getStyleValue(style[prop], prop);
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
          Object.keys(props.metadata).forEach(key => {
            element.metadata[key] = props.metadata[key];
          });
        }
      } else {
        element = new opr.Toolkit.VirtualElement(description.name);
      }
      // text
      if (description.text) {
        element.text = description.text;
      }
      return element;
    }

    static createFromTemplate(template, previousNode, root, component) {
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
      return this.createElement(description, previousNode, root, component);
    }

    static createElement(description, previousNode, root, component) {
      const element = this.createElementInstance(description, component);
      const getPreviousChild = (index, {key = null}) => {
        if (element.isCompatible(previousNode)) {
          if (key !== null) {
            return previousNode.children.find(child => child.key === key);
          }
          return previousNode.children[index];
        }
        return null;
      };
      if (description.children) {
        element.children = description.children.map((childTemplate, index) => {
          const childDescription = opr.Toolkit.Template.describe(childTemplate);
          const child = this.createFromTemplate(
              childTemplate,
              getPreviousChild(index, childDescription.props || {}), root,
              component);
          child.parentNode = element;
          return child;
        });
      }
      return element;
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

    static createChildTree(root, previousTree) {

      let template;
      if (root.elementName) {
        // TODO: do better
        template = [
          root.elementName,
          {
            metadata: {
              component: root,
            },
          },
        ];
      } else {
        const sandbox = root.sandbox;
        sandbox.props = root.state;
        template = root.render.call(sandbox);

        opr.Toolkit.assert(
            template !== undefined,
            'Invalid undefined template returned when rendering:', root);
      }
      const tree = this.createFromTemplate(template, previousTree, root, root);
      if (tree) {
        tree.parentNode = root;
      }
      return tree;
    }

    static createComponent(
        symbol, props = {}, children = [], previousNode, root) {
      try {
        const instance = this.createComponentFrom(symbol, props, children);

        const sandbox = instance.isCompatible(previousNode) ?
            previousNode.sandbox :
            instance.sandbox;

        sandbox.props = instance.props;
        sandbox.children = children;

        let template;
        if (instance instanceof opr.Toolkit.Root) {
          const customElementName = instance.constructor.elementName;
          if (customElementName) {
            // TODO: static render after element will have attached
            template = [
              customElementName,
            ];
          } else {
            // clang-format off
            /* eslint-disable max-len */
            throw new Error(
                `No custom element name defined in "${instance.constructor.name}", implement "static get elementName()" method.`);
            /* eslint-enable max-len */
            // clang-format on
          }
        } else {
          instance.commands = root && root.commands || {};
          template = instance.render.call(sandbox);
        }

        opr.Toolkit.assert(
            template !== undefined,
            'Invalid undefined template returned when rendering:', instance);

        if (template) {
          const previousChild = previousNode && previousNode.isComponent() ?
              previousNode.child :
              null;
          instance.appendChild(
              this.createFromTemplate(template, previousChild, root, instance));
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

  module.exports = VirtualDOM;
}
