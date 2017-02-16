{
  const Bubble = class extends Reactor.Component {

    render() {
      return [
        'bubble', {
          style: {
            width: `${this.props.radius * 200}%`,
            height: `${this.props.radius * 200}%`,
            left: `${this.props.x * 100}%`,
            top: `${this.props.y * 100}%`
          },
        }
      ];
    }
  };

  module.exports = Bubble;
}
