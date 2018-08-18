describe('Renderer', () => {

  const Renderer = opr.Toolkit.Renderer;

  const createRenderer = () => {
    const root = new opr.Toolkit.Root();
    const settings = {};
    return new opr.Toolkit.Renderer(root, settings);
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
