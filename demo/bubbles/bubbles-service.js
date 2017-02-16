{
  const BubblesService = class {

    static getState() {
      return new Array(32).fill(null).map((item, index) => {
        const radius = Math.random() * 0.08 + 0.08;
        return {
          radius,
          x: Math.random() * (1 - 2 * radius),
          y: Math.random() * (1 - 2 * radius),
        };
      });
    }
  };

  module.exports = BubblesService;
}
