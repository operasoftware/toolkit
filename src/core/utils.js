{
  const INIT = Symbol('init');

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
    return state;
  };

  coreReducer.commands = {init: state => ({type: INIT, state})};

  const combineReducers = (...reducers) => {
    const commands = {};
    const reducer = (state, command) => {
      [coreReducer, ...reducers].forEach(reducer => {
        state = reducer(state, command);
      });
      return state;
    };
    [coreReducer, ...reducers].forEach(reducer => {
      // TODO: show warning or error when overriding
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

  const throttle = (fn, wait = 200) => {

    let lastTimestamp = 0;
    let taskId = null;

    let context;
    let params;

    return function throttled(...args) {
      if (!taskId) {
        const timestamp = Date.now();
        const elapsed = timestamp - lastTimestamp;
        if (elapsed >= wait) {
          lastTimestamp = timestamp;
          return fn.call(this, ...args);
        }
        taskId = setTimeout(() => {
          taskId = null;
          lastTimestamp = Date.now();
          return fn.call(context, ...params);
        }, wait - elapsed);
      }
      context = this;
      params = args;
    };
  };

  const addDataPrefix = attr => 'data' + attr[0].toUpperCase() + attr.slice(1);

  const lowerDash = name =>
      name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

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
      case 'formAction':
      case 'formEncType':
      case 'formMethod':
      case 'formNoValidate':
      case 'formTarget':
      case 'htmlFor':
        return name.slice(4).toLowerCase();
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

  const isSupportedAttribute = attr =>
      opr.Toolkit.SUPPORTED_ATTRIBUTES.includes(attr) ||
      opr.Toolkit.SUPPORTED_EVENTS.includes(attr) ||
      ['key', 'class', 'style', 'dataset', 'metadata'].includes(attr);

  const Utils = {
    throttle,
    combineReducers,
    createCommandsDispatcher,
    addDataPrefix,
    lowerDash,
    getAttributeName,
    getEventName,
    createUUID,
    isSupportedAttribute,
  };

  module.exports = Utils;
}
