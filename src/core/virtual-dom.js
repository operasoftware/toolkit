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
  const VirtualDOM = {

    /*
     * Creates a new Virtual DOM structure from given description.
     */
    createFromDescription(description, parent, context) {
      if (!description) {
        return null;
      }
      switch (description.type) {
        case 'component':
          return this.createComponent(description, parent, context);
        case 'element':
          return new opr.Toolkit.VirtualElement(description, parent, context);
        case 'comment':
          return new opr.Toolkit.Comment(description, parent);
        case 'text':
          return new opr.Toolkit.Text(description, parent);
        default:
          throw new Error(`Unsupported node type: ${description.type}`)
      }
    },

    /*
     * Creates a new component instance from given description.
     */
    createComponent(description, parent, context) {
      const ComponentClass = description.component;
      if (ComponentClass.prototype instanceof opr.Toolkit.WebComponent) {
        return this.createWebComponent(
            description, parent && parent.rootNode, context,
            /*= requireCustomElement */ true);
      }
      const component = new ComponentClass(description, parent, context);
      const nodeDescription = opr.Toolkit.Renderer.render(
          component, description.props, description.childrenAsTemplates);
      component.content =
          this.createFromDescription(nodeDescription, component, context);
      return component;
    },

    /*
     * Creates a new Web Component instance from given description.
     */
    createWebComponent(
        description, parent, context, requireCustomElement = false) {
      try {
        const ComponentClass = description.component;
        if (requireCustomElement && !ComponentClass.elementName) {
          throw new Error(`Root component "${
              ComponentClass
                  .displayName}" does not define custom element name!`);
        }
        return new ComponentClass(description, parent, context);
      } catch (error) {
        console.error('Error rendering root component:', description);
        throw error;
      }
    },
  };

  module.exports = VirtualDOM;
}
