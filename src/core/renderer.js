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
  const Renderer = {

    /*
     * Calls the component render method and transforms the returned template
     * into the normalised description of the rendered node.
     */
    render(component, props = {}, children = []) {
      component.sandbox.props = props;
      component.sandbox.children = children;
      const template = component.render.call(component.sandbox);
      if (template) {
        return opr.Toolkit.Template.describe(template);
      }
      const text = component.constructor.displayName;
      return new opr.Toolkit.Description.CommentDescription(text);
    },

    /*
     * Creates a new DOM Element based on the specified description.
     */
    createElement(description) {
      const element = document.createElement(description.name);
      if (description.text) {
        element.textContent = description.text;
      }
      if (description.class) {
        element.className = description.class;
      }
      if (description.style) {
        for (const [prop, value] of Object.entries(description.style)) {
          element.style[prop] = value;
        }
      }
      if (description.listeners) {
        for (const [name, listener] of Object.entries(description.listeners)) {
          const event = opr.Toolkit.utils.getEventName(name);
          element.addEventListener(event, listener);
        }
      }
      if (description.attrs) {
        for (const [attr, value] of Object.entries(description.attrs)) {
          const name = opr.Toolkit.utils.getAttributeName(attr);
          element.setAttribute(name, value);
        }
      }
      if (description.dataset) {
        for (const [attr, value] of Object.entries(description.dataset)) {
          element.dataset[attr] = value;
        }
      }
      if (description.properties) {
        for (const [prop, value] of Object.entries(description.properties)) {
          element[prop] = value;
        }
      }
      if (description.custom) {
        if (description.custom.attrs) {
          const customAttributes = Object.entries(description.custom.attrs);
          for (const [name, value] of customAttributes) {
            element.setAttribute(name, value);
          }
        }
        if (description.custom.listeners) {
          const customListeners = Object.entries(description.custom.listeners);
          for (const [event, listener] of customListeners) {
            element.addEventListener(event, listener);
          }
        }
      }
      return element;
    },

    /*
     * Updates the root component and patches the DOM tree
     * to match the component state.
     */
    update(root, from, to, command) {

      const update = {
        command,
        root,
        state: {
          from,
          to,
        },
      };
      root.state.update(to);

      this.onBeforeUpdate(update, root);

      const diff = new opr.Toolkit.Diff(root, from, to);
      update.patches = diff.apply();

      this.onAfterUpdate(update, root);
    },

    onBeforeUpdate(update, root) {
      root.plugins.notify('before-update', update);
    },

    onAfterUpdate(update, root) {
      root.plugins.notify('after-update', update);
    },
  };

  module.exports = Renderer;
}
