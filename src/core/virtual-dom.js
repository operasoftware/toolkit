/*
Copyright 2017-2018 Opera Software AS

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
    createFromDescription(description, parentNode) {
      if (!description) {
        return null;
      }
      switch (description.type) {
        case 'component':
          return this.createComponent(description, parentNode);
        case 'element':
          return new opr.Toolkit.VirtualElement(description, parentNode);
        case 'comment':
          return new opr.Toolkit.Comment(description, parentNode);
        case 'text':
          return new opr.Toolkit.Text(description, parentNode);
        default:
          throw new Error(`Unsupported node type: ${description.type}`)
      }
    },

    /*
     * Creates a new component instance from given description.
     */
    createComponent(description, parentNode) {
      const ComponentClass = description.component;
      if (ComponentClass.prototype instanceof opr.Toolkit.Root) {
        return this.createRoot(
            description, parentNode && parentNode.rootNode,
            /*= requireCustomElement */ true);
      }
      const component = new ComponentClass(description, parentNode);
      const nodeDescription = opr.Toolkit.Renderer.render(
          component, description.props, description.childrenAsTemplates);
      component.content =
          this.createFromDescription(nodeDescription, component);
      return component;
    },

    /*
     * Creates a new root instance from given description.
     *
     * If the root class declares a custom element name
     */
    createRoot(description, parentNode, requireCustomElement = false) {
      try {
        const ComponentClass = description.component;
        if (requireCustomElement && !ComponentClass.elementName) {
          throw new Error(
              `Root component "${
                                 ComponentClass.displayName
                               }" does not define custom element name!`);
        }
        return new ComponentClass(description, parentNode);
      } catch (error) {
        console.error('Error rendering root component:', description);
        throw error;
      }
    },
  };

  module.exports = VirtualDOM;
}
