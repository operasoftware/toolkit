describe('Toolkit', () => {

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
    loader.define('my/app', App);

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
    loader.define('my/parent', Parent);

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
    loader.define('my/child', Child);

    const settings = {
      bundles: [],
      plugins: [],
    };

    const container = document.createElement('section');
    container.style.display = 'none';
    document.body.appendChild(container);

    opr.Toolkit.configure(settings);

    await opr.Toolkit.render('my/app', container);

    assert.equal(lifecycle.length, 6);

    assert.equal(lifecycle[0], 'App created');
    assert.equal(lifecycle[1], 'Parent created');
    assert.equal(lifecycle[2], 'Child created');
    assert.equal(lifecycle[3], 'Child attached');
    assert.equal(lifecycle[4], 'Parent attached');
    assert.equal(lifecycle[5], 'App attached');
  });

});
