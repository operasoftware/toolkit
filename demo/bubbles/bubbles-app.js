{
  let reducer;
  let service;

  const Bubble = loader.symbol('bubbles/bubble-component');

  const BubblesApp = class extends Reactor.Root {

    static async init() {
      reducer = await loader.require('bubbles/bubbles-reducer');
      service = await loader.require('bubbles/bubbles-service');
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

    render() {
      return [
        'bubbles', {
          onClick: event => {
            //this.dispatch(
            //  reducer.commands.move(service.moveBubbles(this.props.bubbles)))
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
              this.dispatch(reducer.commands.highlight(bubble.id));
              event.stopPropagation();
            }
          })
        ])
      ];
    }
  };

  module.exports = BubblesApp;
}
