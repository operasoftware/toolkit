{
  const Name = {
    INSERT: Symbol('insert'),
    MOVE: Symbol('move'),
    REMOVE: Symbol('remove'),
  };

  class Move {

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
        items.splice(from, 1);
        items.splice(to, 0, item);
      });
    }

    static remove(item, at) {
      return new Move(Name.REMOVE, item, { at }, items => {
        items.splice(at, 1);
      });
    }
  }

  class Reconciler {

    static calculateMoves(current, next) {

      const makeMoves = (reversed = false) => {
        const source = [...current];
        const target  = [...next];
        const moves = [];

        const makeMove = move => {
          move.make(source);
          moves.push(move);
        };
        for (let i = source.length - 1; i >= 0; i--) {
          const item = source[i];
          if (!target.includes(item)) {
            makeMove(Move.remove(item, i));
          }
        }
        for (const item of target) {
          if (!source.includes(item)) {
            const index = target.indexOf(item);
            makeMove(Move.insert(item, index));
          }
        }
        const moveAndInsert = index => {
          const item = target[index];
          if (source[index] !== item) {
            const from = source.indexOf(item);
            makeMove(Move.move(item, from, index));
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
      if (moves.filter(move => (move.name === Name.MOVE)).length > 1) {
        const alternativeMoves = makeMoves(true);
        return alternativeMoves.length < moves.length ? alternativeMoves :
                                                        moves;
      }
      return moves;
    }
  }

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  module.exports = Reconciler;
}
