{
  const CREATE = Symbol('create');
  const MOVE = Symbol('move');
  const DESTROY = Symbol('destroy');

  const addBubble = (state, bubble) => (Object.assign({}, state, {
    bubbles: [
      ...state.bubbles, createBubble(bubble, {
        highlighted: false,
      })
    ],
  }));
  const updateBubbles = (state, createBubble) => (Object.assign(
      {}, state, {bubbles: state.bubbles.map(bubble => createBubble(bubble))}));
  const createBubble = (...props) => Object.assign({}, ...props);

  const reducer = (state, command) => {
    switch (command.type) {
      case CREATE:
        return addBubble(state, command.bubble);
      case MOVE:
        return updateBubbles(
            state,
            bubble => createBubble(bubble, command.positions[bubble.id]));
      case DESTROY:
        return {
          ...state,
          bubbles: state.bubbles.filter(bubble => bubble.id !== command.id),
        };
      default:
        return state;
    }
  };

  reducer.commands = {
    create: bubble => ({
      type: CREATE,
      bubble,
    }),
    move: positions => ({
      type: MOVE,
      positions,
    }),
    destroy: id => ({
      type: DESTROY,
      id,
    }),
  };

  module.exports = reducer;
}