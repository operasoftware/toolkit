{
  const NavigationItem = class extends opr.Toolkit.Component {

    onClick() {
      this.props.onSelected(this.props.index);
    }

    contextMenuProvider() {
      return this.ref.textContent;
    }

    render() {
      return [
        'a',
        {
          onClick: this.onClick,
          style: {
            backgroundColor: this.props.highlighted ? 'red' : null,
          },
          metadata: {
            contextMenu: {
              provider: this.contextMenuProvider,
            },
          },
        },
        this.props.text,
      ];
    }
  };

  module.exports = NavigationItem;
}
