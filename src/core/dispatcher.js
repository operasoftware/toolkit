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
  const Mode = {
    QUEUE: Symbol('queue-commands'),
    EXECUTE: Symbol('execute-commands'),
    IGNORE: Symbol('ignore-commands'),
  };

  const coreAPI = {
    setState(state) {
      return () => state;
    },
    update(overrides) {
      return state => ({
        ...state,
        ...overrides,
      });
    },
  }

  class Command {

    constructor(name, args, method) {
      this.name = name;
      this.args = args;
      this.method = method;
    }

    invoke(state) {
      return this.method(...this.args)(state);
    }
  }

  const createCommandsAPI = (...apis) => {
    let commandsAPI = {};
    for (const api of [coreAPI, ...apis]) {
      const defined = Object.keys(commandsAPI);
      const incoming = Object.keys(api);
      const overriden = incoming.find(key => defined.includes(key));
      if (overriden) {
        throw new Error(`The "${overriden}" command is already defined!`)
      }
      Object.assign(commandsAPI, api);
    }
    return commandsAPI;
  };

  class Dispatcher {

    queueIncoming() {
      this.mode = Mode.QUEUE;
    }

    executeIncoming() {
      this.mode = Mode.EXECUTE;
    }

    ignoreIncoming() {
      this.mode = Mode.IGNORE;
    }

    execute(command, root) {
      const prevState = root.state;
      const nextState = command.invoke(prevState);
      root.state = nextState;
      opr.Toolkit.Renderer.update(root, prevState, nextState, command);
    }

    constructor(root) {

      this.mode = Mode.EXECUTE;
      this.queue = [];
      this.commands = {};

      let createCommand;

      const ComponentClass = root.constructor;
      if (typeof ComponentClass.getCommands === 'function') {

        const customAPI = ComponentClass.getCommands();
        if (!customAPI) {
          throw new Error('No API returned in getCommands() method');
        }
        const customAPIs = Array.isArray(customAPI) ? customAPI : [customAPI];
        const api = createCommandsAPI(...customAPIs);

        this.names = Object.keys(api);
        createCommand = (name, args) => new Command(name, args, api[name]);

      } else {

        const reducers = root.getReducers ? root.getReducers() : [];
        const combinedReducer = opr.Toolkit.Reducers.combine(...reducers);
        const api = combinedReducer.commands;

        this.names = Object.keys(api);
        createCommand = (name, args) => new Command(
            name, args,
            () => state => combinedReducer(state, api[name](...args)));
      }

      this.mode = Mode.EXECUTE;
      let level = 0;

      for (const name of this.names) {
        this.commands[name] = (...args) => {

          const command = createCommand(name, args);

          if (this.mode === Mode.QUEUE) {
            const donePromise = new Promise(resolve => {
              command.done = resolve;
            });
            this.queue.push(command);
            return donePromise;
          }

          if (this.mode === Mode.IGNORE) {
            level = 0;
            return false;
          }

          this.execute(command, root);

          if (this.queue.length) {
            level = level + 1;
            if (level >= 3) {
              throw new Error(
                  'Too many cycles updating state in lifecycle methods!');
            }
            setTimeout(() => {
              for (const command of this.queue) {
                this.execute(command, root);
                command.done();
              }
            });
            this.queue.length = 0;
          } else {
            level = 0;
            return true;
          }
        };
      }
    }
  }

  module.exports = Dispatcher;
}
