{

  const NavigationPanel = require.defer('components/navigation/panel');

  let reducer;
  let settings;

  const DemoApp = class extends Reactor.Component {

    static async init() {
      reducer = await require('reducers/demo-reducer');
      settings = await require('services/settings');
    }

    getInitialState() {
      return {
        items: settings.getState()
      };
    }

    getReducer() {
      // TODO: combine reducers
      return reducer;
    }

    render() {
      const onItemClicked = index => {
        console.log('onItemClicked');
        this.dispatch(reducer.commands.highlightItem(index));
      };
      return [
        'div', [
          NavigationPanel, { items: this.props.items, onItemClicked }
        ]
      ];
    }
  };

  module.exports = DemoApp;

}
