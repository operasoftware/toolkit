{
  let reducer;
  let service;

  const Bubble = require.def('demo/bubbles/bubble-component');

  const BubblesApp = class extends Reactor.Root {

    static async init() {
      reducer = await require('demo/bubbles/bubbles-reducer');
      service = await require('demo/bubbles/bubbles-service');
    }

    getInitialState() {
      const count = 1;
      return {
        bubbles: service.createBubbles(count),
        config: {
          count
        }
      };
    }

    getReducers() {
      return [reducer];
    }

    onBubbleClicked(bubble) {
      this.dispatch(reducer.commands.highlight(bubble.id));
    }

    render() {
      return [
        'bubbles', {
          onClick: event => {
            // TODO: use a single dispatch
            this.dispatch(
              reducer.commands.move(service.moveBubbles(this.props.bubbles)))
            const id = Math.max(...this.props.bubbles.map(bubble => bubble.id)) + 1;
            const x = event.offsetX / event.target.offsetWidth;
            const y = event.offsetY / event.target.offsetHeight;
            this.dispatch(
              reducer.commands.create(service.createBubble(id, x, y)));
          }
        },
        ...this.props.bubbles.map(bubble => [
          Bubble, Object.assign({}, bubble, {
            onClick: event => {
              this.onBubbleClicked(bubble);
              event.stopPropagation();
            }
          })
        ])
      ];
    }
  };

  module.exports = BubblesApp;
}