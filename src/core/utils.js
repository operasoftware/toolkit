{
  const INIT = Symbol('init');
  const SET_STATE = Symbol('set-state');
  const UPDATE = Symbol('update');

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
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
    init: state => ({
      type: INIT,
      state,
    }),
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

  const createCommandsDispatcher = (reducer, dispatch) => {
    const dispatcher = {};
    for (const key of Object.keys(reducer.commands)) {
      dispatcher[key] = (...args) => {
        dispatch(reducer.commands[key](...args));
      };
    }
    return dispatcher;
  };

  const throttle = (fn, wait = 200, delayFirstEvent = false) => {

    let lastTimestamp = 0;
    let taskId = null;

    let context;
    let params;

    return function throttled(...args) {
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
    };
  };

  const debounce = (fn, wait = 200) => {

    let taskId = null;

    let context;
    let params;

    return function debounced(...args) {
      if (taskId) {
        clearTimeout(taskId);
      }
      taskId = setTimeout(() => {
        taskId = null;
        return fn.call(context, ...params);
      }, wait);

      context = this;
      params = args;
    };
  };

  const addDataPrefix = attr => 'data' + attr[0].toUpperCase() + attr.slice(1);

  const lowerDash = name => {
    if (name.startsWith('aria')) {
      return `aria-${name.slice(4).toLowerCase()}`;
    }
    return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  const getAttributeName = name => {
    switch (name) {
      case 'accessKey':
      case 'allowFullScreen':
      case 'allowTransparency':
      case 'autoComplete':
      case 'autoFocus':
      case 'autoPlay':
      case 'cellPadding':
      case 'cellSpacing':
      case 'charSet':
      case 'classID':
      case 'colSpan':
      case 'contentEditable':
      case 'contextMenu':
      case 'crossOrigin':
      case 'dateTime':
      case 'encType':
      case 'frameBorder':
      case 'hrefLang':
      case 'inputMode':
      case 'keyType':
      case 'marginHeight':
      case 'marginWidth':
      case 'maxLength':
      case 'minLength':
      case 'noValidate':
      case 'radioGroup':
      case 'readOnly':
      case 'rowSpan':
      case 'spellCheck':
      case 'srcDoc':
      case 'srcLang':
      case 'srcSet':
      case 'useMap':
      case 'tabIndex':
        return name.toLowerCase();
      default:
        return lowerDash(name);
    }
  };

  const getEventName = name => {
    switch (name) {
      case 'onDoubleClick':
        return 'dblclick';
      default:
        return name.slice(2).toLowerCase();
    }
  };

  const createUUID = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() +
        s4() + s4();
  };

  const isSpecialProperty =
      prop => ['key', 'class', 'style', 'dataset', 'metadata'].includes(prop);

  const isSupportedAttribute = attr => isSpecialProperty(attr) ||
      opr.Toolkit.SUPPORTED_ATTRIBUTES.includes(attr) ||
      opr.Toolkit.SUPPORTED_EVENTS.includes(attr);

  const postRender = fn => {
    // since Chromium 64 there are some problems with animations not being
    // triggered correctly, this hack solves the problem across all OS-es
    requestAnimationFrame(function() {
      requestAnimationFrame(fn);
    });
  };

  const Utils = {
    throttle,
    debounce,
    combineReducers,
    createCommandsDispatcher,
    addDataPrefix,
    lowerDash,
    getAttributeName,
    getEventName,
    createUUID,
    isSupportedAttribute,
    isSpecialProperty,
    postRender,
  };

  module.exports = Utils;
}
