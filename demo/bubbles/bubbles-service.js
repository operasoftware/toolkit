{
  const randomRadius = () => Math.random() * 0.08 + 0.08;
  const randomPosition = radius => Math.random() * (0.9 - 2 * radius) + 0.05;
  const randomRotation = () => Math.random() * 60;

  const BubblesService = class {

    static createBubble(id, x, y) {
      const radius = randomRadius();
      return {
        id,
        radius,
        x: x ? (x - radius) : randomPosition(radius),
        y: y ? (y - radius) : randomPosition(radius),
        rotation: randomRotation(),
      };
    }

    static createBubbles(count) {
      return new Array(count)
        .fill(null)
        .map((item, index) => this.createBubble(index));
    }

    static moveBubbles(bubbles) {
      const positions = {};
      bubbles.forEach(bubble => {
        positions[bubble.id] = {
          x: randomPosition(bubble.radius),
          y: randomPosition(bubble.radius),
        };
      });
      return positions;
    }
  };

  module.exports = BubblesService;
}