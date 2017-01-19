{

  const NavigationItem = class extends Reactor.Component {

    static async init() {
      console.debug('Async init in:', this.name);
    }

    onClick() {
      console.log(`${this.props.text} clicked`);
    }

    postAttach() {

    }

    preDestroy() {

    }

    render() {
      return [
        'a', {
          onClick: () => this.onClick(),
        },
        this.props.text
      ];
    }
  };

  module.exports = NavigationItem;

}
