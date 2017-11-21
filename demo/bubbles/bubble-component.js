{
  const HIGHLIGHT = Symbol('highlight');

  const reducer = (state, command) => {
    switch (command.type) {
      case HIGHLIGHT: {
        return {
          ...state,
          highlighted: true,
        };
      }
      default:
        return state;
    }
  };

  reducer.commands = {
    highlight: () => ({
      type: HIGHLIGHT,
    }),
  };

  class Bubble extends opr.Toolkit.Root {

    static get elementName() {
      return 'bubble-component';
    }

    getReducers() {
      return [reducer];
    }

    static get styles() {
      return ['bubble.css'];
    }

    highlight(event) {
      this.commands.highlight();
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    render() {
      return [
        'bubble',
        {
          id: this.props.id,
          style: {
            filter: {
              saturate: this.props.highlighted ? 2.5 : 1,
            },
          },
          onClick: this.highlight,
        },
      ];
    }
  };

  module.exports = Bubble;
}
