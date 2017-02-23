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

  // TODO: clean up here
  const lowerCamelCase = key => key.replace(/(?:^|\.?)([A-Z])/g,
    (x, y) => ('-' + y.toLowerCase()));
  const lowerDash = key => key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const getDataAttributeName = attr => 'data' + attr[0].toUpperCase() + attr.slice(1);

  const getEventName = key => key.slice(2).toLowerCase();

  const create = component => new Reactor.App(component);

  module.exports = {
    combineReducers,
    create,
    utils: {
      lowerCamelCase,
      lowerDash,
      getEventName,
    }
  };
}