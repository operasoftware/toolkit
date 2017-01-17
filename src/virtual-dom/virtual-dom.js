const SUPPORTED_EVENTS = [ 'onClick' ];

class VirtualDOM {

  static async resolve(component) {

    const template = await component.render();
    const node = this.createNode(template);

    const { children } = this.extractDefinition(...template);
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
    } = this.extractDefinition(...template);
    
    const node = new VirtualNode(name);
    this.addListeners(node, props);
    if (text) {
      node.text = text;
    }
    return node;
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
        const [ name ] = childTemplate;
        if (typeof name === 'symbol') {
          // TODO: amend instantiation
          const child = await Reactor.instantiate(name);
          const { props } = this.extractDefinition(...childTemplate);
          child.props = props;
          const childNode = await this.resolve(child);
          node.addChild(childNode);
        } else if (typeof name === 'string') {
          const childNode = this.createNode(childTemplate);
          node.addChild(childNode);

          const grandchildren = this.extractDefinition(...childTemplate).children;
          this.addChildren(childNode, grandchildren);
        }
      }
    }
  }

  static extractDefinition(name, ...params) {
    switch (params.length) {
      case 0:
        return { name };
      case 1:
        if (typeof params[0] === 'string') {
          const text = params[0];
          return { name, text };
        } else if (Array.isArray(params[0])) {
          const children = params;
          return { name, children };
        } else if (typeof params[0] === 'object' && params[0]) {
          const props = params[0];
          return { name, props };
        } else {
          throw `Invalid content type: ${params[0]}`;
        }
      default:
        const props = params[0];
        if (typeof props === 'object') {
          const content = params[1];
          if (typeof params[1] === 'string') {
            const text = params[1];
            return { name, props, text };
          } else if (Array.isArray(params[1])) {
            const children = params;
            return { name, props, children };        
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
