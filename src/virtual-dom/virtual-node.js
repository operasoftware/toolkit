class VirtualNode {

  constructor(name, props) {
    this.name = name;
    this.addAttributes(props);
    this.addListeners(props);
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

  addAttributes(props = {}) {
    const attributes = Object.keys(props)
      .filter(key => SUPPORTED_ATTRIBUTES.includes(key))
      .reduce((result, key) => {
        const attr = key.replace(/(?:^|\.?)([A-Z])/g,
          (x, y) => ('-' + y.toLowerCase()));
        const value = props[key];
        if (value) {
          result[attr] = '' + value;
        }
        return result;
      }, {});
    if (Object.keys(attributes).length > 0) {
      this.attrs = attributes;
    }
  }

  addListeners(props = {}) {
    const eventListeners = Object.keys(props)
      .filter(key => SUPPORTED_EVENTS.includes(key))
      .reduce((result, key) => {
        const event = key.toLowerCase().slice(2);
        result[event] = props[key];
        return result;
      }, {});
    if (Object.keys(eventListeners).length > 0) {
      this.listeners = eventListeners;
    }
  }
}

module.exports = VirtualNode;
