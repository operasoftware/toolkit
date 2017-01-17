{

  const NavigationItem = class extends Reactor.Component {

    async init() {
      console.debug('Async init in:', this);
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
