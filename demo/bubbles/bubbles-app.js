{
  let reducer;
  let service;

  const Bubble = loader.symbol('bubbles/bubble-component');

  class BubblesApp extends opr.Toolkit.Root {

    static async init() {
      reducer = await loader.require('bubbles/bubbles-reducer');
      service = await loader.require('bubbles/bubbles-service');
    }

    // static get elementName() {
    //  return 'bubbles-demo';
    // }

    static get styles() {
      return [
        'bubbles.css',
      ];
    }

    getReducers() {
      return [reducer];
    }

    async getInitialState() {
      const count = 1;
      return {
        bubbles: service.createBubbles(count),
        config: {count},
      };
    }

    render() {
      return [
        'bubbles',
        {
          onClick: event => {
            // TODO: use a single dispatch
            this.dispatch(
                reducer.commands.move(service.moveBubbles(this.props.bubbles)));
            const id =
                Math.max(...this.props.bubbles.map(bubble => bubble.id)) + 1;
            const x = event.offsetX / event.target.offsetWidth;
            const y = event.offsetY / event.target.offsetHeight;
            this.dispatch(
                reducer.commands.create(service.createBubble(id, x, y)));
          },
        },
        ...this.props.bubbles.map(
            bubble => [
                // clang-format off
                  Bubble, {
                    ...bubble,
                    onClick: event => {
                      this.dispatch(reducer.commands.highlight(bubble.id));
                      event.stopPropagation();
                    },
                  }
                ]
            // clang-format on
            ),
      ];
    }
  };

  module.exports = BubblesApp;
}
