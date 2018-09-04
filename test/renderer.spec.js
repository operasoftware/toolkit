describe('Renderer', () => {

  const Renderer = opr.Toolkit.Renderer;

  class SomeRoot extends opr.Toolkit.Root {
    constructor() {
      super(null, {}, opr.Toolkit);
    }
  }

  const createRenderer = () => {
    const root = new SomeRoot();
    return new opr.Toolkit.Renderer(root);
  };

  it('returns empty list of patches for equal states', () => {

    // given
    const prev = {a: 1, b: null, c: false};
    const next = {b: null, c: false, a: 1};

    const renderer = createRenderer();

    // when
    const patches = renderer.update(prev, next);

    // then
    assert.deepEqual(prev, next);
  });
});
