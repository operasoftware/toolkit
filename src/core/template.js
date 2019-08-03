/*
Copyright 2017-2019 Opera Software AS

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

  const Template = {

    /*
     * Creates a normalized Description of given template.
     */
    describe(template) {

      if (isFalsy(template)) {
        return null;
      }

      if (Array.isArray(template) && template.length) {

        const {
          ComponentDescription,
          ElementDescription,
          TextDescription,
        } = opr.Toolkit.Description;

        let description;
        for (const [item, type, index] of template.map(
                 (item, index) => [item, this.getItemType(item), index])) {
          if (index === 0) {
            switch (type) {
              case 'string':
                description = new ElementDescription(item);
                break;
              case 'component':
              case 'function':
              case 'symbol':
                description = new ComponentDescription(
                    opr.Toolkit.resolveComponentClass(item, type));
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
            if (description.type === 'component') {
              this.assignPropsToComponent(item, description);
            } else if (description.type === 'element') {
              this.assignPropsToElement(item, description);
            }
            continue;
          }
          if (isFalsy(item)) {
            continue;
          }
          if (type === 'string' || type === 'number' || item === true) {
            description.children = description.children || [];
            description.children.push(new TextDescription(String(item)));
            continue;
          } else if (type === 'node') {
            description.children = description.children || [];
            description.children.push(this.describe(item));
          } else {
            console.error(
                'Invalid item', item, `at index: ${index}, template:`,
                template);
            throw new Error(`Invalid item specified: ${type}`);
          }
        }

        if (opr.Toolkit.isDebug()) {
          opr.Toolkit.utils.deepFreeze(description);
        }
        return description;
      }

      console.error('Invalid template definition:', template);
      throw new Error('Expecting array, null or false');
    },

    /*
     * Returns a new props object supplemented by overriden values.
     */
    normalizeProps(...overrides) {
      const result = {};
      for (const override of overrides) {
        for (const [key, value] of Object.entries(override || {})) {
          if (result[key] === undefined && value !== undefined) {
            result[key] = value;
          }
        }
      }
      return result;
    },

    /*
     * Normalizes specified element props object and returns either
     * a non-empty object containing only supported props or null.
     */
    normalizeComponentProps(props, ComponentClass) {
      return this.normalizeProps(props, ComponentClass.defaultProps || {});
    },

    assignPropsToComponent(object, description) {
      const props = this.getComponentProps(
          object, description.component, description.isRoot);
      if (props) {
        description.props = props;
        if (isDefined(props.key)) {
          description.key = String(props.key);
        }
        if (props.attrs) {
          const attrs = this.getCustomAttributes(props.attrs, true);
          if (attrs) {
            description.attrs = attrs;
          }
        }
      }
    },

    getComponentProps(object, ComponentClass, isRoot) {
      const props = isRoot ?
          object :
          this.normalizeComponentProps(object, ComponentClass);
      return isNotEmpty(props) ? props : null;
    },

    assignPropsToElement(props, description) {
      for (const [key, value] of Object.entries(props)) {
        if (key === 'key') {
          if (isDefined(value)) {
            description.key = String(value);
          }
        } else if (key === 'class') {
          const className = this.getClassName(value);
          if (className) {
            description.class = className;
          }
        } else if (key === 'style') {
          const style = this.getStyle(value);
          if (style) {
            description.style = style;
          }
        } else if (key === 'dataset') {
          const dataset = this.getDataset(value);
          if (dataset) {
            description.dataset = dataset;
          }
        } else if (key === 'properties') {
          const properties = this.getProperties(value);
          if (properties) {
            description.properties = properties;
          }
        } else if (key === 'attrs') {
          const customAttrs = this.getCustomAttributes(value);
          if (customAttrs) {
            description.custom = description.custom || {};
            description.custom.attrs = customAttrs;
          }
        } else if (key === 'on') {
          const customListeners = this.getCustomListeners(value);
          if (customListeners) {
            description.custom = description.custom || {};
            description.custom.listeners = customListeners;
          }
        } else {

          const {
            isAttributeSupported,
            isAttributeValid,
            getValidElementNamesFor,
            isEventSupported,
          } = opr.Toolkit.Browser;

          if (isAttributeSupported(key)) {
            const attr = this.getAttributeValue(value);
            if (isDefined(attr)) {
              description.attrs = description.attrs || {};
              description.attrs[key] = attr;
            }
            if (opr.Toolkit.isDebug()) {
              const element = description.name;
              if (attr === undefined) {
                console.warn(
                    `Invalid undefined value for attribute "${key}"`,
                    `on element "${element}".`);
              }
              if (!element.includes('-') && !isAttributeValid(key, element)) {
                const names = getValidElementNamesFor(key)
                                  .map(key => `"${key}"`)
                                  .join(', ');
                const message =
                    `The "${key}" attribute is not supported on "${
                                                                   element
                                                                 }" elements.`;
                const hint = `Use one of ${names}.`;
                console.warn(message, hint);
              }
            }
          } else if (isEventSupported(key)) {
            const listener = this.getListener(value, key);
            if (listener) {
              description.listeners = description.listeners || {};
              description.listeners[key] = value;
            }
          } else {
            console.warn(
                `Unsupported property "${key}" on element "${
                                                             description.name
                                                           }".`);
          }
        }
      }
    },

    /*
     * Returns the type of item used in the array representing node template.
     */
    getItemType(item) {
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
    },

    /*
     * Resolves any object to a space separated string of class names.
     */
    getClassName(value) {
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
    },

    /*
     * Returns either a non-empty style object containing only understood
     * styling rules or null.
     */
    getStyle(object) {

      opr.Toolkit.assert(
          object.constructor === Object, 'Style must be a plain object!');

      const reduceToNonEmptyValues = (style, [name, value]) => {
        const string = this.getStyleProperty(value, name);
        if (isDefined(string)) {
          style[name] = string;
        }
        return style;
      };

      const entries = Object.entries(object);

      if (opr.Toolkit.isDebug()) {
        for (const [key, value] of entries.filter(
                 ([key]) => !opr.Toolkit.Browser.isStyleSupported(key))) {
          console.warn(
              `Unsupported style property, key: ${key}, value:`, value);
        }
      }

      const style =
          Object.entries(object)
              .filter(
                  ([key, value]) => opr.Toolkit.Browser.isStyleSupported(key))
              .reduce(reduceToNonEmptyValues, {});
      return isNotEmpty(style) ? style : null;
    },

    getStyleProperty(value, name) {
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
          whitelist = opr.Toolkit.Browser.SUPPORTED_FILTERS;
        } else if (name === 'transform') {
          whitelist = opr.Toolkit.Browser.SUPPORTED_TRANSFORMS;
        } else {
          throw new Error(`Unknown function list: ${JSON.stringify(value)}`);
        }
        return this.getFunctionList(value, whitelist);
      }
      throw new Error(`Invalid style property value: ${JSON.stringify(value)}`);
    },

    /*
     * Returns a multi-property string value.
     */
    getFunctionList(object, whitelist) {
      const composite = {};
      let entries = Object.entries(object);
      if (whitelist) {
        entries = entries.filter(([key, value]) => whitelist.includes(key));
      }
      for (const [key, value] of entries) {
        const stringValue =
            this.getAttributeValue(value, /*= allowEmpty */ false);
        if (isDefined(stringValue)) {
          composite[key] = stringValue;
        }
      }
      return Object.entries(composite)
          .map(([key, value]) => `${key}(${value})`)
          .join(' ');
    },

    getListener(value, name) {
      if (typeof value === 'function') {
        return value;
      }
      if (value === null || value === false || value === undefined) {
        return null;
      }
      throw new Error(`Invalid listener specified for event: ${name}`);
    },

    /*
     * Resolves given value to a string.
     */
    getAttributeValue(value, allowEmpty = true) {
      if (value === true || value === '') {
        return allowEmpty ? '' : null;
      } else if (typeof value === 'string') {
        return value;
      } else if (value === null || value === false) {
        return null;
      } else if (value === undefined) {
        return undefined;
      } else if (Array.isArray(value)) {
        return value.join('');
      } else if (['object', 'function', 'symbol'].includes(typeof value)) {
        throw new Error(`Invalid attribute value: ${JSON.stringify(value)}!`);
      }
      return String(value);
    },

    /*
     * Returns either a non-empty dataset object or null.
     */
    getDataset(object) {
      const dataset = {};
      for (const key of Object.keys(object)) {
        const value = this.getAttributeValue(object[key]);
        if (isDefined(value)) {
          dataset[key] = value;
        }
      }
      return isNotEmpty(dataset) ? dataset : null;
    },

    /*
     * Returns either a non-empty object containing properties set
     * directly on a rendered DOM Element or null.
     */
    getProperties(object) {
      return isNotEmpty(object) ? object : null;
    },

    getCustomAttributes(object, forComponent) {
      console.assert(
          object.constructor === Object,
          'Expecting object for custom attributes!');
      const attrs = {};
      for (const [key, value] of Object.entries(object)) {
        const attr = this.getAttributeValue(value, /*= allowEmpty */ true);
        if (isDefined(attr)) {
          const name = forComponent ? opr.Toolkit.utils.lowerDash(key) : key;
          attrs[name] = attr;
        }
      }
      return isNotEmpty(attrs) ? attrs : null;
    },

    getCustomListeners(object) {
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
    },
  };

  module.exports = Template;
}
