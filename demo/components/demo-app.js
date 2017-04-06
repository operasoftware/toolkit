{
  let reducer;
  let settings;

  const DemoApp = class extends opr.Toolkit.Root {

    static async init() {
      reducer = await loader.require('reducers/demo-reducer');
      settings = await loader.require('services/settings');
    }

    async getInitialState() {
      return {
        items: settings.getState()
      };
    }

    getReducers() {
      return [reducer];
    }

    onItemSelected(index) {
      this.dispatch(reducer.commands.highlightItem(index));
    }

    render() {
      return [
        'div', {
          class: 'navigation'
        }, [
          NavigationPanel, {
            items: this.props.items,
            onItemSelected: this.onItemSelected,
          }
        ]
      ];
    }
  };

  const NavigationPanel = loader.symbol('components/navigation/panel');

  module.exports = DemoApp;
}
