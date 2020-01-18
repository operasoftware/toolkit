/*
Copyright 2017-2020 Opera Software AS

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
  const throttle = (fn, wait = 200, delayFirstEvent = false) => {

    let lastTimestamp = 0;
    let taskId = null;

    let context;
    let params;

    return function throttled(...args) {
      /* eslint-disable no-invalid-this */
      if (!taskId) {
        const timestamp = Date.now();
        const elapsed = timestamp - lastTimestamp;
        const scheduleTask = delay => {
          taskId = setTimeout(() => {
            taskId = null;
            lastTimestamp = Date.now();
            return fn.call(context, ...params);
          }, delay);
        };
        if (elapsed >= wait) {
          lastTimestamp = timestamp;
          if (!delayFirstEvent) {
            return fn.call(this, ...args);
          }
          scheduleTask(wait);
        } else {
          scheduleTask(wait - elapsed);
        }
      }
      context = this;
      params = args;
      /* eslint-enable no-invalid-this */
    };
  };

  const debounce = (fn, wait = 200) => {

    let taskId = null;

    let context;
    let params;

    return function debounced(...args) {
      /* eslint-disable no-invalid-this */
      if (taskId) {
        clearTimeout(taskId);
      }
      taskId = setTimeout(() => {
        taskId = null;
        return fn.call(context, ...params);
      }, wait);

      context = this;
      params = args;
      /* eslint-enable no-invalid-this */
    };
  };

  const addDataPrefix = attr => `data${attr[0].toUpperCase()}${attr.slice(1)}`;

  const createUUID = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  };

  const lowerDash = name =>
      name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const getAttributeName = key => {
    if (key === 'acceptCharset' || key === 'httpEquiv') {
      return lowerDash(key);
    } else if (key.startsWith('aria')) {
      return `aria-${key.slice(4).toLowerCase()}`;
    }
    return key.toLowerCase();
  };

  const getEventName = key =>
      key === 'onDoubleClick' ? 'dblclick' : key.slice(2).toLowerCase();

  const isSpecialProperty =
      prop => ['key', 'class', 'style', 'dataset', 'properties'].includes(prop);

  const isSupportedAttribute = attr => isSpecialProperty(attr) ||
      opr.Toolkit.Browser.isAttributeSupported(attr) ||
      opr.Toolkit.Browser.isEventSupported(attr);

  const postRender = fn => {

    // since Chromium 64 there are some problems with animations not being
    // triggered correctly, this hack solves the problem across all OS-es

    /* eslint-disable prefer-arrow-callback */
    requestAnimationFrame(function() {
      requestAnimationFrame(fn);
    });
    /* eslint-enable prefer-arrow-callback */
  };

  const deepFreeze = obj => {
    if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
      // functions are intentionally not frozen
      return obj;
    }
    Object.freeze(obj);
    for (const property of Object.getOwnPropertyNames(obj)) {
      deepFreeze(obj[property]);
    }
    return obj;
  };

  const Utils = {
    throttle,
    debounce,
    addDataPrefix,
    lowerDash,
    getAttributeName,
    getEventName,
    createUUID,
    isSupportedAttribute,
    isSpecialProperty,
    postRender,
    deepFreeze,
  };

  module.exports = Utils;
}
