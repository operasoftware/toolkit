{
  const VirtualDOM = class {

    static createInstance(def) {
      const ComponentClass = require.preloaded(def);
      return new ComponentClass();
    }

    static create(component) {

      const createFromTemplate = template => {
        const description = Reactor.Template.describe(template);
        if (description.component) {
          const child = this.createInstance(description.component);
          if (description.props) {
            child.props = description.props;
          }
          if (description.children) {
            child.children = description.children;
          }
          return this.create(child);
        }
        return createFromDescription(description);
      };

      const createFromDescription = description => {
        const element = Reactor.ComponentTree.createElementInstance(description);
        if (description.children) {
          element.children = description.children.map(createFromTemplate);
        }
        return element;
      };

      try {
        return createFromTemplate(component.render());
      } catch (e) {
        console.error('Error creating Virtual DOM:', component);
        throw e;
      }
    }

    // static async resolve(component) {

    //   const createFromTemplate = async template => {
    //     const description = Reactor.Template.describe(template);
    //     if (description.component) {
    //       const ComponentClass = await require(description.component);
    //       const child = new ComponentClass();
    //       if (description.props) {
    //         child.props = description.props;
    //       }
    //       if (description.children) {
    //         child.children = description.children;
    //       }
    //       return await this.resolve(child);
    //     }
    //     return await createFromDescription(description);
    //   };

    //   const createFromDescription = async description => {
    //     const element = Reactor.ComponentTree.createElementInstance(description);
    //     if (description.children) {
    //       element.children = [];
    //       for (let template of description.children) {
    //         const child = await createFromTemplate(template);
    //         element.children.push(child);
    //       }
    //     }
    //     return element;
    //   };

    //   try {
    //     return await createFromTemplate(component.render());
    //   } catch (e) {
    //     console.error('Error resolving Virtual DOM:', component);
    //     throw e;
    //   }
    // }
  };

  module.exports = VirtualDOM;
}
