{
  const MOVE = Symbol('move');
  const HIGHLIGHT = Symbol('hightlight');

  const reducer = (state, command) => {
    switch (command.type) {
      case MOVE: {
        return Object.assign({}, state, {
          bubbles: state.bubbles.map((bubble, index) => {
            return Object.assign({}, bubble, command.state[index], {
              // radius: bubble.radius
            });
          })
        });
      }
      case HIGHLIGHT: {
        return Object.assign({}, state, {
          bubbles: state.bubbles.map(bubble => {
            return Object.assign({}, bubble, {
              highlighted: bubble.highlighted || bubble.id === command.id
            });
          })
        });
      }
      default:
        return state;
    }
  };

  reducer.commands = {
    move: state => ({
      type: MOVE, state
    }),
    highlight: id => ({
      type: HIGHLIGHT, id
    })
  };

  module.exports = reducer;
}
