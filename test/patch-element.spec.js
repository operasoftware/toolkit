describe('Patch element => apply', () => {

  const {
    Document,
    Patch,
    VirtualDOM,
  } = opr.Toolkit;

  const createElement = name => createFromTemplate([name]);

  it('adds attribute', () => {

    // given
    const element = createFromTemplate(['div']);

    // when
    Patch.addAttribute('name', 'value', element).apply();
    Patch.addAttribute('noValidate', '', element).apply();
    Patch.addAttribute('minLength', '100px', element).apply();

    // then
    assert.equal(Object.entries(element.description.attrs).length, 3);
    assert.deepEqual(element.description.attrs, {
      name: 'value',
      noValidate: '',
      minLength: '100px',
    });
    assert.equal(element.ref.attributes['name'].value, 'value');
    assert.equal(element.ref.attributes['novalidate'].value, '');
    assert.equal(element.ref.attributes['minlength'].value, '100px');
  });

  it('replaces attribute', () => {

    // given
    const element = createFromTemplate([
      'div', {
        name: 'name',
        noValidate: false,
        minLength: '50px',
      }
    ]);

    assert.deepEqual(element.description.attrs, {
      name: 'name',
      minLength: '50px',
    });
    assert.equal(element.ref.attributes['name'].value, 'name');
    assert.equal(element.ref.attributes['minlength'].value, '50px');

    // when
    Patch.replaceAttribute('name', 'value', element).apply();
    Patch.replaceAttribute('noValidate', 'true', element).apply();
    Patch.replaceAttribute('minLength', '100px', element).apply();

    // then
    assert.equal(Object.entries(element.description.attrs).length, 3);
    assert.deepEqual(element.description.attrs, {
      name: 'value',
      noValidate: 'true',
      minLength: '100px',
    });
    assert.equal(element.ref.attributes['name'].value, 'value');
    assert.equal(element.ref.attributes['novalidate'].value, 'true');
    assert.equal(element.ref.attributes['minlength'].value, '100px');
  });

  it('removes attribute', () => {

    // given
    const element = createFromTemplate([
      'div', {
        name: 'name',
        noValidate: 'false',
        minLength: '50px',
      }
    ]);

    assert.deepEqual(element.description.attrs, {
      name: 'name',
      noValidate: 'false',
      minLength: '50px',
    });
    assert.equal(element.ref.attributes['name'].value, 'name');
    assert.equal(element.ref.attributes['novalidate'].value, 'false');
    assert.equal(element.ref.attributes['minlength'].value, '50px');

    // when
    Patch.removeAttribute('name', element).apply();
    Patch.removeAttribute('noValidate', element).apply();
    Patch.removeAttribute('minLength', element).apply();

    // then
    assert.equal(element.description.attrs, undefined);
    assert.deepEqual(element.ref.attributes, {});
  });

  it('adds data attributes', () => {

    // given
    const element = createFromTemplate([
      'div',
    ]);

    // when
    Patch.addDataAttribute('id', '10', element).apply();
    Patch.addDataAttribute('customAttribute', 'true', element).apply();

    // then
    assert.equal(Object.entries(element.description.dataset).length, 2);
    const dataset = {
      id: '10',
      customAttribute: 'true',
    };
    assert.deepEqual(element.description.dataset, dataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.id, '10');
    assert.equal(element.ref.dataset.customAttribute, 'true');

    assert.equal(element.ref.getAttribute('data-id'), '10');
    assert.equal(element.ref.getAttribute('data-custom-attribute'), 'true');
  });

  it('replaces data attributes', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        dataset: {
          toolkitId: 15,
          someName: 'Some Name',
        },
      },
    ]);

    const dataset = {
      toolkitId: '15',
      someName: 'Some Name',
    };
    assert.deepEqual(element.description.dataset, dataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.toolkitId, '15');
    assert.equal(element.ref.dataset.someName, 'Some Name');

    assert.equal(element.ref.getAttribute('data-toolkit-id'), '15');
    assert.equal(element.ref.getAttribute('data-some-name'), 'Some Name');

    // when
    Patch.replaceDataAttribute('toolkitId', '23', element).apply();
    Patch.replaceDataAttribute('someName', 'Other Name', element).apply();

    // then
    assert.equal(Object.entries(element.description.dataset).length, 2);
    const nextDataset = {
      toolkitId: '23',
      someName: 'Other Name',
    };
    assert.deepEqual(element.description.dataset, nextDataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.toolkitId, '23');
    assert.equal(element.ref.dataset.someName, 'Other Name');

    assert.equal(element.ref.getAttribute('data-toolkit-id'), '23');
    assert.equal(element.ref.getAttribute('data-some-name'), 'Other Name');
  });

  it('removes data attribute', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        dataset: {
          name: 'name',
          anything: 'true',
        },
      },
    ]);

    assert.equal(Object.entries(element.description.dataset).length, 2);
    const dataset = {
      name: 'name',
      anything: 'true',
    };
    assert.deepEqual(element.description.dataset, dataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.name, 'name');
    assert.equal(element.ref.dataset.anything, 'true');

    // when
    Patch.removeDataAttribute('name', element).apply();
    Patch.removeDataAttribute('anything', element).apply();

    // then
    assert.equal(element.description.dataset, undefined);
  });

  it('adds style property', () => {

    // given
    const element = createFromTemplate(['div']);

    // when
    Patch.addStyleProperty('color', 'black', element).apply();

    // then
    assert.equal(element.description.style.color, 'black');
    assert.equal(element.ref.style.color, 'black');
  });

  it('replaces style property', () => {

    // given
    const element = createFromTemplate([
      'div', {
        style: {
          textDecoration: 'underline',
        },
      }
    ]);

    assert.equal(element.description.style.textDecoration, 'underline');
    assert.equal(element.ref.style.textDecoration, 'underline');

    // when
    Patch.replaceStyleProperty('textDecoration', 'overline', element).apply();

    // then
    assert.equal(element.description.style.textDecoration, 'overline');
    assert.equal(element.ref.style.textDecoration, 'overline');
  });

  it('removes style property', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        style: {
          visibility: 'hidden',
        },
      },
    ]);

    assert.equal(element.description.style.visibility, 'hidden');
    assert.equal(element.ref.style.visibility, 'hidden');

    // when
    Patch.removeStyleProperty('visibility', element).apply();

    // then
    assert.equal(element.description.style, undefined);
    assert.equal(element.ref.style.visibility, '');
  });

  it('adds class name', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        class: {},
      },
    ]);

    assert.equal(element.description.class, undefined);
    assert.deepEqual([...element.ref.classList], []);

    // when
    Patch.setClassName('test', element).apply();

    // then
    assert.deepEqual(element.description.class, 'test');
    assert.deepEqual([...element.ref.classList], ['test']);
  });

  it('removes class name', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        class: 'test',
      },
    ]);

    assert.equal(element.description.class, 'test');
    assert.deepEqual([...element.ref.classList], ['test']);

    // when
    Patch.setClassName('', element).apply();

    // then
    assert.equal(element.description.class, '');
    assert.deepEqual([...element.ref.classList], []);
  });

  it('adds listener', () => {

    // given
    const element = createFromTemplate(['div']);
    const onClick = () => {};

    // when
    Patch.addListener('onClick', onClick, element).apply();

    // then
    assert.equal(element.description.listeners.onClick, onClick);
    typeof window !== 'object' &&
        assert.deepEqual(element.ref.eventListeners_.click, [onClick]);
  });

  it('replaces listener', () => {

    // given
    const doSomething = () => {};
    const doSomethingElse = () => {};
    const element = createFromTemplate([
      'div',
      {
        onClick: doSomething,
      },
    ]);

    // then
    assert.equal(element.description.listeners.onClick, doSomething);
    typeof window !== 'object' &&
        assert.deepEqual(element.ref.eventListeners_.click, [doSomething]);

    // when
    Patch.replaceListener('onClick', doSomething, doSomethingElse, element)
        .apply();

    // then
    assert.equal(element.description.listeners.onClick, doSomethingElse);
    typeof window !== 'object' &&
        assert.deepEqual(element.ref.eventListeners_.click, [doSomethingElse]);
  });

  it('removes listener', () => {

    // given
    const onClick = () => {};
    const element = createFromTemplate(['div', {onClick}]);

    // then
    assert.equal(element.description.listeners.onClick, onClick);
    typeof window !== 'object' &&
        assert.deepEqual(element.ref.eventListeners_.click, [onClick]);

    // when
    Patch.removeListener('onClick', onClick, element).apply();

    // then
    assert.equal(element.description.listeners, undefined);
    typeof window !== 'object' &&
        assert.deepEqual(element.ref.eventListeners_.click, []);
  });

  it('sets property', () => {

    // given
    const element = createFromTemplate(['div']);

    assert.equal(element.description.properties, undefined);
    assert.equal(element.ref.customAttribute, undefined);

    // when
    Patch.setProperty('customAttribute', 'customValue', element).apply();

    // then
    assert.equal(element.description.properties.customAttribute, 'customValue');
    assert.equal(element.ref.customAttribute, 'customValue');
  });

  it('deletes property', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        properties: {
          customAttribute: 'customValue',
        },
      },
    ]);

    assert.equal(element.description.properties.customAttribute, 'customValue');
    assert.equal(element.ref.customAttribute, 'customValue');

    // when
    Patch.deleteProperty('customAttribute', element).apply();

    // then
    assert.equal(element.description.properties, undefined);
    assert.equal(element.ref.customAttribute, undefined);
  });

  it('replaces property', () => {

    // given
    const element = createFromTemplate([
      'div',
      {
        properties: {
          customAttribute: 'customValue',
        },
      },
    ]);

    assert.equal(element.description.properties.customAttribute, 'customValue');
    assert.equal(element.ref.customAttribute, 'customValue');

    // when
    Patch.setProperty('customAttribute', 'anotherValue', element).apply();

    // then
    assert.equal(element.description.properties.customAttribute, 'anotherValue');
    assert.equal(element.ref.customAttribute, 'anotherValue');
  });

  it('inserts child node', () => {

    // given
    const element = createFromTemplate([
      'div',
      [
        'span',
      ],
      [
        'span',
      ],
      [
        'span',
      ],
    ]);
    const link = createElement('a');

    // then
    assert.equal(element.children.length, 3);
    assert.equal(element.ref.childNodes.length, 3);

    // when
    Patch.insertChildNode(link, 0, element).apply();

    // then
    assert.equal(element.children.length, 4);
    assert.equal(element.ref.childNodes.length, 4);

    assert.equal(element.children[0], link);
    assert(link.ref);
    assert.equal(element.ref.firstElementChild, link.ref);
  });

  describe('move child node', () => {

    const Component = class extends opr.Toolkit.Component {
      render() {
        return this.children[0] || null;
      }
    };

    it('moves element', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
        [
          'div',
        ],
        [
          'span',
        ],
      ]);
      const paragraph = element.children[0];

      // then
      assert.equal(element.children.length, 3);
      assert.equal(element.ref.childNodes.length, 3);

      // when
      Patch.moveChildNode(paragraph, 0, 2, element).apply();

      // then
      assert.equal(element.children.length, 3);
      assert.equal(element.ref.childNodes.length, 3);

      assert.equal(element.children[0].description.name, 'div');
      assert.equal(element.ref.childNodes[0].tagName, 'DIV');

      assert.equal(element.children[1].description.name, 'span');
      assert.equal(element.ref.childNodes[1].tagName, 'SPAN');

      assert.equal(element.children[2].description.name, 'p');
      assert.equal(element.ref.childNodes[2].tagName, 'P');
    });

    it('moves component with child element', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
        [
          Component,
          [
            'section',
          ],
        ],
        ['span'],
      ]);
      const component = element.children[1];

      // then
      assert.equal(element.children.length, 3);
      assert.equal(element.ref.childNodes.length, 3);

      // when
      Patch.moveChildNode(component, 1, 0, element).apply();

      // then
      assert.equal(element.children.length, 3);
      assert.equal(element.ref.childNodes.length, 3);

      assert.equal(element.children[0].constructor, Component);
      assert.equal(element.ref.childNodes[0].tagName, 'SECTION');

      assert.equal(element.children[1].description.name, 'p');
      assert.equal(element.ref.childNodes[1].tagName, 'P');

      assert.equal(element.children[2].description.name, 'span');
      assert.equal(element.ref.childNodes[2].tagName, 'SPAN');
    });

    it('moves empty component', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          Component,
        ],
        [
          'span',
        ],
      ]);
      const component = element.children[0];

      // then
      assert.equal(element.children.length, 2);
      assert.equal(element.ref.childNodes.length, 2);

      // when
      Patch.moveChildNode(component, 0, 1, element).apply();

      // then
      assert.equal(element.children.length, 2);
      assert.equal(element.ref.childNodes.length, 2);

      assert.equal(element.children[0].description.name, 'span');
      assert.equal(element.ref.childNodes[0].tagName, 'SPAN');

      assert.equal(element.children[1].constructor, Component);
      assert(element.ref.childNodes[1].textContent.includes('Component'));
    });
  });

  describe('replace child node', () => {

    const Component = class extends opr.Toolkit.Component {
      render() {
        return ['component'];
      }
    };

    it('replaces element with component', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
      ]);
      const child = element.children[0];

      const component = createFromTemplate([
        Component,
      ]);

      // when
      Patch.replaceChildNode(child, component, element).apply();

      // then
      assert.equal(element.children[0], component);
      assert.equal(element.children[0].ref.tagName, 'COMPONENT');
    });

    it('replaces element with element', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
      ]);
      const child = element.children[0];

      const span = createFromTemplate([
        'span',
      ]);

      // when
      Patch.replaceChildNode(child, span, element).apply();

      // then
      assert.equal(element.children[0], span);
      assert.equal(element.children[0].ref.tagName, 'SPAN');
    });

    it('replaces component with component', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          Component,
        ],
      ]);
      const child = element.children[0];

      const component = createFromTemplate([
        Component,
      ]);

      // when
      Patch.replaceChildNode(child, component, element).apply();

      // then
      assert.equal(element.children[0], component);
      assert.equal(element.children[0].ref.tagName, 'COMPONENT');
    });

    it('replaces component with element', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          Component,
        ],
      ]);
      const child = element.children[0];

      const span = createFromTemplate([
        'span',
      ]);

      // when
      Patch.replaceChildNode(child, span, element).apply();

      // then
      assert.equal(element.children[0], span);
      assert.equal(element.children[0].ref.tagName, 'SPAN');
    });
  });

  describe('remove child node', () => {

    const Component = class extends opr.Toolkit.Component {
      render() {
        return this.children[0] || null;
      }
    };

    it('removes element', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
        [
          'div',
        ],
        [
          'span',
        ],
      ]);
      const div = element.children[1];

      // then
      assert.equal(element.children.length, 3);
      assert.equal(element.ref.childNodes.length, 3);

      // when
      Patch.removeChildNode(div, 1, element).apply();

      // then
      assert.equal(element.children.length, 2);
      assert.equal(element.ref.childNodes.length, 2);

      assert.equal(element.children[0].description.name, 'p');
      assert.equal(element.ref.childNodes[0].tagName, 'P');

      assert.equal(element.children[1].description.name, 'span');
      assert.equal(element.ref.childNodes[1].tagName, 'SPAN');
    });

    it('removes component with child element', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
        [
          Component,
          [
            'span',
          ],
        ],
      ]);
      const component = element.children[1];

      // then
      assert.equal(element.children.length, 2);
      assert.equal(element.ref.childNodes.length, 2);

      assert.equal(element.children[1].constructor, Component);
      assert.equal(element.ref.childNodes[1].tagName, 'SPAN');

      // when
      Patch.removeChildNode(component, 1, element).apply();

      // then
      assert.equal(element.children.length, 1);
      assert.equal(element.ref.childNodes.length, 1);
    });

    it('removes empty component', () => {

      // given
      const element = createFromTemplate([
        'div',
        [
          'p',
        ],
        [
          Component,
        ],
      ]);
      const component = element.children[1];

      // then
      assert.equal(element.children.length, 2);
      assert.equal(element.ref.childNodes.length, 2);

      assert.equal(element.children[1].constructor, Component);
      assert(element.ref.childNodes[1].textContent.includes('Component'));

      // when
      Patch.removeChildNode(component, 1, element).apply();

      // then
      assert.equal(element.children.length, 1);
      assert.equal(element.ref.childNodes.length, 1);
    });
  });

  it('sets text content', () => {

    // given
    const element = createFromTemplate([
      'div',
      'one',
    ]);

    assert.equal(element.description.text, 'one');
    assert.equal(element.ref.textContent, 'one');

    // when
    Patch.setTextContent(element, 'two').apply();

    // then
    assert.equal(element.description.text, 'two');
    assert.equal(element.ref.textContent, 'two');
  });

  it('removes text content', () => {

    // given
    const element = createFromTemplate([
      'div',
      'one',
    ]);

    assert.equal(element.description.text, 'one');
    assert.equal(element.ref.textContent, 'one');

    // when
    Patch.removeTextContent(element).apply();

    // then
    assert.equal(element.description.text, null);
    assert.equal(element.ref.textContent, '');
  });
});
