{
  const VirtualNode = class {

    constructor(name, props = {}) {
      this.name = name;
      if (props.key) {
        this.key = props.key;
      }
      this.attrs = {};
      this.addAttributes(props);
      this.dataset = {};
      this.addDataAttributes(props.dataset);
      this.listeners = {};
      this.addListeners(props);
    }

    addAttributes(props = {}) {
      Object.keys(props)
        .filter(key => Reactor.SUPPORTED_ATTRIBUTES.includes(key))
        .forEach(key => {
          this.setAttribute(key, props[key]);
        });
    }

    setAttribute(key, value) {
      if (Reactor.SUPPORTED_ATTRIBUTES.includes(key)) {
        value = this.normalizeValue(key, value);
        if (value) {
          this.attrs[key] = value;
        }
      } else if (Reactor.debug) {
        console.warn(`Unsupported attribute name "${key}" on:`, this);
      }
    }

    addDataAttributes(dataset = {}) {
      Object.keys(dataset)
        .forEach(key => {
          this.setDataAttribute(key, dataset[key]);
        });
    }

    setDataAttribute(key, value) {
      this.dataset[key] = this.getStyleValue(value);
    }

    addListeners(props = {}) {
      Object.keys(props)
        .filter(key => Reactor.SUPPORTED_EVENTS.includes(key))
        .forEach(key => {
          this.addListener(key, props[key]);
        });
    }

    addListener(key, listener) {
      if (Reactor.SUPPORTED_EVENTS.includes(key)) {
        const name = Reactor.utils.getEventName(key);
        if (typeof listener === 'function') {
          this.listeners[name] = listener;
        }
      } else if (Reactor.debug) {
        console.warn(`Unsupported listener name "${key}" on:`, this);
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

    getStyleValue(value) {
      if (value.constructor === Array) {
        return value.join('');
      }
      return value + '';
    };

    normalizeValue(key, value) {
      if (value === undefined || value === null || typeof value === 'function') {
        return null;
      }
      switch (key) {
        case 'class':
          {
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
              return null;
            };
            return getClassNamesString(value).split(' ');
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
        // TODO: get rid of redundance
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
                result[filter] = this.getStyleValue(val);
              }
            }
            return Object.entries(result)
              .map(([name, value]) => `${name}(${value})`).join(' ');
          }
        // TODO: get rid of redundance
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
                result[transform] = this.getStyleValue(val);
              }
            }
            return Object.entries(result)
              .map(([name, value]) => `${name}(${value})`).join(' ');
          }
        default:
          return this.getStyleValue(value);
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