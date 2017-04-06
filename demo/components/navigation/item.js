{
  const NavigationItem = class extends opr.Toolkit.Component {

    onClick() {
      this.props.onSelected(this.props.index);
    }

    render() {
      return [
        'a', {
          onClick: this.onClick,
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
