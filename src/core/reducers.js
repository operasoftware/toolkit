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
  const SET_STATE = Symbol('set-state');
  const UPDATE = Symbol('update');

  const coreReducer = (state, command) => {
    if (command.type === SET_STATE) {
      return command.state;
    }
    if (command.type === UPDATE) {
      return {
        ...state,
        ...command.state,
      };
    }
    return state;
  };

  coreReducer.commands = {
    setState: state => ({
      type: SET_STATE,
      state,
    }),
    update: state => ({
      type: UPDATE,
      state,
    }),
  };

  const combineReducers = (...reducers) => {
    const commands = {};
    const reducer = (state, command) => {
      [coreReducer, ...reducers].forEach(reducer => {
        state = reducer(state, command);
      });
      return state;
    };
    [coreReducer, ...reducers].forEach(reducer => {
      const defined = Object.keys(commands);
      const incoming = Object.keys(reducer.commands);

      const overriden = incoming.find(key => defined.includes(key));
      if (overriden) {
        console.error(
            'Reducer:', reducer,
            `conflicts an with exiting one with method: "${overriden}"`);
        throw new Error(`The "${overriden}" command is already defined!`)
      }
      Object.assign(commands, reducer.commands);
    });
    reducer.commands = commands;
    return reducer;
  };

  class Reducers {

    /*
     * Creates a new reducer-based state manager for given root component.
     */
    static create(root) {

      class Reducers extends opr.Toolkit.State {

        constructor(root) {
          super(root);
          this.reducer = combineReducers(...(root.getReducers() || []));
        }

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

        /*
         * Removes references to used objects.
         */
        destroy() {
          super.destroy();
          this.reducer = null;
        }
      }

      return new Reducers(root);
    }
  }

  module.exports = Reducers;
}
