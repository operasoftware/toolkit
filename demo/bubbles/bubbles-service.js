{
  const BubblesService = class {

    static getState(number) {
      return new Array(number).fill(null).map((item, index) => {
        const radius = Math.random() * 0.08 + 0.08;
        return {
          id: index,
          radius,
          x: Math.random() * (1 - 2 * radius),
          y: Math.random() * (1 - 2 * radius),
        };
      });
    }
  };

  module.exports = BubblesService;
}
