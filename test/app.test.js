describe('App', () => {

  it('should call lifecycle methods in proper order', async () => {

    // given
    const ParentSymbol = Symbol.for('my/parent');
    const ChildSymbol = Symbol.for('my/child');

    const lifecycle = [];

    class App extends opr.Toolkit.Root {
      onCreated() {
        lifecycle.push('App created');
      }
      onAttached() {
        lifecycle.push('App attached');
      }
      render() {
        return [ParentSymbol];
      }
    };

    class Parent extends opr.Toolkit.Component {
      onCreated() {
        lifecycle.push('Parent created');
      }
      onAttached() {
        lifecycle.push('Parent attached');
      }
      render() {
        return [ChildSymbol];
      }
    };

    class Child extends opr.Toolkit.Component {
      onCreated() {
        lifecycle.push('Child created');
      }
      onAttached() {
        lifecycle.push('Child attached');
      }
      render() {
        return ['div'];
      }
    };

    const getModule = id => {
      const path = String(id).slice(7, -1);
      switch (path) {
        case 'my/app':
          return App;
        case 'my/parent':
          return Parent;
        case 'my/child':
          return Child;
        default:
          throw new Error(`Unknown path: ${path}`);
      }
    };

    global.loader = {
      get: id => getModule(id),
      resolve: async id => getModule(id),
    };

    const settings = {
      bundles: [],
      plugins: [],
    };
    const app = new opr.Toolkit.App('my/app', settings);

    const container = document.createElement('section');

    await app.render(container);

    assert.equal(lifecycle.length, 6);

    assert.equal(lifecycle[0], 'App created');
    assert.equal(lifecycle[1], 'Parent created');
    assert.equal(lifecycle[2], 'Child created');
    assert.equal(lifecycle[3], 'Child attached');
    assert.equal(lifecycle[4], 'Parent attached');
    assert.equal(lifecycle[5], 'App attached');
  });

});
