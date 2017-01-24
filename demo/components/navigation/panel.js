{

  const NavigationItem = require.defer('components/navigation/item');

  const NavigationPanel = class extends Reactor.Component {

    static async init() {
      // console.debug('Async init in:', this);
    }

    render() {
      return [
        'div', [
          'span', 'Navigation Panel'
        ], ...this.props.items.map(item => [
          NavigationItem, { text: item }
        ])
      ];    
    }
  };

  module.exports = NavigationPanel;

}
