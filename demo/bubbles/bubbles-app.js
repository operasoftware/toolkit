{
  let reducer;
  let service;

  const Bubble = require.def('demo/bubbles/bubble-component');

  const BubblesApp = class extends Reactor.Component {

    static async init() {
      reducer = await require('demo/bubbles/bubbles-reducer');
      service = await require('demo/bubbles/bubbles-service');
    }

    getInitialState() {
      const count = 16;
      return {
        bubbles: service.getState(count),
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
          onClick: () => {
            this.dispatch(
              reducer.commands.move(service.getState(this.props.config.count)))
          }
        },
        ...this.props.bubbles.map(bubble => [
          Bubble, Object.assign({}, bubble, {
            onClick: () => this.dispatch(
              reducer.commands.highlight(bubble.id))
          })
        ])
      ];
    }
  };

  module.exports = BubblesApp;
}