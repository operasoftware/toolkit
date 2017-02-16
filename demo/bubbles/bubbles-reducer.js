{
  const MOVE = Symbol('move');

  const reducer = (state, command) => {
    switch (command.type) {
      case MOVE:
        const nextState = Object.assign({}, state, {
          bubbles: state.bubbles.map((bubble, index) => {
            return Object.assign({}, command.state[index]);
          })
        });
        return nextState;
      default:
        return state;
    }
  };

  reducer.commands = {
    move: state => ({
      type: MOVE, state
    })
  };

  module.exports = reducer;
}
