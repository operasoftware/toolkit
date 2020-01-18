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

  class Reducers {

    static combine(...reducers) {
      const commands = {};
      const reducer = (state, command) => {
        for (const reducer of [coreReducer, ...reducers]) {
          state = reducer(state, command);
        }
        return state;
      };
      for (const reducer of [coreReducer, ...reducers]) {
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
      }
      reducer.commands = commands;
      return reducer;
    }
  }

  module.exports = Reducers;
}
