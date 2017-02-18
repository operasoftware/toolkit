{
  const Bubble = class extends Reactor.Component {

    render() {
      return [
        'bubble', {
          id: this.props.id,
          style: {
            transform: `rotate(#{Math.random() * 360}deg)`,
            width: `${this.props.radius * 200}%`,
            height: `${this.props.radius * 200}%`,
            left: `${this.props.x * 100}%`,
            top: `${this.props.y * 100}%`,
            filter: `saturate(${this.props.highlighted ? 2 : 1})`
          },
          onClick: () => this.props.onClick(this.props.id)
        }
      ];
    }
  };

  module.exports = Bubble;
}
