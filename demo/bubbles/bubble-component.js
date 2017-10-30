{
  class Bubble extends opr.Toolkit.Component {

    highlight(event) {
      this.commands.highlight(this.props.id);
      event.stopImmediatePropagation();
      event.preventDefault();
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
            filter: {saturate: this.props.highlighted ? 2.5 : 1},
          },
          onClick: this.highlight,
        }
      ];
    }
  };

  module.exports = Bubble;
}
