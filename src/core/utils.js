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

  const create = component => new Reactor.App(component);

  const construct = def => {
    const ComponentClass = require.preloaded(def);
    const component = new ComponentClass();
    return component;
  };

  const instantiate = async def => {
    const ComponentClass = await require(def);
    const component = new ComponentClass();
    return component;
  };

  module.exports = {
    combineReducers,
    create,
    construct,
    instantiate
  };
}
