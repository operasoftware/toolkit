{
  const Command = {
    HIGHLIGHT_ITEM: 'highlight-item'
  };

  const reducer = (state, command) => {
    switch (command.type) {
      case Command.HIGHLIGHT_ITEM:
        console.log('Highlight item:', command.index);
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
      type: Command.HIGHLIGHT_ITEM,
      index
    })
  };

  module.exports = reducer;
}
