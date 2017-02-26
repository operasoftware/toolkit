global.Reactor = createCore();
const Patch = Reactor.Patch;
const Document = Reactor.Document;
const ComponentTree = Reactor.ComponentTree;

describe('Patch => apply', () => {

  const container = document.createElement('app');;

  const Component = Symbol.for('Component');

  const App = class extends Reactor.Root {
    constructor() {
      super(container);
    }
  };
  const ComponentClass = class extends Reactor.Component {
    render() {
      return this.children[0] || null;
    }
  };

  beforeEach(() => {
    ComponentTree.createComponentInstance = def => {
      switch (def) {
        case Component:
          return new ComponentClass();
        default:
          throw new Error('Unknown definition: ' + def);
      }
    };
  });

  it('updates component', () => {

    // given
    const component = new ComponentClass();
    const props = {
      foo: 'bar'
    };

    // when
    Patch.updateComponent(component, props).apply();

    // then
    assert.equal(component.props, props);
  });

  it('adds attribute', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div'
    ]);
    Document.attachElementTree(element);

    // when
    Patch.addAttribute('name', 'value', element).apply();
    Patch.addAttribute('noValidate', 'true', element).apply();
    Patch.addAttribute('minLength', '100px', element).apply();

    // then
    assert.equal(Object.entries(element.attrs).length, 3);
    assert.deepEqual(element.attrs, {
      name: 'value',
      noValidate: 'true',
      minLength: '100px',
    });
    assert.deepEqual(element.ref.attributes, {
      'name': 'value',
      'no-validate': 'true',
      'min-length': '100px',
    });
  });

  it('replaces attribute', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        name: 'name',
        noValidate: false,
        minLength: '50px',
      }
    ]);
    Document.attachElementTree(element);

    assert.deepEqual(element.attrs, {
      name: 'name',
      noValidate: 'false',
      minLength: '50px',
    });
    assert.deepEqual(element.ref.attributes, {
      'name': 'name',
      'no-validate': 'false',
      'min-length': '50px',
    });

    // when
    Patch.replaceAttribute('name', 'value', element).apply();
    Patch.replaceAttribute('noValidate', 'true', element).apply();
    Patch.replaceAttribute('minLength', '100px', element).apply();

    // then
    assert.equal(Object.entries(element.attrs).length, 3);
    assert.deepEqual(element.attrs, {
      name: 'value',
      noValidate: 'true',
      minLength: '100px',
    });
    assert.deepEqual(element.ref.attributes, {
      'name': 'value',
      'no-validate': 'true',
      'min-length': '100px',
    });
  });

  it('removes attribute', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        name: 'name',
        noValidate: false,
        minLength: '50px',
      }
    ]);
    Document.attachElementTree(element);

    assert.deepEqual(element.attrs, {
      name: 'name',
      noValidate: 'false',
      minLength: '50px',
    });
    assert.deepEqual(element.ref.attributes, {
      'name': 'name',
      'no-validate': 'false',
      'min-length': '50px',
    });

    // when
    Patch.removeAttribute('name', element).apply();
    Patch.removeAttribute('noValidate', element).apply();
    Patch.removeAttribute('minLength', element).apply();

    // then
    assert.equal(Object.entries(element.attrs).length, 0);
    assert.deepEqual(element.attrs, {});
    assert.deepEqual(element.ref.attributes, {});
  });

  it('adds data attributes', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div'
    ]);
    Document.attachElementTree(element);

    // when
    Patch.addDataAttribute('id', '10', element).apply();
    Patch.addDataAttribute('customAttribute', 'true', element).apply();

    // then
    assert.equal(Object.entries(element.dataset).length, 2);
    const dataset = {
      id: '10',
      customAttribute: 'true',
    };
    assert.deepEqual(element.dataset, dataset);
    assert.deepEqual(element.ref.dataset, dataset);

    assert.equal(element.ref.getAttribute('data-id'), '10');
    assert.equal(element.ref.getAttribute('data-custom-attribute'), 'true');
  });

  it('replaces data attributes', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        dataset: {
          reactorId: 15,
          someName: 'Some Name',
        },
      }
    ]);
    Document.attachElementTree(element);

    const dataset = {
      reactorId: '15',
      someName: 'Some Name',
    };
    assert.deepEqual(element.dataset, dataset);
    assert.deepEqual(element.ref.dataset, dataset);

    assert.equal(element.ref.getAttribute('data-reactor-id'), '15');
    assert.equal(element.ref.getAttribute('data-some-name'), 'Some Name');

    // when
    Patch.replaceDataAttribute('reactorId', '23', element).apply();
    Patch.replaceDataAttribute('someName', 'Other Name', element).apply();

    // then
    assert.equal(Object.entries(element.dataset).length, 2);
    const nextDataset = {
      reactorId: '23',
      someName: 'Other Name',
    };
    assert.deepEqual(element.dataset, nextDataset);
    assert.deepEqual(element.ref.dataset, nextDataset);

    assert.equal(element.ref.getAttribute('data-reactor-id'), '23');
    assert.equal(element.ref.getAttribute('data-some-name'), 'Other Name');
  });

  it('removes data attribute', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        dataset: {
          name: 'name',
          anything: 'true',
        }
      }
    ]);
    Document.attachElementTree(element);

    assert.equal(Object.entries(element.dataset).length, 2);
    const dataset = {
      name: 'name',
      anything: 'true',
    };
    assert.deepEqual(element.dataset, dataset);
    assert.deepEqual(element.ref.dataset, dataset);

    // when
    Patch.removeDataAttribute('name', element).apply();
    Patch.removeDataAttribute('anything', element).apply();

    // then
    assert.equal(Object.entries(element.dataset).length, 0);
    assert.deepEqual(element.dataset, {});
    assert.deepEqual(element.ref.dataset, {});
  });

  it('adds style property', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div'
    ]);
    Document.attachElementTree(element);

    // when
    Patch.addStyleProperty('color', 'black', element).apply();

    // then
    assert.equal(element.style.color, 'black');
    assert.equal(element.ref.style.color, 'black');
  });

  it('replaces style property', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        style: {
          textDecoration: 'underline',
        },
      }
    ]);
    Document.attachElementTree(element);

    assert.equal(element.style.textDecoration, 'underline');
    assert.equal(element.ref.style.textDecoration, 'underline');

    // when
    Patch.replaceStyleProperty('textDecoration', 'overline', element).apply();

    // then
    assert.equal(element.style.textDecoration, 'overline');
    assert.equal(element.ref.style.textDecoration, 'overline');
  });

  it('removes style property', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        style: {
          visibility: 'hidden',
        },
      }
    ]);
    Document.attachElementTree(element);

    assert.equal(element.style.visibility, 'hidden');
    assert.equal(element.ref.style.visibility, 'hidden');

    // when
    Patch.removeStyleProperty('visibility', element).apply();

    // then
    assert.equal(element.style.visibility, undefined);
    assert.equal(element.ref.style.visibility, undefined);
  });

  it('adds class name', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        class: {},
      }
    ]);
    Document.attachElementTree(element);

    assert.deepEqual(element.classNames, []);
    assert.deepEqual(Array.from(element.ref.classList), []);

    // when
    Patch.addClassName('test', element).apply();

    // then
    assert.deepEqual(element.classNames, ['test']);
    assert.deepEqual(Array.from(element.ref.classList), ['test']);
  });

  it('removes class name', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div', {
        class: 'test',
      }
    ]);
    Document.attachElementTree(element);

    assert.deepEqual(element.classNames, ['test']);
    assert.deepEqual(Array.from(element.ref.classList), ['test']);

    // when
    Patch.removeClassName('test', element).apply();

    // then
    assert.deepEqual(element.classNames, []);
    assert.deepEqual(Array.from(element.ref.classList), []);
  });

  it('adds listener', () => {

    // given
    const element = ComponentTree.createFromTemplate([
      'div'
    ]);
    const onClick = () => {};
    Document.attachElementTree(element);

    // when
    Patch.addListener('click', onClick, element).apply();

    // then
    assert.equal(element.listeners.click, onClick);
    assert.deepEqual(element.ref.eventListeners.click, [onClick]);
  });

  it('replaces listener', () => {

    // given
    const doSomething = () => {};
    const doSomethingElse = () => {};
    const element = ComponentTree.createFromTemplate([
      'div', {
        onClick: doSomething,
      }
    ]);
    Document.attachElementTree(element);

    // then
    assert.equal(element.listeners.click, doSomething);
    assert.deepEqual(element.ref.eventListeners.click, [doSomething]);

    // when
    Patch.replaceListener('click', doSomething, doSomethingElse, element)
      .apply();

    // then
    assert.equal(element.listeners.click, doSomethingElse);
    assert.deepEqual(element.ref.eventListeners.click, [doSomethingElse]);
  });

  it('removes listener', () => {

    // given
    const onClick = () => {};
    const element = ComponentTree.createFromTemplate([
      'div', {
        onClick
      }
    ]);
    Document.attachElementTree(element);

    // then
    assert.equal(element.listeners.click, onClick);
    assert.deepEqual(element.ref.eventListeners.click, [onClick]);

    // when
    Patch.removeListener('click', onClick, element).apply();

    // then
    assert.equal(element.listeners.click, undefined);
    assert.deepEqual(element.ref.eventListeners.click, []);
  });

  it.skip('inserts child node', () => {

  });

  it.skip('moves child node', () => {

  });

  it.skip('removes child node', () => {

  });

  describe('add element', () => {

    it('adds element to a root ', () => {

      // given
      const app = new App();
      const element = ComponentTree.createFromTemplate([
        'div', [
          'span'
        ]
      ]);

      // when
      Patch.addElement(element, app).apply();

      // then
      assert(app.parentElement);
      assert.equal(app.parentElement.ref, container);
      assert.equal(element.parentElement.ref, container);

      assert.equal(app.child, element);
      assert.equal(app.childElement, element);
      assert.equal(element.parentNode, app);
      assert.equal(app.childElement.ref.tagName, 'DIV');
    });

    it('adds element to a component ', () => {

      // given
      const app = new App();
      const component = ComponentTree.create(Component);
      app.appendChild(component);

      const element = ComponentTree.createFromTemplate([
        'div', [
          'span'
        ]
      ]);

      // when
      Patch.addElement(element, component).apply();

      // then
      assert(component.parentElement);
      assert.equal(component.parentElement.ref, container);
      assert.equal(element.parentElement.ref, container);

      assert.equal(app.child, component);
      assert.equal(app.childElement, element);
      assert.equal(component.child, element);
      assert.equal(component.childElement, element);
      assert.equal(element.parentNode, component);
      assert.equal(component.childElement.ref.tagName, 'DIV');
    });

    it.skip('replaces a comment node');

  });

  describe('add component', () => {

    it.skip('adds empty component to a root');

    it('adds component with a child element to a root', () => {

      // given
      const app = new App();
      const component = ComponentTree.createFromTemplate([
        Component, [
          'span'
        ]
      ]);

      // when
      Patch.addComponent(component, app).apply();

      // then
      assert.equal(app.parentElement.ref, container);
      assert.equal(app.child, component);

      assert(component.child);
      assert.equal(component.child.name, 'span');
      assert(component.child.ref);
      assert.equal(component.child.ref.tagName, 'SPAN');
    });
  });

  it('removes element', () => {

    // given
    const parent = new App();
    const element = ComponentTree.createFromTemplate([
      'div', [
        'span'
      ]
    ]);
    Document.attachElementTree(element);
    parent.appendChild(element);

    // when
    Patch.removeElement(element, parent).apply();

    // then
    assert.equal(parent.parentElement.ref, container);
    assert.equal(parent.child, null);
    assert.equal(element.ref.parentNode, null);
  });

  it('removes component', () => {

    // given
    const parent = new App();
    const component = ComponentTree.createFromTemplate([
      Component, [
        'span'
      ]
    ]);
    Document.attachElementTree(component);
    parent.appendChild(component);

    // when
    Patch.removeComponent(component, parent).apply();

    // then
    assert.equal(parent.parentElement.ref, container);
    assert.equal(parent.child, null);
    assert.equal(component.parentNode, null);
  });

});