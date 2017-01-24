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

  static create(component) {

    const createFromTemplate = template => {
      const definition = this.spread(template);
      if (definition.component) {
        const child = Reactor.construct(definition.component);
        child.props = definition.props;
        return this.create(child);
      }
      return createFromDefinition(definition);
    };

    const createFromDefinition = definition => {
      const node = VirtualNode.create(definition);
      if (definition.children) {
        node.children = definition.children.map(createFromTemplate);
      }
      return node;
    };

    try {
      return createFromTemplate(component.render());
    } catch (e) {
      console.error('Error creating Virtual DOM:', component);
      throw e;
    }
  }

  static async resolve(component) {

    const createFromTemplate = async template => {
      const definition = this.spread(template);
      if (definition.component) {
        const child = await Reactor.instantiate(definition.component);
        child.props = definition.props;
        return await this.resolve(child);
      }
      return await createFromDefinition(definition);
    };

    const createFromDefinition = async definition => {
      const node = VirtualNode.create(definition);
      if (definition.children) {
        node.children = [];
        for (let template of definition.children) {
          const child = await createFromTemplate(template);
          node.children.push(child);
        }
      }
      return node;
    };

    try {
      return await createFromTemplate(component.render());
    } catch (e) {
      console.error('Error resolving Virtual DOM:', component);
      throw e;
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

  static spread(template) {

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