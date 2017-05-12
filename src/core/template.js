{
  class Template {

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
        FUNCTION: 'function',
      };
    }

    static getClassNames(value) {
      const getClassNamesString = value => {
        if (!value) {
          return '';
        }
        if (value.constructor === Object) {
          value = Object.keys(value).map(key => value[key] && key);
        }
        if (value.constructor === Array) {
          const classNames = [];
          for (const item of value) {
            const className = getClassNamesString(item);
            if (className) {
              classNames.push(className);
            }
          }
          value = classNames.join(' ');
        }
        if (value.constructor === String) {
          return value.trim();
        }
        return '';
      };
      let classNames = getClassNamesString(value);
      if (classNames === '') {
        return [];
      }
      classNames = classNames
        .replace(/( )+/g, ' ')
        .trim()
        .split(' ');
      return [...new Set(classNames)];
    }

    static getCompositeValue(obj = {}, whitelist) {
      const names = Object.keys(obj)
        .filter(name => whitelist.includes(name));
      return this.getAttributeValue(names.reduce((result, name) => {
        const value = this.getAttributeValue(obj[name], false);
        if (value) {
          result[name] = value;
        }
        return result;
      }, {}));
    }

    static getAttributeValue(value, allowEmptyString = true) {
      if (value === undefined || value === null) {
        return null;
      }
      if (value.constructor === Function) {
        return null;
      }
      if (value.constructor === Array) {
        return value.length > 0 ? value.join('') : null;
      }
      if (value.constructor === Object) {
        const entries = Object.entries(value);
        if (entries.length > 0) {
          return entries.map(([name, value]) => `${name}(${value})`).join(' ');
        }
        return null;
      }
      if (value === '') {
        return allowEmptyString ? '' : null;
      }
      return String(value);
    }

    static getStyleValue(value, prop = null) {
      switch (prop) {
        case 'filter':
          return this.getCompositeValue(value, opr.Toolkit.SUPPORTED_FILTERS);
        case 'transform':
          return this.getCompositeValue(
              value, opr.Toolkit.SUPPORTED_TRANSFORMS);
        default:
          return this.getAttributeValue(value);
      }
    }

    static getItemType(item) {

      const Type = Template.ItemType;
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
        case 'function':
          return Type.FUNCTION;
        case 'object':
          if (item === null) {
            return Type.NULL;
          } else if (Array.isArray(item)) {
            return Type.ELEMENT;
          } else {
            return Type.PROPS;
          }
      }
    }

    static validate(template) {

      const validParamTypes =
          'properties object, text content or first child element';

      const createErrorDescription = (val, i, types) =>
          `Invalid parameter type "${val}" at index ${i}, expecting: ${types}`;

      if (template === null || template === false) {
        return {
          types: null
        };
      }

      if (!Array.isArray(template)) {
        const error =
            new Error(`Specified template: "${template}" is not an array!`);
        console.error('Specified template', template, 'is not an array!');
        return {
          error
        };
      }

      const Type = Template.ItemType;
      const types = template.map(this.getItemType);

      if (![Type.STRING, Type.COMPONENT].includes(types[0])) {
        console.error('Invalid element:', template[0],
          ', expecting component or tag name');
        const error =
            new Error(`Invalid parameter type "${types[0]}" at index 0`);
        return {
          error,
          types
        };
      }

      if (types.length <= 1) {
        return {
          types
        };
      }

      let firstChildIndex = 1;

      switch (types[1]) {
        case Type.STRING:
          if (types.length > 2) {
            const error = new Error('Text elements cannot have child nodes');
            console.error(
                'Text elements cannot have child nodes:', template.slice(1));
            return {
              error,
              types,
            };
          } else if (types[0] === Type.COMPONENT) {
            const error = new Error('Subcomponents do not accept text content');
            console.error(
                'Subcomponents do not accept text content:', template[1]);
            return {
              error,
              types,
            };
          }
        case Type.PROPS:
          firstChildIndex = 2;
        case Type.NULL:
        case Type.BOOLEAN:
          if (template[1] === true) {
            const error =
                new Error(createErrorDescription(types[1], 1, validParamTypes));
            console.error(
                'Invalid parameter', template[1],
                ', expecting:', validParamTypes);
            return {
              error,
              types,
            };
          }
        case Type.ELEMENT:
          if (types.length > 2) {
            if (types[2] === Type.STRING) {
              if (types.length > 3) {
                const error =
                    new Error('Text elements cannot have child nodes');
                console.error('Text elements cannot have child nodes:',
                  template.slice(2));
                return {
                  error,
                  types,
                };
              } else if (types[0] === Type.COMPONENT) {
                const error =
                    new Error('Subcomponents do not accept text content');
                console.error(
                    'Subcomponents do not accept text content:', template[2]);
                return {
                  error,
                  types,
                };
              }
              return {
                types,
              };
            }
          }
          for (let i = firstChildIndex; i < template.length; i++) {
            const expected = i === 1 ? validParamTypes : 'child element';
            if (types[i] !== Type.ELEMENT && template[i] !== null &&
                template[i] !== false) {
              const error = new Error(
                  `Invalid parameter type "${types[i]}" at index ${i}`);
              console.error('Invalid parameter:', template[i],
                ', expecting ' + expected);
              return {
                error,
                types,
              };
            }
          }
          return {
            types,
          };
        default:
          const error =
              new Error(createErrorDescription(types[1], 1, validParamTypes));
          console.error(
              'Invalid parameter', template[1],
              ', expecting:', validParamTypes);
          return {
            error,
            types,
          };
      }
    }

    static describe(template) {

      const {
        types,
        error
      } = this.validate(template);

      if (error) {
        console.error('Invalid template definition:', template);
        throw error;
      }

      if (types === null) {
        return null;
      }

      const Type = Template.ItemType;
      const type = (types[0] === Type.COMPONENT ? 'component' : 'name');

      const onlyValidElements = element => Array.isArray(element);

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
              children: template.slice(1).filter(onlyValidElements),
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
              children: template.slice(2).filter(onlyValidElements),
            };
          }
          return {
            [type]: template[0],
            children: template.slice(1).filter(onlyValidElements),
          };
      }
    }
  }

  module.exports = Template;
}
