global.Reactor = createCore();
const Reconciler = Reactor.Reconciler;
const MoveName = Reconciler.Move.Name;

describe.only('Reconciler', () => {

  it('inserts item at specified index', () => {

    // given
    const source = ['A', 'B', 'C', 'D'];
    const target = ['0', 'A', 'B', 'C', 'D']

    // when
    const moves = Reconciler.calculateMoves(source, target);

    // then
    assert(Array.isArray(moves));
    assert.equal(moves.length, 1);
    assert.equal(moves[0].name, MoveName.INSERT);
    assert.equal(moves[0].item, '0');
    assert.equal(moves[0].at, 0);
  });
});
