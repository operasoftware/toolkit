{

  const ComponentTree = class {

    static createInstance(def) {
      const ComponentClass = require.preloaded(def);
      return new ComponentClass();
    }

    static createFromTemplate(template) {
      const description = Reactor.VirtualDOM.spread(template);
      if (description.component) {
        return this.create(
          description.component, description.props, description.children);
      }
      return this.createElement(description);
    }

    static createElement(description) {
      const node = Reactor.VirtualNode.create(description);
      if (description.children) {
        node.children = description.children.map(
          child => this.createFromTemplate(child));
      }
      return node;
    }

    static create(def, props = {}, children = []) {

      try {
        const instance = this.createInstance(def);
        instance.props = props;
        const template = instance.render.call({
          props,
          children
        });
        if (template) {
          instance.child = this.createFromTemplate(template);
        }
        return instance;
      } catch (e) {
        console.error('Error creating Component Tree:', def);
        throw e;
      }
    }

    static async resolve() {
      // TODO: implement
    }
  };

  module.exports = ComponentTree;
}
