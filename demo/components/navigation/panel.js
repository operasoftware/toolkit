{

  const NavigationItem = require.defer('demo/components/navigation/item');

  const NavigationPanel = class extends Reactor.Component {

    static async init() {
      console.debug('Async init in:', this.name);
    }

    render() {
      return [
        'div', {
          onClick: () => this.props.onClick(),
        }, [
          'span', 'Navigation Panel'
        ], ...this.props.items.map(item => [
          NavigationItem, { text: item }
        ])
      ];    
    }
  };

  module.exports = NavigationPanel;

}
