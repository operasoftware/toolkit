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
        // console.log('Before:', items);
        items.splice(from, 1);
        // console.log('After removed:', items);
        items.splice(to, 0, item);
        // console.log('After inserted:', items);
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

      const makeMoves = (reversed = false) => {
        const source = [...current];
        const target  = [...next];
        const moves = [];

        const makeMove = move => {
          move.make(source);
          moves.push(move);
        };
        for (let i = 0; i < source.length; i++) {
          const item = source[i];
          if (!target.includes(item)) {
            // console.log(`=> Remove '${item}' at ${i}, source:`, source);
            makeMove(Move.remove(item, i));
          }
        }
        for (const item of target) {
          if (!source.includes(item)) {
            const index = target.indexOf(item);
            // console.log(`=> Insert '${item}' at ${index}, source:`, source);
            makeMove(Move.insert(item, index));
          }
        }
        const moveAndInsert = index => {
          const item = target[index];
          if (source[index] !== item) {
            if (source.includes(item)) {
              const from = source.indexOf(item);
              // console.log(`=> Move '${item}' from ${from} to ${index}, source:`, source);
              makeMove(Move.move(item, from, index));
            } else {
              throw 'Illegal state';
            }
          }
        };

        if (reversed) {
          for (let i = target.length - 1; i >= 0; i--) {
            moveAndInsert(i);
          }
        } else {
          for (let i = 0; i < target.length; i++) {
            moveAndInsert(i);
          }
        }
        moves.result = source;
        return moves;
      };

      const moves = makeMoves();
      if (moves.length <= 1) {
        return moves;
      }
      const reversedMoves = makeMoves(true);
      if (reversedMoves === null || reversedMoves.length > moves.length) {
        return moves;
      } else {
        return reversedMoves;
      }
      return moves;
    }
  };

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  module.exports = Reconciler;
}
