{

  const NavigationItem = class extends Reactor.Component {

    static async init() {
      // console.debug('Async init in:', this);
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
          onClick: this.props.onClick,
          style: this.props.highlighted ? 'background-color: red' : undefined
        },
        this.props.text
      ];
    }
  };

  module.exports = NavigationItem;

}
