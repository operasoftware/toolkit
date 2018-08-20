{
  class Grid extends opr.Toolkit.Root {

    async getInitialState() {

      return {
        tile: {
          width: 160,
          height: 90,
        },
        spacing: {
          horizontal: 24,
          vertical: 16,
        },
        count: 16,
      };
    }

    render() {
      return [
        'main',
        {
          class: 'grid',
        },
        ...new Array(this.props.count)
            .fill()
            .map(
                (item, index) =>
                    ['section',
                     {
                       class: 'tile',
                       style: {
                         width: [this.props.tile.width, 'px'],
                         height: [this.props.tile.height, 'px'],
                       },
                     },
                     String(index),
      ]),
      ];
    }
  }

  module.exports = Grid;
}