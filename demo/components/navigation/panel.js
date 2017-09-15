{
  const NavigationItem = loader.symbol('components/navigation/item');

  const NavigationPanel = class extends opr.Toolkit.Component {

    render() {
      return [
        'div',
        [
          'span',
          'Navigation Panel',
        ],
        ...this.props.items.map((item, index) => ([
                                  NavigationItem,
                                  {
                                    index,
                                    onSelected: this.props.onItemSelected,
                                    text: item.label,
                                    highlighted: item.highlighted,
                                  },
                                ]))
      ];
    }
  };

  module.exports = NavigationPanel;
}
