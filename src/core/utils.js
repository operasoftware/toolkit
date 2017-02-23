{
  const INIT = Symbol('init');

  const coreReducer = (state, command) => {
    if (command.type === INIT) {
      return command.state;
    }
    return state;
  };

  coreReducer.commands = {
    init: state => ({
      type: INIT,
      state
    })
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
      // TODO: show warning or error when overriding
      Object.assign(commands, reducer.commands);
    });
    reducer.commands = commands;
    return reducer;
  };

  const addDataPrefix = attr => 'data' + attr[0].toUpperCase() + attr.slice(1);

  const lowerDash = name => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const getEventName = name => name.slice(2).toLowerCase();

  module.exports = {
    combineReducers,
    utils: {
      addDataPrefix,
      lowerDash,
      getEventName,
    }
  };
}