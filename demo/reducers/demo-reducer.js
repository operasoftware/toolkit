{
  const HIGHLIGHT_ITEM = Symbol('highlight-item');

  const reducer = (state, command) => {
    switch (command.type) {
      case HIGHLIGHT_ITEM:
        console.log('Highlight item at index:', command.index);
        const nextState = Object.assign({}, state, {
          items: state.items.map((item, index) => {
            return {
              label: item.label,
              highlighted: command.index === index
            };
          })
        });
        return nextState;
      default:
        return state;
    }
  };

  reducer.commands = {
    highlightItem: index => ({
      type: HIGHLIGHT_ITEM,
      index
    })
  };

  module.exports = reducer;
}
