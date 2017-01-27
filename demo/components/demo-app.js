{

  const NavigationPanel = require.defer('components/navigation/panel');

  let reducer;
  let settings;
  let extensions;

  const DemoApp = class extends Reactor.App {

    static async init() {
      console.debug('Async init in: ', this);
      reducer = await require('reducers/demo');
      settings = await require('browser/settings');
    }

    async registerReducers() {
      this.reducers.register({ demo: reducer });
    }

    async registerServices() {
      this.services.register({ settings });
    }

    async getInitialState() {
      return {
        settings: await settings.getState(),
        extensions: await extensions.getState()
      };
    }

    render() {
      const onItemClicked = index => {
        this.dispatch(reducer.commands.highlightItem(index));
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
