{
  let reducer;
  let service;

  const Bubble = loader.symbol('bubbles/bubble-component');

  class BubblesApp extends opr.Toolkit.Root {

    static async init() {
      reducer = await loader.require('bubbles/bubbles-reducer');
      service = await loader.require('bubbles/bubbles-service');
    }

    static get displayName() {
      return 'Bubbles';
    }

    static get elementName() {
      return 'bubbles-demo';
    }

    static get styles() {
      return [
        'bubbles.css',
      ];
    }

    getReducers() {
      return [reducer];
    }

    async getInitialState() {
      const count = 1;
      return {
        bubbles: service.createBubbles(count),
        config: {count},
      };
    }

    onBackgroundClick(event) {
      let id = this.props.bubbles.length ?
          Math.max(...this.props.bubbles.map(bubble => bubble.id)) + 1 :
          0;
      const x = event.offsetX / event.target.offsetWidth;
      const y = event.offsetY / event.target.offsetHeight;
      this.dispatch(reducer.commands.create(service.createBubble(id, x, y)));
    }

    onDoubleClick(event) {
      const id = parseInt(event.target.parentNode.id);
      this.commands.destroy(id);
    }

    render() {
      return [
        'bubbles',
        {
          onClick: this.onBackgroundClick,
          onDoubleClick: this.onDoubleClick,
        },
        ...this.props.bubbles.map(
            props =>
                ['section',
                 {
                   key: props.id,
                   id: props.id,
                   style: {
                     width: [props.radius * 200, '%'],
                     height: [props.radius * 200, '%'],
                     left: [props.x * 100, '%'],
                     top: [props.y * 100, '%'],
                   },
                 },
                 [Bubble, props],
      ]),
      ];
    }
  };

  module.exports = BubblesApp;
}
