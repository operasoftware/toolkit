{
  const NavigationItem = class extends Reactor.Component {

    render() {
      return [
        'a', {
          onClick: this.props.onClick,
          style: {
            backgroundColor: this.props.highlighted ? 'red' : null
          }
        },
        this.props.text
      ];
    }
  };

  module.exports = NavigationItem;
}
