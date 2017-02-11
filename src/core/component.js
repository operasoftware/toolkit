{
  const Component = class {

    static async init() {
      const VirtualNode = await require('core/virtual-node');
      Component.prototype = Object.create(VirtualNode.prototype);
      Component.prototype.constructor = VirtualNode;
    }

    isComponent() {
      return true;
    }

    isElement() {
      return false;
    }

    isCustomElement() {
      return false;
    }

  };

  module.exports = Component;
}
