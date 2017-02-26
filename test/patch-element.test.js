global.Reactor = createCore();
const Patch = Reactor.Patch;
const Document = Reactor.Document;
const ComponentTree = Reactor.ComponentTree;

describe('Patch element => apply', () => {

  const createElement = template => {
    const element = ComponentTree.createFromTemplate(template);
    Document.attachElementTree(element);
    return element;
  };

  it('adds attribute', () => {

    // given
    const element = createElement([
      'div'
    ]);

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
    const element = createElement([
      'div', {
        name: 'name',
        noValidate: false,
        minLength: '50px',
      }
    ]);

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
    const element = createElement([
      'div', {
        name: 'name',
        noValidate: false,
        minLength: '50px',
      }
    ]);

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
    const element = createElement([
      'div'
    ]);

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
    const element = createElement([
      'div', {
        dataset: {
          reactorId: 15,
          someName: 'Some Name',
        },
      }
    ]);

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
    const element = createElement([
      'div', {
        dataset: {
          name: 'name',
          anything: 'true',
        }
      }
    ]);

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
    const element = createElement([
      'div'
    ]);

    // when
    Patch.addStyleProperty('color', 'black', element).apply();

    // then
    assert.equal(element.style.color, 'black');
    assert.equal(element.ref.style.color, 'black');
  });

  it('replaces style property', () => {

    // given
    const element = createElement([
      'div', {
        style: {
          textDecoration: 'underline',
        },
      }
    ]);

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
    const element = createElement([
      'div', {
        style: {
          visibility: 'hidden',
        },
      }
    ]);

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
    const element = createElement([
      'div', {
        class: {},
      }
    ]);

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
    const element = createElement([
      'div', {
        class: 'test',
      }
    ]);

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
    const element = createElement([
      'div'
    ]);
    const onClick = () => {};

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
    const element = createElement([
      'div', {
        onClick: doSomething,
      }
    ]);

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
    const element = createElement([
      'div', {
        onClick
      }
    ]);

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

});