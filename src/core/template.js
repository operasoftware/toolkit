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

  const isNotEmpty = object => Boolean(Object.keys(object).length);
  const isDefined = value => value !== undefined && value !== null;

  class Template {

    /*
     * Creates a normalised description of a virtual node
     * (either instance of ComponentDescription or ElementDescription).
     */
    static describe(template) {

      const isFalsy = template => template === null || template === false;

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
                details.component =
                    opr.Toolkit.resolveComponentClass(item, type);
                break;
              default:
                console.error(
                    'Invalid node type:', item,
                    `(${type}) at index: ${index}, template:`, template);
                throw new Error(`Invalid node type specified: ${type}`);
            }
            continue;
          }
          if (index === 1 && type === 'props') {
            if (details.type === 'component') {
              const componentProps = this.normalizeComponentProps(
                  item, details.component);
              if (componentProps) {
                details.props = componentProps;
                if (isDefined(componentProps.key)) {
                  details.key = componentProps.key;
                }
              }
            } else {
              const elementProps = this.normalizeElementProps(item);
              if (elementProps) {
                details.details = elementProps;
              }
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

    /*
     * Returns either a non-empty props object supplemented with
     * default values provided by the component class for the missing values
     * or null,
     */
    static normalizeComponentProps(props = {}, ComponentClass) {
      const normalized =
          this.normalizeProps(props, ComponentClass.defaultProps || {});
      return isNotEmpty(normalized) ? normalized : null;
    }

    /*
     * Provides props object supplemented with default props values.
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
    static normalizeElementProps(props) {
      const details = {};
      for (const [key, value] of Object.keys(props).map(
               key => [key, props[key]])) {
        if (key === 'key') {
          if (isDefined(value)) {
            details.key = value;
          }
        } else if (key === 'class') {
          const className = this.getClassName(value);
          if (className) {
            details.class = className;
          }
        } else if (key === 'style') {
          const style = this.getStyle(value);
          if (style) {
            details.style = style;
          }
        } else if (key === 'dataset') {
          const dataset = this.getDataset(value);
          if (dataset) {
            details.dataset = dataset;
          }
        } else if (key === 'properties') {
          const properties = this.getProperties(value);
          if (properties) {
            details.properties = properties;
          }
        } else {

          const {
            SUPPORTED_ATTRIBUTES,
            SUPPORTED_EVENTS,
          } = opr.Toolkit;

          if (SUPPORTED_EVENTS.includes(key)) {
            if (typeof value === 'function') {
              details.listeners = details.listeners || {};
              details.listeners[key] = value;
            }
          }

          if (SUPPORTED_ATTRIBUTES.includes(key)) {
            const attributeValue = this.getAttribute(value, true);
            if (attributeValue !== null && attributeValue !== undefined) {
              details.attrs = details.attrs || {};
              details.attrs[key] = attributeValue;
            }
          }
        }
      }
      return isNotEmpty(details) ? details : null;
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
      return '';
    }

    /*
     * Returns either a non-empty style object containing only understood
     * styling rules or null.
     */
    static getStyle(object) {

      opr.Toolkit.assert(
          object.constructor === Object, 'Style must be a plain object!');

      const style = {};
      for (const [key, value] of Object.entries(object)) {
        if (key === 'filter') {
          const filter =
              this.getComposite(value, key, opr.Toolkit.SUPPORTED_FILTERS);
          if (filter) {
            style.filter = filter;
          }
        } else if (key === 'transform') {
          const transform =
              this.getComposite(value, key, opr.Toolkit.SUPPORTED_TRANSFORMS);
          if (transform) {
            style.transform = transform;
          }
        } else if (opr.Toolkit.SUPPORTED_STYLES.includes(key)) {
          const string = this.getAttribute(value, false);
          if (string !== null) {
            style[key] = string;
          }
        } else {
          console.warn(
              `Unsupported style property, key: ${key}, value:`, value);
        }
      }
      return isNotEmpty(style) ? style : null;
    }

    /*
     * Returns either a non-empty dataset object or null.
     */
    static getDataset(object) {
      const dataset = {};
      for (const key of Object.keys(object)) {
        const value = this.getAttribute(object[key], key);
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

    static convert(value, type) {}

    static getComposite(object, type, whitelist = []) {

      const composite = {};
      const keys = Object.keys(object).filter(key => whitelist.includes(key));
      for (const [key, value] of keys.map(key => [key, object[key]])) {
        const stringValue =
            this.getAttribute(value, /*= allow empty */ false);
        if (typeof stringValue === 'string') {
          composite[key] = stringValue;
        }
      }
      return Object.entries(composite)
          .map(([key, value]) => `${key}(${value})`)
          .join(' ');
    }

    static getAttribute(value, allowEmpty = true) {
      if (value === true || value === '') {
        return allowEmpty ? '' : null;
      } else if (typeof value === 'string') {
        return value;
      } else if ([null, false, undefined].includes(value)) {
        return null;
      } else if (Array.isArray(value)) {
        return value.join('');
      } else if (['object', 'function', 'symbol'].includes(typeof value)) {
        return null;
      }
      return String(value);
    }
  }

  module.exports = Template;
}
