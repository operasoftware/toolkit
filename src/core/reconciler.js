{
  const Name = {
    INSERT: Symbol('insert'),
    MOVE: Symbol('move'),
    REMOVE: Symbol('remove'),
  };

  const Move = class {

    constructor(name, item, props, make) {
      Object.assign(this, {
        name, item, make
      }, props);
    }

    static insert(item, at) {
      return new Move(Name.INSERT, item, { at }, items => {
        items.splice(at, 0, item);
      });
    }

    static move(item, from, to) {
      return new Move(Name.MOVE, item, { from, to }, items => {
        // Reactor.assert(items[from] === item)
        items.splice(from, 1);
        items.splice(to, 0, item);
      });
    }

    static remove(item, at) {
      return new Move(Name.REMOVE, item, { at }, items => {
        items.splice(at, 1);
      });
    }
  };

  const Reconciler = class {

    static calculateMoves(current, next) {
      const array = [...current];
      const moves = [];

      const makeMove = move => {
        moves.push(move);
        move.make(array);
      };

      for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (!next.includes(item)) {
          makeMove(Move.remove(item, i));
        }
      }
      for (let i = 0; i < next.length; i++) {
        const item = next[i];
        if (array[i] !== item) {
          // different items
          if (array.includes(item)) {
            const index = array.indexOf(item);
            makeMove(Move.move(item, index, i));
            moves.push();
          } else {
            makeMove(Move.insert(item, i));
          }
        } else {
          // no move needed
        }
      }
      return moves;
    }
  };

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  module.exports = Reconciler;
}