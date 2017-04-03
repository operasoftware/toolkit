{
  const NavigationItem = class extends opr.Toolkit.Component {

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
