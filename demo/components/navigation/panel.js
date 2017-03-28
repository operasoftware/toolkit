{
  const NavigationItem = loader.symbol('components/navigation/item');

  const NavigationPanel = class extends Reactor.Component {

    render() {
      return [
        'div', [
          'span', {
            style: {
              backgroundColor: 'white',
              color: 'black',
            }
          },'Navigation Panel'
        ], ...this.props.items.map((item, index) => [
          NavigationItem, {
            onClick: () => this.props.onItemClicked(index),
            text: item.label,
            highlighted: item.highlighted
          }
        ])
      ];
    }
  };

  module.exports = NavigationPanel;
}
