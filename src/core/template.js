/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

{
  const isDefined = value => value !== undefined && value !== null;
  const isFalsy = template => template === null || template === false;
  const isNotEmpty = object => Boolean(Object.keys(object).length);

  class Template {

    /*
     * Creates a normalized Description of given template.
     */
    static describe(template) {

      if (isFalsy(template)) {
        return null;
      }

      if (Array.isArray(template) && template.length) {
        const details = {};
        for (const [item, type, index] of template.map(
                 (item, index) => [item, this.getItemType(item), index])) {
          if (index === 0) {
            switch (type) {
            case 'string':
              details.type = 'element';
              details.name = item;
              break;
            case 'component':
            case 'function':
            case 'symbol':
              details.type = 'component';
              details.component = opr.Toolkit.resolveComponentClass(item, type);
              break;
            default:
              console.error('Invalid node type:', item,
                            `(${type}) at index: ${index}, template:`,
                            template);
              throw new Error(`Invalid node type specified: ${type}`);
            }
            continue;
          }
          if (index === 1 && type === 'props') {
            const props = details.type === 'component'
                              ? this.getComponentProps(item, details.component)
                              : this.getElementProps(item);
            if (props) {
              details.props = props;
            }
            continue;
          }
          if (isFalsy(item)) {
            continue;
          }
          if (type === 'string' || type === 'number' || item === true) {
            if (details.component) {
              console.error(
                  `Invalid text item found at index: ${index}, template:`,
                  template);
              throw new Error('Components cannot define text content');
            }
            if (details.children) {
              console.error(
                  `Invalid node item found at index: ${index}, template:`,
                  template);
              throw new Error(
                  'Elements with child nodes cannot define text content');
            }
            details.text = String(item);
            continue;
          } else if (type === 'node') {
            if (typeof details.text === 'string') {
              console.error(
                  `Invalid node item found at index: ${index}, template:`,
                  template);
              throw new Error('Text elements cannot have child nodes!');
            }
            details.children = details.children || [];
            details.children.push(this.describe(item));
          } else {
            console.error('Invalid item', item, `at index: ${index}, template:`,
                          template);
            throw new Error(`Invalid item specified: ${type}`);
          }
        }

        return opr.Toolkit.Description.create(details);
      }

      console.error('Invalid template definition:', template);
      throw new Error('Expecting array, null or false');
    }

    static getComponentProps(object, ComponentClass) {
      const isRoot = ComponentClass.prototype instanceof opr.Toolkit.Root;
      const props = isRoot
                        ? object
                        : this.normalizeComponentProps(object, ComponentClass);
      return isNotEmpty(props) ? props : null;
    }

    /*
     * Supplements given object with default props for given class.
     * Returns either a non-empty props object or null.
     */
    static normalizeComponentProps(props = {}, ComponentClass) {
      return this.normalizeProps(props, ComponentClass.defaultProps);
    }

    /*
     * Returns a new props object supplemented by overriden values.
     */
    static normalizeProps(...overrides) {
      const result = {};
      for (const override of overrides) {
        for (const [key, value] of Object.entries(override || {})) {
          if (result[key] === undefined && value !== undefined) {
            result[key] = value;
          }
        }
      }
      return result;
    }

    /*
     * Normalizes specified element props object and returns either
     * a non-empty object containing only supported props or null.
     */
    static getElementProps(object) {
      const props = {};
      for (const [key, value] of Object.entries(object)) {
        if (key === 'key') {
          if (isDefined(value)) {
            props.key = value;
          }
        } else if (key === 'class') {
          const className = this.getClassName(value);
          if (className) {
            props.class = className;
          }
        } else if (key === 'style') {
          const style = this.getStyle(value);
          if (style) {
            props.style = style;
          }
        } else if (key === 'dataset') {
          const dataset = this.getDataset(value);
          if (dataset) {
            props.dataset = dataset;
          }
        } else if (key === 'properties') {
          const properties = this.getProperties(value);
          if (properties) {
            props.properties = properties;
          }
        } else if (key === 'attrs') {
          const customAttrs = this.getCustomAttributes(value);
          if (customAttrs) {
            props.custom = props.custom || {};
            props.custom.attrs = customAttrs;
          }
        } else if (key === 'on') {
          const customListeners = this.getCustomListeners(value);
          if (customListeners) {
            props.custom = props.custom || {};
            props.custom.listeners = customListeners;
          }
        } else {

          const {
            SUPPORTED_ATTRIBUTES,
            SUPPORTED_EVENTS,
          } = opr.Toolkit;

          if (SUPPORTED_ATTRIBUTES.includes(key)) {
            const attr = this.getAttributeValue(value);
            if (isDefined(attr)) {
              props.attrs = props.attrs || {};
              props.attrs[key] = attr;
            }
          } else if (SUPPORTED_EVENTS.includes(key)) {
            const listener = this.getListener(value, key);
            if (listener) {
              props.listeners = props.listeners || {};
              props.listeners[key] = value;
            }
          } else {
            console.warn('Unsupported property:', key);
          }
        }
      }
      return isNotEmpty(props) ? props : null;
    }

    /*
     * Returns the type of item used in the array representing node template.
     */
    static getItemType(item) {
      const type = typeof item;
      switch (type) {
      case 'function':
        if (item.prototype instanceof opr.Toolkit.Component) {
          return 'component';
        }
        return 'function';
      case 'object':
        if (item === null) {
          return 'null';
        } else if (Array.isArray(item)) {
          return 'node';
        } else if (item.constructor === Object) {
          return 'props';
        }
        return 'unknown';
      default:
        return type;
      }
    }

    /*
     * Resolves any object to a space separated string of class names.
     */
    static getClassName(value) {
      if (!value) {
        return '';
      }
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value)) {
        return value
            .reduce(
                (result, item) => {
                  if (!item) {
                    return result;
                  }
                  if (typeof item === 'string') {
                    result.push(item);
                    return result;
                  }
                  result.push(this.getClassName(item));
                  return result;
                },
                [])
            .filter(item => item)
            .join(' ');
      }
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
          return '';
        }
        return Object.keys(value)
            .map(key => value[key] && key)
            .filter(item => item)
            .join(' ');
      }
      throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }

    /*
     * Returns either a non-empty style object containing only understood
     * styling rules or null.
     */
    static getStyle(object) {

      opr.Toolkit.assert(object.constructor === Object,
                         'Style must be a plain object!');

      const isSupported = key => opr.Toolkit.SUPPORTED_STYLES.includes(key);

      const reduceToNonEmptyValues = (style, [name, value]) => {
        const string = this.getStyleProperty(value, name);
        if (string !== null) {
          style[name] = string;
        }
        return style;
      };

      const entries = Object.entries(object);

      if (opr.Toolkit.isDebug()) {
        for (const [key, value] of entries.filter(([key]) =>
                                                      !isSupported(key))) {
          console.warn(`Unsupported style property, key: ${key}, value:`,
                       value);
        }
      }

      const style = Object.entries(object)
                        .filter(([key, value]) => isSupported(key))
                        .reduce(reduceToNonEmptyValues, {});
      return isNotEmpty(style) ? style : null;
    }

    static getStyleProperty(value, name) {
      if (typeof value === 'string') {
        return value || '\'\'';
      } else if ([true, false, null, undefined].includes(value)) {
        return null;
      } else if (Array.isArray(value)) {
        return value.join('');
      } else if (typeof value === 'number') {
        return String(value);
      } else if (typeof value === 'object') {
        let whitelist;
        if (name === 'filter') {
          whitelist = opr.Toolkit.SUPPORTED_FILTERS;
        } else if (name === 'transform') {
          whitelist = opr.Toolkit.SUPPORTED_TRANSFORMS;
        } else {
          throw new Error(`Unknown function list: ${JSON.stringify(value)}`);
        }
        return this.getFunctionList(value, whitelist);
      }
      throw new Error(`Invalid style property value: ${JSON.stringify(value)}`);
    }

    /*
     * Returns a multi-property string value.
     */
    static getFunctionList(object, whitelist) {
      const composite = {};
      let entries = Object.entries(object);
      if (whitelist) {
        entries = entries.filter(([key, value]) => whitelist.includes(key));
      }
      for (const [key, value] of entries) {
        const stringValue = this.getAttributeValue(value, false);
        if (stringValue !== null) {
          composite[key] = stringValue;
        }
      }
      return Object.entries(composite)
          .map(([key, value]) => `${key}(${value})`)
          .join(' ');
    }

    static getListener(value, name) {
      if (typeof value === 'function') {
        return value;
      }
      if (value === null || value === false || value === undefined) {
        return null;
      }
      throw new Error(`Invalid listener specified for event: ${name}`);
    }

    /*
     * Resolves given value to a string.
     */
    static getAttributeValue(value, allowEmpty = true) {
      if (value === true || value === '') {
        return allowEmpty ? '' : null;
      } else if (typeof value === 'string') {
        return value;
      } else if ([null, false, undefined].includes(value)) {
        return null;
      } else if (Array.isArray(value)) {
        return value.join('');
      } else if (['object', 'function', 'symbol'].includes(typeof value)) {
        throw new Error(`Invalid attribute value: ${JSON.stringify(value)}!`);
      }
      return String(value);
    }

    /*
     * Returns either a non-empty dataset object or null.
     */
    static getDataset(object) {
      const dataset = {};
      for (const key of Object.keys(object)) {
        const value = this.getAttributeValue(object[key]);
        if (value !== null) {
          dataset[key] = value;
        }
      }
      return isNotEmpty(dataset) ? dataset : null;
    }

    /*
     * Returns either a non-empty object containing properties set
     * directly on a rendered DOM Element or null.
     */
    static getProperties(object) {
      return isNotEmpty(object) ? object : null;
    }

    static getCustomAttributes(object) {
      console.assert(
          object.constructor === Object,
          'Expecting object for custom attributes!');
      const attrs = {};
      for (const [key, value] of Object.entries(object)) {
        const attr = this.getAttributeValue(value, true);
        if (attr !== null) {
          attrs[key] = attr;
        }
      }
      return isNotEmpty(attrs) ? attrs : null;
    }

    static getCustomListeners(object) {
      console.assert(
          object.constructor === Object,
          'Expecting object for custom listeners!');
      const listeners = {};
      for (const [key, value] of Object.entries(object)) {
        const listener = this.getListener(value, key);
        if (listener) {
          listeners[key] = listener;
        }
      }
      return isNotEmpty(listeners) ? listeners : null;
    }
  }

  module.exports = Template;
}
