{

  const NavigationPanel = require.defer('demo/components/navigation/panel');

  const DemoApp = class extends Reactor.Component {

    static async init() {
      console.debug('Async init in: ', this.name);
    }

    render() {

      const onClick = event => {
        console.log('document.body.onClick()');
        console.time('update');
        this.dispatch(ActionCreator.addItem('item ' + (this.props.items.length + 1)));
      };

      return [
        'div', [
          NavigationPanel, {
            items: this.props.items,
            onClick
          }
        ]
      ];
    }
  };

  module.exports = DemoApp;

}
