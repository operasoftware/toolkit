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

    constructor(root, settings) {
      this.settings = settings;
      this.root = root;
    }

    static render(component) {

      const template = component.render.call(component.sandbox);

      opr.Toolkit.assert(
          template !== undefined,
          'Invalid undefined template returned when rendering:', component);

      return opr.Toolkit.Template.describe(template);
    }

    updateDOM(command, prevState, nextState) {
      if (this.debug) {
        /* eslint-disable no-console */
        console.time('=> Render time');
        const patches = this.update(prevState, nextState);
        console.log(
            'Command:', command.type,
            `for "${this.root.constructor.displayName}"`);
        if (patches.length) {
          console.log('%cPatches:', 'color: hsl(54, 70%, 45%)', patches);
        } else {
          console.log('%c=> No update', 'color: #07a707');
        }
        console.timeEnd('=> Render time');
        console.log(''.padStart(48, '-'));
        /* eslint-enable no-console */
      } else {
        this.update(prevState, nextState);
      }
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

    get debug() {
      return this.settings.level === 'debug';
    }
  }

  module.exports = Renderer;
}
