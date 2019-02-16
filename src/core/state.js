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
  class State {

    constructor(root) {
      this.root = root;
      this.current = null;
    }

    /*
     * By default returns the props passed from the parent.
     */
    getInitialState(props = {}) {
      return props;
    }

    /*
     * By default returns the props passed from the parent,
     * ignoring the current state.
     */
    getUpdatedState(props = {}, state = {}) {
      return props;
    }

    /*
     * Updates the underlying model to the specified value.
     */
    update(state) {
      this.previous = this.current;
      this.current = state;
    }

    /*
     * Clears references to used objects.
     */
    destroy() {
      this.root = null;
      this.current = null;
      this.previous = null;
    }
  }

  module.exports = State;
}
