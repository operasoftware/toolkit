class VirtualDOM {

  static async resolve(component) {

    const template = await component.render();
    const result = this.validate(template);
    if (result.error) {
      console.error('Invalid template definition:', template, 'rendered by:', component);
      throw result.error;
    }

    const node = this.createNode(template);

    const {
      children
    } = this.spread(template);
    await this.addChildren(node, children);

    node.component = component;
    return node;
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
    const type = typeof item;
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
      case 'symbol':
        return type;
      case 'object':
        if (item === null) {
          return 'null';
        } else if (Array.isArray(item)) {
          return 'element';
        } else {
          return 'props';
        }
      default:
        console.error('Unknown type of:', item);
    }
  }

  static validate(template) {
    if (Array.isArray(template)) {
      const types = template.map(this.getItemType);
      if (!['string', 'symbol'].includes(types[0])) {
        console.error('Invalid element:', template[0],
          ', expecting component or tag name');
        const error = new Error(`Invalid parameter type "${types[0]}" at index 0`);
        return {
          error,
          types
        };
      } else if (types.length > 1) {
        switch (types[1]) {
          case 'string':
            if (types.length > 2) {
              const error = new Error('Text elements cannot have child nodes');
              console.error('Text elements cannot have child nodes:', template.slice(1));
              return {
                error,
                types
              }
            }
          case 'props':
          case 'element':
            if (types.length > 2) {
              if (types[2] === 'string') {
                if (types.length > 3) {
                  const error = new Error('Text elements cannot have child nodes');
                  console.error('Text elements cannot have child nodes:',
                    template.slice(2));
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
                if (types[i] !== 'element') {
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

  static spread(template) {
    
    const {
      types,
      error
    } = this.validate(template);
    console.assert(!error, 'Invalid template:', template);

    const [name, ...params] = template;
    switch (params.length) {
      case 0:
        return {
          name
        };
      case 1:
        if (typeof params[0] === 'string') {
          const text = params[0];
          return {
            name,
            text
          };
        } else if (Array.isArray(params[0])) {
          const children = params;
          return {
            name,
            children
          };
        } else if (typeof params[0] === 'object' && params[0]) {
          const props = params[0];
          return {
            name,
            props
          };
        } else {
          throw `Invalid content type: ${params[0]}`;
        }
      default:
        const props = params[0];
        if (typeof props === 'object') {
          const content = params[1];
          if (typeof params[1] === 'string') {
            const text = params[1];
            return {
              name,
              props,
              text
            };
          } else if (Array.isArray(params[1])) {
            const children = params;
            return {
              name,
              props,
              children
            };
          } else {
            throw `Invalid content type: ${params[0]}`;
          }
        } else {
          throw `Invalid attributes definition: ${props}`;
        }
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
