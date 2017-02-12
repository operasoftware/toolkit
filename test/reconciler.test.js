global.Reactor = createCore();
const Reconciler = Reactor.Reconciler;
const MoveName = Reconciler.Move.Name;

describe('Reconciler', () => {

  const assertSingleMove = moves => {
    assert(Array.isArray(moves));
    assert.equal(moves.length, 1);
  };
  const assertInsertItem = (move, item, at) => {
    assert.equal(move.name, MoveName.INSERT);
    assert.equal(move.item, item);
    assert.equal(move.at, at);
  };
  const assertMoveItem = (move, item, from, to) => {
    assert.equal(move.name, MoveName.MOVE);
    assert.equal(move.item, item);
    assert.equal(move.from, from);
    assert.equal(move.to, to);
  };
  const assertRemoveItem = (move, item, at) => {
    assert.equal(move.name, MoveName.REMOVE);
    assert.equal(move.item, item);
    assert.equal(move.at, at);
  };

  const A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    H = 'H';
  const X = 'X';

  it('inserts item into an empty array', () => {

    // given
    const source = [];
    const target = [X]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertInsertItem(moves[0], X, 0);
  });

  it('inserts item at specified index', () => {

    // given
    const source = [A, B, C, D];
    const target = [A, B, X, C, D]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertInsertItem(moves[0], X, 2);
  });

  it('inserts item at the beginning', () => {

    // given
    const source = [A, B, C, D];
    const target = [X, A, B, C, D]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertInsertItem(moves[0], X, 0);
  });

  it('inserts item at the end', () => {

    // given
    const source = [A, B, C, D];
    const target = [A, B, C, D, X]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertInsertItem(moves[0], X, 4);
  });

  it('removes a single item', () => {

    // given
    const source = [X];
    const target = []

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertRemoveItem(moves[0], X, 0);
  });

  it('removes item at specified index', () => {

    // given
    const source = [A, B, X, C, D];
    const target = [A, B, C, D]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertRemoveItem(moves[0], X, 2);
  });

  it('removes item at the beginning', () => {

    // given
    const source = [X, A, B, C, D];
    const target = [A, B, C, D]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertRemoveItem(moves[0], X, 0);
  });

  it('removes item at the end', () => {

    // given
    const source = [A, B, C, D, X];
    const target = [A, B, C, D]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertRemoveItem(moves[0], X, 4);
  });

  it('moves the item forward', () => {

    // given
    const source = [A, X, B, C, D];
    const target = [A, B, C, X, D];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertMoveItem(moves[0], X, 1, 3);
  });

  it('moves the item to the end', () => {

    // given
    const source = [X, A, B, C, D];
    const target = [A, B, C, D, X];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertMoveItem(moves[0], X, 0, 4);
  });

  it('moves the item backward', () => {

    // given
    const source = [A, B, C, X, D];
    const target = [A, X, B, C, D];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertMoveItem(moves[0], X, 3, 1);
  });

  it('moves the item to the beginning', () => {

    // given
    const source = [A, B, C, D, X];
    const target = [X, A, B, C, D];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertMoveItem(moves[0], X, 4, 0);
  });

  it('moves the items around (1)', () => {

    // given
    const source = [A, B, C, D, E, F];
    const target = [A, B, F, E, C, D];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert.equal(moves.length, 2);
    assert.deepEqual(moves.result, target);
  });

  it('moves the items around (2)', () => {

    // given
    const source = [A, B, C, D, E, F];
    const target = [B, C, D, A, G, E];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert.equal(moves.length, 4);
    assert.deepEqual(moves.result, target);
  });

  it('moves the items around (3)', () => {

    // given
    const source = [A, B, C, D, E, F];
    const target = [C, D, E, F, B, A];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert.equal(moves.length, 2);
    assert.deepEqual(moves.result, target);
  });

});