describe('Toolkit', () => {

  it('calls lifecycle methods in proper order', async () => {

    // given
    const lifecycle = [];

    class App extends opr.Toolkit.Root {
      onCreated() {
        lifecycle.push('App created');
      }
      onAttached() {
        lifecycle.push('App attached');
      }
      render() {
        return [Parent];
      }
    }

    class Parent extends opr.Toolkit.Component {
      onCreated() {
        lifecycle.push('Parent created');
      }
      onAttached() {
        lifecycle.push('Parent attached');
      }
      render() {
        return [Child];
      }
    }

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
    }

    const settings = {
      plugins: [],
    };

    const container = document.createElement('section');
    container.style.display = 'none';
    document.body.appendChild(container);

    opr.Toolkit.configure(settings);

    await opr.Toolkit.render(App, container);

    assert.equal(lifecycle.length, 6);

    assert.equal(lifecycle[0], 'App created');
    assert.equal(lifecycle[1], 'Parent created');
    assert.equal(lifecycle[2], 'Child created');
    assert.equal(lifecycle[3], 'Child attached');
    assert.equal(lifecycle[4], 'Parent attached');
    assert.equal(lifecycle[5], 'App attached');
  });

  it('tracks rendered root components', async () => {

    // given
    class MainRoot extends opr.Toolkit.Root {
      render() {
        return ['main'];
      }
    }
    class ShadowRoot extends opr.Toolkit.Root {
      static get elementName() {
        return 'some-root';
      }
      render() {
        return ['section'];
      }
    }

    // given
    const toolkit = await opr.Toolkit.create();

    // when
    const mainRoot = await toolkit.render(MainRoot, document.body);
    const shadowRoot = await toolkit.render(ShadowRoot, document.body);

    // then
    assert.equal(toolkit.tracked.length, 2);

    // when
    shadowRoot.ref.remove();

    // then
    assert.equal(toolkit.tracked.length, 1);

    // when
    mainRoot.destroy();

    // then
    assert.equal(toolkit.tracked.length, 0);
  });
});
