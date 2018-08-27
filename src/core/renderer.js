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
     * into the normalized description of the rendered node.
     */
    render(component) {
      const template = component.render.call(component.sandbox);
      opr.Toolkit.assert(
          template !== undefined,
          'Invalid undefined template returned when rendering:', component);
      return opr.Toolkit.Template.describe(template);
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

      const {Diff, Lifecycle, VirtualDOM} = opr.Toolkit;

      if (Diff.deepEqual(prevState, nextState)) {
        return [];
      }

      this.root.state =
          VirtualDOM.normalizeProps(this.root.constructor, nextState);

      const diff = new Diff(this.root);
      const initial = this.root.description === undefined;
      const patches = diff.rootPatches(prevState, nextState, initial);

      if (patches.length) {
        Lifecycle.beforeUpdate(patches);
        for (const patch of patches) {
          patch.apply();
        }
        Lifecycle.afterUpdate(patches);
      }

      return patches;
    }

    destroy() {
      this.root = null;
    }
  }

  module.exports = Renderer;
}
