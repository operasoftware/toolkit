{
  const MOVE = Symbol('move');
  const HIGHLIGHT = Symbol('hightlight');

  const updateBubbles = (state, createBubble) => (Object.assign({}, {
    bubbles: state.bubbles.map(bubble => createBubble(bubble))
  }));
  const createBubble = (...props) => Object.assign({}, ...props);

  const reducer = (state, command) => {
    switch (command.type) {
      case MOVE:
        {
          return updateBubbles(state,
            bubble => createBubble(bubble, command.positions[bubble.id]))
        }
      case HIGHLIGHT:
        {
          return updateBubbles(state, bubble => createBubble(bubble, {
            highlighted: bubble.highlighted || bubble.id === command.id,
          }));
        }
      default:
        return state;
    }
  };

  reducer.commands = {
    move: positions => ({
      type: MOVE,
      positions
    }),
    highlight: id => ({
      type: HIGHLIGHT,
      id
    })
  };

  module.exports = reducer;
}