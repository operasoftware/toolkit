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
  class Renderer {

    constructor(root) {
      this.root = root;
    }

    /*
     * Calls the component render method and transforms the returned template
     * into the normalised description of the rendered node.
     */
    static render(component, props = {}, children = []) {
      Object.assign(component.sandbox, {
        props,
        children,
      });
      const template = component.render.call(component.sandbox);
      return opr.Toolkit.Template.describe(template);
    }

    /*
     * Creates a new DOM Element based on the specified description.
     */
    static createElement(description) {
      const element = document.createElement(description.name);
      if (description.text) {
        element.textContent = description.text;
      }
      if (description.listeners) {
        Object.entries(description.listeners).forEach(([name, listener]) => {
          const event = opr.Toolkit.utils.getEventName(name);
          element.addEventListener(event, listener);
        });
      }
      if (description.attrs) {
        Object.entries(description.attrs).forEach(([attr, value]) => {
          const name = opr.Toolkit.utils.getAttributeName(attr);
          element.setAttribute(name, value);
        });
      }
      if (description.dataset) {
        Object.entries(description.dataset).forEach(([attr, value]) => {
          element.dataset[attr] = value;
        });
      }
      if (description.class) {
        element.className = description.class;
      }
      if (description.style) {
        Object.entries(description.style).forEach(([prop, value]) => {
          element.style[prop] = value;
        });
      }
      if (description.properties) {
        Object.entries(description.properties).forEach(([prop, value]) => {
          element[prop] = value;
        });
      }
      return element;
    }

    updateDOM(command, prevState, nextState) {
      const update = {
        command,
        root: this.root,
        state: {
          from: prevState,
          to: nextState,
        },
      };
      this.onBeforeUpdate(update);
      const patches = this.update(prevState, nextState);
      this.onUpdate({
        ...update,
        patches,
      });
    }

    onBeforeUpdate(update) {
      this.root.plugins.notify('before-update', update);
    }

    onUpdate(update) {
      this.root.plugins.notify('update', update);
    }

    update(prevState, nextState) {
      const diff = new opr.Toolkit.Diff(this.root);
      diff.rootPatches(prevState, nextState);
      diff.apply();
      return diff.patches;
    }

    destroy() {
      this.root = null;
    }
  }

  module.exports = Renderer;
}
