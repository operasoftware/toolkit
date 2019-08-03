{
  const getNextChannel = current => current === 'developer' ? 'beta' : 'stable';

  class Logo extends opr.Toolkit.Root {

    static get elementName() {
      return 'logo-component';
    }

    static get styles() {
      return ['styles/logo.css'];
    }

    async getInitialState(props) {
      return {
        ...props,
        channel: 'developer',
      };
    }

    onClick(event) {
      this.commands.update({
        channel: getNextChannel(this.props.channel),
      });
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    render() {
      return [
        'logo',
        {
          style: {
            background: `url('/images/${this.props.channel}.svg')`,
          },
          attrs: {
            channel: this.props.channel,
          },
          onClick: this.onClick,
        },
      ];
    }
  }

  module.exports = Logo;
}
