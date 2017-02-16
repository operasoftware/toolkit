{
  let reducer;
  let geometry;

  const Bubble = require.def('demo/components/bubble');

  const BubblesApp = class extends Reactor.Component {

    static async init() {
      reducer = await require('demo/reducers/bubbles-reducer');
      geometry = await require('demo/services/geometry');
    }

    getInitialState() {
      return {
        items: geometry.getState()
      };
    }

    getReducers() {
      return [reducer];
    }

    render() {
      return [
        this.props.bubbles.map(bubble => [
          Bubble, {
            x: bubble.coordinates.x,
            y: bubble.coordinates.y,
            radius: bubble.radius,
            color: bubble.color
          }
        ])
      ];
    }
  };

  module.exports = BubblesApp;
}
