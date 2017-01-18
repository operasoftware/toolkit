{

  const NavigationPanel = require.defer('demo/components/navigation/panel');

  const DemoApp = class extends Reactor.Component {

    async init() {
      console.debug('Async init in: ', this);
      // WindowEvents = await require('utils/window-events');
      this.props = {
        items: ['bookmarks', 'news', 'extensions', 'tabs', 'settings']
      };
    }

    render() {

      document.body.onclick = event => {
        console.log('document.body.onClick()');
        this.dispatch(ActionCreator.addItem('item ' + (this.props.items.length + 1)));
        console.time('update');
      };

      return [
        'div', [
          NavigationPanel, { items: this.props.items }
        ]
      ];
    }
  };

  module.exports = DemoApp;

}
