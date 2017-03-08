describe('Reconciler', () => {

  const Reconciler = Reactor.Reconciler;
  const MoveName = Reconciler.Move.Name;

  const A = 'A', B = 'B', C = 'C', D = 'D', E = 'E', F = 'F', G = 'G', H = 'H';
  const X = 'X', Y = 'Y', Z = 'Z';

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

  it('inserts item into an empty array', () => {

    // given
    const source = [];
    const target = [X]

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertInsertItem(moves[0], X, 0);
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
  });

  it('moves the item forward', () => {

    // given
    const source = [A, X, B, C, D, E, F, G, H];
    const target = [A, B, C, D, E, F, G, X, H];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertMoveItem(moves[0], X, 1, 7);
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
  });

  it('moves the item backward', () => {

    // given
    const source = [A, B, C, D, E, F, G, X, H];
    const target = [A, X, B, C, D, E, F, G, H];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assertSingleMove(moves);
    assertMoveItem(moves[0], X, 7, 1);
    assert.deepEqual(moves.result, target);
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
    assert.deepEqual(moves.result, target);
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
    assert.equal(moves.length, 3);
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

  it('inserts, moves and removes items (1)', () => {

    // given
    const source = [X, A, B, C, Y, D];
    const target = [A, B, C, Z, D, X];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert.equal(moves.length, 4);
    assert.deepEqual(moves.result, target);
  });

  it('inserts, moves and removes items (2)', () => {

    // given
    const source = [X, A, B, C, D, E, F, G, H, Y];
    const target = [A, Z, B, C, D, E, F, G, H, X];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert.equal(moves.length, 4);
    assert.deepEqual(moves.result, target);
  });

  it('inserts, moves and removes items (3)', () => {

    // given
    const source = [A, X, B, C, D, E, Y, F, G, H];
    const target = [H, A, Y, B, D, E, F, Z, C];

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert.equal(moves.length, 9);
    assert.deepEqual(moves.result, target);
  });
});
