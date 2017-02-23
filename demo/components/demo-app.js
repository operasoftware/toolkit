{
  let reducer;
  let settings;

  const DemoApp = class extends Reactor.Root {

    static async init() {
      reducer = await require('demo/reducers/demo-reducer');
      settings = await require('demo/services/settings');
    }

    getInitialState() {
      return {
        items: settings.getState()
      };
    }

    getReducers() {
      return [reducer];
    }

    render() {
      const onItemClicked = index => {
        this.dispatch(reducer.commands.highlightItem(index));
      };
      return [
        'div', {
          class: 'navigation'
        }, [
          NavigationPanel, {
            items: this.props.items,
            onItemClicked
          }
        ]
      ];
    }
  };

  const NavigationPanel = require.def('demo/components/navigation/panel');

  module.exports = DemoApp;
}
