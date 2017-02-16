{
  let reducer;
  let service;

  const Bubble = require.def('demo/bubbles/components/bubble');

  const BubblesApp = class extends Reactor.Component {

    static async init() {
      reducer = await require('demo/bubbles/bubbles-reducer');
      service = await require('demo/bubbles/bubbles-service');
    }

    getInitialState() {
      return {
        bubbles: service.getState()
      };
    }

    getReducers() {
      return [reducer];
    }

    render() {
      return [
        'bubbles', {
          onClick: () =>  {
            this.dispatch(reducer.commands.move(service.getState()))
          }
        },
        ...this.props.bubbles.map(props => [ Bubble, props ])
      ];
    }
  };

  module.exports = BubblesApp;
}
