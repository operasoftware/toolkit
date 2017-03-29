{
  const Bubble = class extends Reactor.Component {

    onCreated() {
      // console.log('=> New bubble created');
    }

    onUpdated() {
      // console.log('=> Bubble updated');
    }

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
              saturate: this.props.highlighted ? 2.5 : 1,
              opacity: 1,
            },
            transform: {
              rotate: [this.props.rotation , 'deg']
            },
          },
          onClick: this.props.onClick
        }
      ];
    }
  };

  module.exports = Bubble;
}