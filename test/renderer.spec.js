describe('Renderer', () => {

  const {
    Renderer,
    Template,
    VirtualDOM,
  } = opr.Toolkit;

  class SomeRoot extends opr.Toolkit.Root {
    constructor() {
      super(null, {}, opr.Toolkit);
    }
  }

  class Root extends opr.Toolkit.Root {
    render() {
      return null;
    }
  }

  const createRenderer = () => {
    const root = VirtualDOM.createRoot(Root);
    return root.renderer;
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
