/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

{
  const Name = {
    INSERT: Symbol('insert'),
    MOVE: Symbol('move'),
    REMOVE: Symbol('remove'),
  };

  class Move {

    constructor(name, item, props, make) {
      this.name = name;
      this.item = item;
      this.at = props.at;
      this.from = props.from;
      this.to = props.to;
      this.make = make;
    }

    static insert(item, at) {
      return new Move(Name.INSERT, item, {at}, items => {
        items.splice(at, 0, item);
      });
    }

    static move(item, from, to) {
      return new Move(Name.MOVE, item, {from, to}, items => {
        items.splice(from, 1);
        items.splice(to, 0, item);
      });
    }

    static remove(item, at) {
      return new Move(Name.REMOVE, item, {at}, items => {
        items.splice(at, 1);
      });
    }
  }

  const Reconciler = {

    comparator(a, b) {
      if (Object.is(a.key, b.key)) {
        return 0;
      }
      return a.key > b.key ? 1 : -1;
    },

    calculateMoves(source, target, favoredToMove = null) {
      const moves = [];

      const createItem = function(key, index) {
        return ({key, index});
      };

      const before = source.map(createItem).sort(this.comparator);
      const after = target.map(createItem).sort(this.comparator);

      let removed = [];
      let inserted = [];

      while (before.length || after.length) {
        if (!before.length) {
          inserted = inserted.concat(after);
          break;
        }
        if (!after.length) {
          removed = removed.concat(before);
          break;
        }
        const result = this.comparator(after[0], before[0]);
        if (result === 0) {
          before.shift();
          after.shift()
        } else if (result === 1) {
          removed.push(before.shift());
        } else {
          inserted.push(after.shift());
        }
      }

      const sortByIndex = function(foo, bar) {
        return foo.index - bar.index
      };

      removed.sort(sortByIndex).reverse();
      inserted.sort(sortByIndex);

      const result = [...source];

      for (let item of removed) {
        const move = Move.remove(item.key, item.index);
        move.make(result);
        moves.push(move);
      }
      for (let item of inserted) {
        const move = Move.insert(item.key, item.index);
        move.make(result);
        moves.push(move);
      }

      if (opr.Toolkit.Diff.deepEqual(result, target)) {
        moves.result = result;
        return moves;
      }

      const calculateIndexChanges = (source, target, reversed = false) => {

        const moves = [];

        const moveItemIfNeeded = index => {
          const item = target[index];
          if (source[index] !== item) {
            const from = source.indexOf(item);
            const move = Move.move(item, from, index);
            move.make(source);
            moves.push(move);
          }
        };

        if (reversed) {
          for (let i = target.length - 1; i >= 0; i--) {
            moveItemIfNeeded(i);
          }
        } else {
          for (let i = 0; i < target.length; i++) {
            moveItemIfNeeded(i);
          }
        }
        moves.result = source;
        return moves;
      };

      const defaultMoves = calculateIndexChanges([...result], target);
      if (defaultMoves.length > 1 ||
          favoredToMove && defaultMoves.length === 1 &&
              defaultMoves[0].item !== favoredToMove) {
        const alternativeMoves =
            calculateIndexChanges([...result], target, /*= reversed*/ true);
        if (alternativeMoves.length <= defaultMoves.length) {
          moves.push(...alternativeMoves);
          moves.result = alternativeMoves.result;
          return moves;
        }
      }
      moves.push(...defaultMoves);
      moves.result = defaultMoves.result;
      return moves;
    },
  };

  Reconciler.Move = Move;
  Reconciler.Move.Name = Name;

  module.exports = Reconciler;
}
