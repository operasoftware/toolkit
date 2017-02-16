{
  const NavigationPanel = class extends Reactor.Component {

    render() {
      return [
        'div', {
          onClick: this.props.onClick
        }, [
          'span', 'Navigation Panel'
        ], ...this.props.items.map((item, index) => [
          NavigationItem, {
           text: item.label,
           highlighted: item.highlighted
          }
        ])
      ];    
    }
  };

  const NavigationItem = require.def('demo/components/navigation/item');

  module.exports = NavigationPanel;
}
