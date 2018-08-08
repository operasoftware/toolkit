{
  const randomRadius = () => Math.random() * 0.08 + 0.08;
  const randomPosition = radius => Math.random() * (0.9 - 2 * radius) + 0.05;

  const LogosService = class {

    static createLogo(id, x, y) {
      const radius = randomRadius();
      return {
        highlighted: false,
        id,
        radius,
        x: x ? (x - radius) : randomPosition(radius),
        y: y ? (y - radius) : randomPosition(radius),
      };
    }

    static createLogos(count) {
      return new Array(count)
        .fill(null)
        .map((item, index) => this.createLogo(index));
    }

    static moveLogos(logos) {
      const positions = {};
      logos.forEach(logo => {
        positions[logo.id] = {
          x: randomPosition(logo.radius),
          y: randomPosition(logo.radius),
        };
      });
      return positions;
    }
  };

  module.exports = LogosService;
}
