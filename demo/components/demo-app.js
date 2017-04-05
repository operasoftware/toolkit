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

  const NavigationPanel = loader.symbol('components/navigation/panel');

  module.exports = DemoApp;
}
