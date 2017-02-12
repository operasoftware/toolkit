{
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
      if (value === undefined || value === null) {
        return null;
      }
      if (key === 'style') {
        if (typeof value === 'object') {
          const keys = Object.keys(value)
            .filter(key => Reactor.SUPPORTED_STYLES.includes(key));
          if (keys.length === 0) {
            return null;
          }
          const style = {};
          for (let key of keys) {
            const val = value[key];
            if (val !== undefined && val !== null) {
              style[key] = val;
            }
          }
          return style;
        }
      }
      return value + '';
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
          result[event] = props[key];
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

  };



  module.exports = VirtualNode;
}

