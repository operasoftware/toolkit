{
  const CHANGE_CHANNEL = Symbol('change-channel');

  const getNextChannel = current => current === 'developer' ? 'beta' : 'stable';

  class Logo extends opr.Toolkit.Root {

    static get elementName() {
      return 'logo-component';
    }

    static get styles() {
      return ['styles/logo.css'];
    }

    async getInitialState() {
      return {
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
          id: this.props.id,
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
  };

  module.exports = Logo;
}
