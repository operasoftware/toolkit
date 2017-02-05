{
  const ComponentTree = class {

    static createInstance(def) {
      const ComponentClass = require.preloaded(def);
      return new ComponentClass();
    }

    static create(def, props = {}, children) {

      const createChild = template => {
        const description = Reactor.VirtualDOM.spread(template);
        if (description.component) {
          return this.create(
            description.component, description.props, description.children);
        }
        return createElement(description);
      };

      const createElement = description => {
        const node = Reactor.VirtualNode.create(description);
        if (description.children) {
          node.children = description.children.map(createChild);
        }
        return node;
      };

      try {
        const instance = this.createInstance(def);
        instance.props = props;
        const template = instance.render.call({
          props,
          children
        });
        instance.child = createChild(template);
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