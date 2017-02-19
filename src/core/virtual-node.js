{

  const getClassName = value => {

    if (!value) {
      return '';
    }

    if (value.constructor === Object) {
      value = Object.keys(value).map(key => value[key] && key);
    }

    if (value.constructor === Array) {
      const classNames = [];
      for (const item of value) {
        const className = getClassName(item);
        if (className) {
          classNames.push(className);
        }
      }
      value = classNames.join(' ');
    }

    if (value.constructor === String) {
      return value.trim();
    }

    return null;
  };

  const VirtualNode = class {

    constructor(name, props = {}) {
      this.name = name;
      this.addAttributes(props);
      this.addListeners(props);
      if (props.key) {
        this.key = props.key;
      }
    }

    static create(definition) {
      const {
        name,
        props,
        children,
        text
      } = definition;

      const node = new VirtualNode(name, props);
      if (text) {
        node.text = text;
      }
      return node;
    }

    normalizeValue(key, value) {
      if (value === undefined || value === null || typeof value === 'function') {
        return null;
      }
      const getStyleValue = value => {
        if (value.constructor === Array) {
          return value.join('');
        }
        return value + '';
      };
      switch (key) {
        case 'class':
          {
            return getClassName(value);
          }
        case 'style':
          {
            if (typeof value === 'object') {
              const keys = Object.keys(value)
                .filter(key => Reactor.SUPPORTED_STYLES.includes(key));
              if (Reactor.debug) {
                const unsupportedKeys = Object.keys(value)
                  .filter(key => !Reactor.SUPPORTED_STYLES.includes(key));
                unsupportedKeys.forEach(key => {
                  console.warn(`Unsupported style property "${key}", on:`, this);
                });
              }
              if (keys.length === 0) {
                return null;
              }
              let style = undefined;
              for (let key of keys) {
                const val = value[key];
                if (val !== undefined && val !== null) {
                  if (typeof val !== 'function') {
                    style = style || {};
                    style[key] = this.normalizeValue(key, val);
                  } else if (Reactor.debug) {
                    console.warn('Invalid value:', val, ` for "${key}", on:`, this);
                  }
                }
              }
              return style;
            }
          }
        case 'filter':
          {
            const filters = Object.keys(value)
              .filter(key => Reactor.SUPPORTED_FILTERS.includes(key));
            if (Reactor.debug) {
              const unsupportedFilters = Object.keys(value)
                .filter(key => !Reactor.SUPPORTED_FILTERS.includes(key));
              unsupportedFilters.forEach(key => {
                console.warn(`Unsupported filter "${key}", on:`, this);
              });
            }
            if (filters.length === 0) {
              return null;
            }
            const result = {};
            for (let filter of filters) {
              const val = value[filter];
              if (val !== undefined && val !== null) {
                result[filter] = getStyleValue(val);
              }
            }
            return Object.entries(result)
              .map(([name, value]) => `${name}(${value})`).join(' ');
          }
        case 'transform':
          {
            const transforms = Object.keys(value)
              .filter(key => Reactor.SUPPORTED_TRANSFORMS.includes(key));
            if (Reactor.debug) {
              const unsupportedTransforms = Object.keys(value)
                .filter(key => !Reactor.SUPPORTED_TRANSFORMS.includes(key));
              unsupportedTransforms.forEach(key => {
                console.warn(`Unsupported transform "${key}", on:`, this);
              });
            }
            if (transforms.length === 0) {
              return null;
            }
            const result = {};
            for (let transform of transforms) {
              const val = value[transform];
              if (val !== undefined && val !== null) {
                result[transform] = getStyleValue(val);
              }
            }
            return Object.entries(result)
              .map(([name, value]) => `${name}(${value})`).join(' ');
          }
        default:
          return getStyleValue(value);
      }
    }

    addAttributes(props = {}) {
      const attributes = Object.keys(props)
        .filter(key => Reactor.SUPPORTED_ATTRIBUTES.includes(key))
        .reduce((result, key) => {
          const attr = key.replace(/(?:^|\.?)([A-Z])/g,
            (x, y) => ('-' + y.toLowerCase()));
          const value = this.normalizeValue(key, props[key]);
          if (value) {
            result[attr] = value;
          }
          return result;
        }, {});
      if (Object.keys(attributes).length > 0) {
        this.attrs = attributes;
      }
    }

    addListeners(props = {}) {
      const eventListeners = Object.keys(props)
        .filter(key => Reactor.SUPPORTED_EVENTS.includes(key))
        .reduce((result, key) => {
          const event = key.toLowerCase().slice(2);
          const listener = props[key];
          if (typeof listener === 'function') {
            result[event] = listener;
          }
          return result;
        }, {});
      if (Object.keys(eventListeners).length > 0) {
        this.listeners = eventListeners;
      }
    }

    isComponent() {
      return false;
    }

    isElement() {
      return true;
    }

    isCustomElement() {
      return false;
    }

    get nodeType() {
      return 'element';
    }

  };

  module.exports = VirtualNode;
}
