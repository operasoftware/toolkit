{

  const NavigationPanel = require.defer('demo/components/navigation/panel');

  const DemoApp = class extends Reactor.Component {

    static async init() {
      // console.debug('Async init in: ', this);
    }

    render() {
      return [
        'div', [
          NavigationPanel, { items: this.props.items }
        ]
      ];
    }
  };

  module.exports = DemoApp;

}
