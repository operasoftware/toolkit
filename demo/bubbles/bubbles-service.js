{
  const randomPosition = radius => Math.random() * (1 - 2 * radius);

  const BubblesService = class {

    static createBubbles(count) {
      return new Array(count).fill(null).map((item, index) => {
        const radius = Math.random() * 0.08 + 0.08;
        return {
          id: index,
          radius,
          x: randomPosition(radius),
          y: randomPosition(radius),
        };
      });
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
