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
  class Service {

    static validate(listeners) {
      if (opr.Toolkit.isDebug()) {
        // clang-format off
        /* eslint-disable max-len */
        const keys = Object.keys(listeners);
        opr.Toolkit.assert(
            this.events instanceof Array,
            `Service "${this.name}" does not provide information about valid events, implement "static get events() { return ['foo', 'bar']; }"`);
        opr.Toolkit.assert(
            this.events.length > 0,
            `Service "${this.name}" returned an empty list of valid events, the list returned from "static get event()" must contain at least one event name`);
        const unsupportedKeys =
            Object.keys(listeners).filter(key => !this.events.includes(key));
        for (const unsupportedKey of unsupportedKeys) {
          opr.Toolkit.warn(
              `Unsupported listener specified "${unsupportedKey}" when connecting to ${this.name}`);
        }
        const supportedKeys = this.events.filter(event => keys.includes(event));
        opr.Toolkit.assert(
            supportedKeys.length > 0,
            `No valid listener specified when connecting to ${this.name}, use one of [${this.events.join(', ')}]`);
        for (const supportedKey of supportedKeys) {
          opr.Toolkit.assert(
              listeners[supportedKey] instanceof Function,
              `Specified listener "${supportedKey}" for ${this.name} is not a function`);
        }
        /* eslint-enable max-len */
        // clang-format on
      }
      return this.events.filter(event => listeners[event] instanceof Function);
    }
  }

  module.exports = Service;
}
