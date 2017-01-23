class VirtualDOM {

  static get ItemType() {
    return {
      STRING: 'string',
      NUMBER: 'number',
      BOOLEAN: 'boolean',
      UNDEFINED: 'undefined',
      NULL: 'null',
      COMPONENT: 'component',
      ELEMENT: 'element',
      PROPS: 'props',
    };
  }

  static async resolve(component) {

    try {

      const template = await component.render();

      const {
        children
      } = this.spread(template, component);

      const node = this.createNode(template);
      await this.addChildren(node, children);

      node.component = component;
      return node;

    } catch (e) {
      console.error('Error resolving:', component);
      throw e;
    }
  }

  static createNode(template) {
    const {
      name,
      props,
      children,
      text
    } = this.spread(template);

    const node = new VirtualNode(name);
    this.addAttributes(node, props);
    this.addListeners(node, props);
    if (text) {
      node.text = text;
    }
    return node;
  }

  static addAttributes(node, props = {}) {
    const attributes = Object.keys(props)
      .filter(key => SUPPORTED_ATTRIBUTES.includes(key))
      .reduce((result, key) => {
        const attr = key.replace(/(?:^|\.?)([A-Z])/g,
          (x, y) => ('-' + y.toLowerCase()));
        result[attr] = '' + props[key];
        return result;
      }, {});
    if (Object.keys(attributes).length > 0) {
      node.attrs = attributes;
    }
  }

  static addListeners(node, props = {}) {
    const eventListeners = Object.keys(props)
      .filter(key => SUPPORTED_EVENTS.includes(key))
      .reduce((result, key) => {
        const event = key.toLowerCase().slice(2);
        result[event] = props[key];
        return result;
      }, {});
    if (Object.keys(eventListeners).length > 0) {
      node.listeners = eventListeners;
    }
  }

  static async addChildren(node, children = []) {
    for (let childTemplate of children) {
      if (Array.isArray(childTemplate)) {
        const [name] = childTemplate;
        if (typeof name === 'symbol') {
          // TODO: amend instantiation
          const child = await Reactor.instantiate(name);
          const {
            props
          } = this.spread(childTemplate);
          child.props = props;
          const childNode = await this.resolve(child);
          node.addChild(childNode);
        } else if (typeof name === 'string') {
          const childNode = this.createNode(childTemplate);
          node.addChild(childNode);

          const grandchildren = this.spread(childTemplate).children;
          this.addChildren(childNode, grandchildren);
        }
      }
    }
  }

  static getItemType(item) {

    const Type = VirtualDOM.ItemType;
    const type = typeof item;

    switch (type) {
      case 'string':
        return Type.STRING;
      case 'number':
        return Type.NUMBER;
      case 'boolean':
        return Type.BOOLEAN;
      case 'undefined':
        return Type.UNDEFINED;
      case 'symbol':
        return Type.COMPONENT;
      case 'object':
        if (item === null) {
          return Type.NULL;
        } else if (Array.isArray(item)) {
          return Type.ELEMENT;
        } else {
          return Type.PROPS;
        }
      default:
        console.error('Unknown type of:', item);
    }
  }

  static validate(template) {
    const Type = VirtualDOM.ItemType;
    if (Array.isArray(template)) {
      const types = template.map(this.getItemType);
      if (![Type.STRING, Type.COMPONENT].includes(types[0])) {
        console.error('Invalid element:', template[0],
          ', expecting component or tag name');
        const error = new Error(`Invalid parameter type "${types[0]}" at index 0`);
        return {
          error,
          types
        };
      } else if (types.length > 1) {
        switch (types[1]) {
          case Type.STRING:
            if (types.length > 2) {
              const error = new Error('Text elements cannot have child nodes');
              console.error('Text elements cannot have child nodes:', template.slice(1));
              return {
                error,
                types
              };
            } else if (types[0] === Type.COMPONENT) {
              const error = new Error('Subcomponents do not accept text content');
              console.error('Subcomponents do not accept text content:', template[1]);
              return {
                error,
                types
              };
            }
          case Type.PROPS:
          case Type.ELEMENT:
            if (types.length > 2) {
              if (types[2] === Type.STRING) {
                if (types.length > 3) {
                  const error = new Error('Text elements cannot have child nodes');
                  console.error('Text elements cannot have child nodes:',
                    template.slice(2));
                  return {
                    error,
                    types
                  };
                } else if (types[0] === Type.COMPONENT) {
                  const error = new Error('Subcomponents do not accept text content');
                  console.error('Subcomponents do not accept text content:', template[2]);
                  return {
                    error,
                    types
                  };
                }
                return {
                  types
                };
              }
              for (let i = 2; i < template.length; i++) {
                if (types[i] !== Type.ELEMENT) {
                  const error = new Error(`Invalid parameter type: "${types[i]}" at index: ${i}`);
                  console.error('Invalid parameter:', template[i],
                    ', expecting child element');
                  return {
                    error,
                    types
                  };
                }
              }
            }
            return {
              types
            };
          default:
            console.log('Invalid parameter', template[1], 'expecting properties object, text content or first child element');
            return {
              error,
              types
            };
        }
      }
      return {
        types
      };
    } else {
      console.error('Specified template', template, 'is not an array!');
    }
  }

  static spread(template, component) {

    const Type = VirtualDOM.ItemType;
    const {
      types,
      error
    } = this.validate(template);

    if (error) {
      console.error('Invalid template definition:', template);
      throw error;
    }

    const type = (types[0] === Type.COMPONENT ? 'component' : 'name');

    switch (template.length) {
      case 1:
        return {
          [type]: template[0],
        };
      case 2:
        if (types[1] === Type.STRING) {
          const text = template[1];
          return {
            [type]: template[0],
            text,
          };
        } else if (types[1] === Type.PROPS) {
          return {
            [type]: template[0],
            props: template[1]
          };
        } else if (types[1] === Type.ELEMENT) {
          return {
            [type]: template[0],
            children: template.slice(1),
          };
        }
      default:
        if (types[1] === Type.PROPS) {
          if (types[2] === Type.STRING) {
            return {
              [type]: template[0],
              props: template[1],
              text: template[2],
            };
          }
          return {
            [type]: template[0],
            props: template[1],
            children: template.slice(2),
          };
        }
        return {
          [type]: template[0],
          children: template.slice(1),
        };
    }
  }

  static calculateDiff(prev, next) {
    if (prev === null) {
      return next;
    }
    // TODO: calculate diff
    return next;
  }
}

module.exports = VirtualDOM;
