{
  const Bubble = class extends opr.Toolkit.Component {

    render() {
      return [
        'bubble', {
          id: this.props.id,
          style: {
            width: [this.props.radius * 200, '%'],
            height: [this.props.radius * 200, '%'],
            left: [this.props.x * 100, '%'],
            top: [this.props.y * 100, '%'],
            filter: {
              saturate: this.props.highlighted ? 2.5 : 1
            },
            transform: {
              rotate: [Math.random() * 15, 'deg']
            },
          },
          onClick: this.props.onClick
        }
      ];
    }
  };

  module.exports = Bubble;
}