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
  class Reducers {

    /*
     * Creates a new reducer-based state manager for given root component.
     */
    static create(root) {

      class Reducers extends opr.Toolkit.State {

        /*
         * By default returns a new object derived from the current state.
         */
        async getInitialState(props) {
          return {
            ...props,
          };
        }

        /*
         * By default returns a new object derived from the current state
         * and overriden by updated props passed from the parent.
         */
        getUpdatedState(props = {}, state = {}) {
          return {
            ...state,
            ...props,
          };
        }
      }

      return new Reducers(root);
    }
  }

  module.exports = Reducers;
}
