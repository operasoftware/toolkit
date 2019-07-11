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

  class Dispatcher {

    constructor(root) {
      const state = root.state;
      const commands = state.reducer.commands;

      this.names = Object.keys(commands);
      this.queue = [];

      this.execute = command => {
        const prevState = state.current;
        const nextState = state.reducer(prevState, command);
        opr.Toolkit.Renderer.update(root, prevState, nextState, command);
      };

      this.queueIncoming = () => {
        this.mode = Mode.QUEUE;
      }

      this.executeIncoming = () => {
        this.mode = Mode.EXECUTE;
      };

      this.ignoreIncoming = () => {
        this.mode = Mode.IGNORE;
      };

      this.mode = Mode.EXECUTE;
      let level = 0;
      for (const name of this.names) {
        this[name] = async (...args) => {
          if (this.mode === Mode.IGNORE) {
            level = 0;
            return false;
          }
          if (this.mode === Mode.QUEUE) {
            let done;
            const donePromise = new Promise(resolve => {
              done = resolve;
            });
            this.queue.push({
              name,
              args,
              done,
            });
            return donePromise;
          }
          const command = commands[name](...args);
          this.execute(command);
          if (this.queue.length) {
            level = level + 1;
            if (level >= 3) {
              throw new Error(
                  'Too many cycles updating state in lifecycle methods!');
            }
            const calls = [...this.queue];
            setTimeout(() => {
              for (const {name, args, done} of calls) {
                this[name](...args);
                done();
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

    destroy() {
      this.execute = opr.Toolkit.noop;
    }
  }

  module.exports = Dispatcher;
}
