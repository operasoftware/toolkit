describe('Patch element => apply', () => {

  const Patch = opr.Toolkit.Patch;
  const Document = opr.Toolkit.Document;
  const VirtualDOM = opr.Toolkit.VirtualDOM;

  const createElement = name => new opr.Toolkit.VirtualElement({name});

  it('adds attribute', () => {

    // given
    const element = utils.createFromTemplate(['div']);

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
    assert.equal(element.ref.attributes['name'].value, 'value');
    assert.equal(element.ref.attributes['novalidate'].value, 'true');
    assert.equal(element.ref.attributes['minlength'].value, '100px');
  });

  it('replaces attribute', () => {

    // given
    const element = utils.createFromTemplate([
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
    assert.equal(element.ref.attributes['name'].value, 'name');
    assert.equal(element.ref.attributes['novalidate'].value, 'false');
    assert.equal(element.ref.attributes['minlength'].value, '50px');

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
    assert.equal(element.ref.attributes['name'].value, 'value');
    assert.equal(element.ref.attributes['novalidate'].value, 'true');
    assert.equal(element.ref.attributes['minlength'].value, '100px');
  });

  it('removes attribute', () => {

    // given
    const element = utils.createFromTemplate([
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
    assert.equal(element.ref.attributes['name'].value, 'name');
    assert.equal(element.ref.attributes['novalidate'].value, 'false');
    assert.equal(element.ref.attributes['minlength'].value, '50px');

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
    const element = utils.createFromTemplate([
      'div',
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

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.id, '10');
    assert.equal(element.ref.dataset.customAttribute, 'true');

    assert.equal(element.ref.getAttribute('data-id'), '10');
    assert.equal(element.ref.getAttribute('data-custom-attribute'), 'true');
  });

  it('replaces data attributes', () => {

    // given
    const element = utils.createFromTemplate([
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
    assert.deepEqual(element.dataset, dataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.toolkitId, '15');
    assert.equal(element.ref.dataset.someName, 'Some Name');

    assert.equal(element.ref.getAttribute('data-toolkit-id'), '15');
    assert.equal(element.ref.getAttribute('data-some-name'), 'Some Name');

    // when
    Patch.replaceDataAttribute('toolkitId', '23', element).apply();
    Patch.replaceDataAttribute('someName', 'Other Name', element).apply();

    // then
    assert.equal(Object.entries(element.dataset).length, 2);
    const nextDataset = {
      toolkitId: '23',
      someName: 'Other Name',
    };
    assert.deepEqual(element.dataset, nextDataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.toolkitId, '23');
    assert.equal(element.ref.dataset.someName, 'Other Name');

    assert.equal(element.ref.getAttribute('data-toolkit-id'), '23');
    assert.equal(element.ref.getAttribute('data-some-name'), 'Other Name');
  });

  it('removes data attribute', () => {

    // given
    const element = utils.createFromTemplate([
      'div',
      {
        dataset: {
          name: 'name',
          anything: 'true',
        },
      },
    ]);

    assert.equal(Object.entries(element.dataset).length, 2);
    const dataset = {
      name: 'name',
      anything: 'true',
    };
    assert.deepEqual(element.dataset, dataset);

    assert.equal(Object.keys(element.ref.dataset).length, 2);
    assert.equal(element.ref.dataset.name, 'name');
    assert.equal(element.ref.dataset.anything, 'true');

    // when
    Patch.removeDataAttribute('name', element).apply();
    Patch.removeDataAttribute('anything', element).apply();

    // then
    assert.equal(Object.keys(element.dataset).length, 0);
    assert.deepEqual(element.dataset, {});
  });

  it('adds style property', () => {

    // given
    const element = utils.createFromTemplate(['div']);

    // when
    Patch.addStyleProperty('color', 'black', element).apply();

    // then
    assert.equal(element.style.color, 'black');
    assert.equal(element.ref.style.color, 'black');
  });

  it('replaces style property', () => {

    // given
    const element = utils.createFromTemplate([
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
    const element = utils.createFromTemplate([
      'div',
      {
        style: {
          visibility: 'hidden',
        },
      },
    ]);

    assert.equal(element.style.visibility, 'hidden');
    assert.equal(element.ref.style.visibility, 'hidden');

    // when
    Patch.removeStyleProperty('visibility', element).apply();

    // then
    assert.equal(element.style.visibility, undefined);
    assert.equal(element.ref.style.visibility, '');
  });

  it('adds class name', () => {

    // given
    const element = utils.createFromTemplate([
      'div',
      {
        class: {},
      },
    ]);

    assert.deepEqual(element.className, '');
    assert.deepEqual([...element.ref.classList], []);

    // when
    Patch.setClassName('test', element).apply();

    // then
    assert.deepEqual(element.className, 'test');
    assert.deepEqual([...element.ref.classList], ['test']);
  });

  it('removes class name', () => {

    // given
    const element = utils.createFromTemplate([
      'div',
      {
        class: 'test',
      },
    ]);

    assert.equal(element.className, 'test');
    assert.deepEqual([...element.ref.classList], ['test']);

    // when
    Patch.setClassName('', element).apply();

    // then
    assert.deepEqual(element.className, '');
    assert.deepEqual([...element.ref.classList], []);
  });

  it('adds listener', () => {

    // given
    const element = utils.createFromTemplate(['div']);
    const onClick = () => {};

    // when
    Patch.addListener('onClick', onClick, element).apply();

    // then
    assert.equal(element.listeners.onClick, onClick);
    !(global.window) &&
        assert.deepEqual(element.ref.eventListeners_.click, [onClick]);
  });

  it('replaces listener', () => {

    // given
    const doSomething = () => {};
    const doSomethingElse = () => {};
    const element = utils.createFromTemplate([
      'div',
      {
        onClick: doSomething,
      },
    ]);

    // then
    assert.equal(element.listeners.onClick, doSomething);
    !(global.window) &&
        assert.deepEqual(element.ref.eventListeners_.click, [doSomething]);

    // when
    Patch.replaceListener('onClick', doSomething, doSomethingElse, element)
        .apply();

    // then
    assert.equal(element.listeners.onClick, doSomethingElse);
    !(global.window) &&
        assert.deepEqual(element.ref.eventListeners_.click, [doSomethingElse]);
  });

  it('removes listener', () => {

    // given
    const onClick = () => {};
    const element = utils.createFromTemplate(['div', {onClick}]);

    // then
    assert.equal(element.listeners.onClick, onClick);
    !(global.window) &&
        assert.deepEqual(element.ref.eventListeners_.click, [onClick]);

    // when
    Patch.removeListener('onClick', onClick, element).apply();

    // then
    assert.equal(element.listeners.click, undefined);
    !(global.window) && assert.deepEqual(element.ref.eventListeners_.click, []);
  });

  it('adds metadata', () => {

    // given
    const element = utils.createFromTemplate(['div']);

    assert.equal(element.metadata.customAttribute, undefined);
    assert.equal(element.ref.customAttribute, undefined);

    // when
    Patch.addMetadata('customAttribute', 'customValue', element).apply();

    // then
    assert.equal(element.metadata.customAttribute, 'customValue');
    assert.equal(element.ref.customAttribute, 'customValue');
  });

  it('removes metadata', () => {

    // given
    const element = utils.createFromTemplate(
        ['div', {metadata: {customAttribute: 'customValue'}}]);

    assert.equal(element.metadata.customAttribute, 'customValue');
    assert.equal(element.ref.customAttribute, 'customValue');

    // when
    Patch.removeMetadata('customAttribute', element).apply();

    // then
    assert.equal(element.metadata.customAttribute, undefined);
    assert.equal(element.ref.customAttribute, undefined);
  });

  it('replaces metadata', () => {

    // given
    const element = utils.createFromTemplate(
        ['div', {metadata: {customAttribute: 'customValue'}}]);

    assert.equal(element.metadata.customAttribute, 'customValue');
    assert.equal(element.ref.customAttribute, 'customValue');

    // when
    Patch.replaceMetadata('customAttribute', 'anotherValue', element).apply();

    // then
    assert.equal(element.metadata.customAttribute, 'anotherValue');
    assert.equal(element.ref.customAttribute, 'anotherValue');
  });

  it('inserts child node', () => {

    // given
    const element = utils.createFromTemplate([
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

    const Component = Symbol.for('Component');

    const ComponentClass = class extends opr.Toolkit.Component {
      render() {
        return this.children[0] || null;
      }
    };

    beforeEach(() => {
      sinon.stub(VirtualDOM, 'getComponentClass', symbol => {
        switch (symbol) {
          case 'Component':
          case Component:
            return ComponentClass;
          default:
            throw new Error('Unknown definition: ' + symbol);
        }
      });
    });

    afterEach(() => {
      VirtualDOM.getComponentClass.restore();
    });

    it('moves element', () => {

      // given
      const element = utils.createFromTemplate([
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

      assert.equal(element.children[0].name, 'div');
      assert.equal(element.ref.childNodes[0].tagName, 'DIV');

      assert.equal(element.children[1].name, 'span');
      assert.equal(element.ref.childNodes[1].tagName, 'SPAN');

      assert.equal(element.children[2].name, 'p');
      assert.equal(element.ref.childNodes[2].tagName, 'P');
    });

    it('moves component with child element', () => {

      // given
      const element = utils.createFromTemplate([
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

      assert.equal(element.children[0].constructor, ComponentClass);
      assert.equal(element.ref.childNodes[0].tagName, 'SECTION');

      assert.equal(element.children[1].name, 'p');
      assert.equal(element.ref.childNodes[1].tagName, 'P');

      assert.equal(element.children[2].name, 'span');
      assert.equal(element.ref.childNodes[2].tagName, 'SPAN');
    });

    it('moves empty component', () => {

      // given
      const element = utils.createFromTemplate([
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

      assert.equal(element.children[0].name, 'span');
      assert.equal(element.ref.childNodes[0].tagName, 'SPAN');

      assert.equal(element.children[1].constructor, ComponentClass);
      assert(element.ref.childNodes[1].textContent.includes('ComponentClass'));
    });
  });

  describe('replace child node', () => {

    const Component = Symbol('Component');

    const ComponentClass = class extends opr.Toolkit.Component {
      render() {
        return ['component'];
      }
    };

    beforeEach(() => {
      sinon.stub(VirtualDOM, 'getComponentClass', symbol => ComponentClass);
    });

    afterEach(() => {
      VirtualDOM.getComponentClass.restore();
    });

    it('replaces element with component', () => {

      // given
      const element = utils.createFromTemplate([
        'div',
        [
          'p',
        ],
      ]);
      const child = element.children[0];

      const component = utils.createFromTemplate([
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
      const element = utils.createFromTemplate([
        'div',
        [
          'p',
        ],
      ]);
      const child = element.children[0];

      const span = utils.createFromTemplate([
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
      const element = utils.createFromTemplate([
        'div',
        [
          Component,
        ],
      ]);
      const child = element.children[0];

      const component = utils.createFromTemplate([
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
      const element = utils.createFromTemplate([
        'div',
        [
          Component,
        ],
      ]);
      const child = element.children[0];

      const span = utils.createFromTemplate([
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

    const Component = Symbol('Component');

    const ComponentClass = class extends opr.Toolkit.Component {
      render() {
        return this.children[0] || null;
      }
    };

    beforeEach(() => {
      sinon.stub(VirtualDOM, 'getComponentClass', symbol => {
        switch (symbol) {
          case 'Component':
          case Component:
            return ComponentClass;
          default:
            throw new Error('Unknown definition: ' + symbol);
        }
      });
    });

    afterEach(() => {
      VirtualDOM.getComponentClass.restore();
    });

    it('removes element', () => {

      // given
      const element = utils.createFromTemplate([
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

      assert.equal(element.children[0].name, 'p');
      assert.equal(element.ref.childNodes[0].tagName, 'P');

      assert.equal(element.children[1].name, 'span');
      assert.equal(element.ref.childNodes[1].tagName, 'SPAN');
    });

    it('removes component with child element', () => {

      // given
      const element = utils.createFromTemplate([
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

      assert.equal(element.children[1].constructor, ComponentClass);
      assert.equal(element.ref.childNodes[1].tagName, 'SPAN');

      // when
      Patch.removeChildNode(component, 1, element).apply();

      // then
      assert.equal(element.children.length, 1);
      assert.equal(element.ref.childNodes.length, 1);
    });

    it('removes empty component', () => {

      // given
      const element = utils.createFromTemplate([
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

      assert.equal(element.children[1].constructor, ComponentClass);
      assert(element.ref.childNodes[1].textContent.includes('ComponentClass'));

      // when
      Patch.removeChildNode(component, 1, element).apply();

      // then
      assert.equal(element.children.length, 1);
      assert.equal(element.ref.childNodes.length, 1);
    });
  });

  it('sets text content', () => {

    // given
    const element = utils.createFromTemplate([
      'div',
      'one',
    ]);

    assert.equal(element.text, 'one');
    assert.equal(element.ref.textContent, 'one');

    // when
    Patch.setTextContent(element, 'two').apply();

    // then
    assert.equal(element.text, 'two');
    assert.equal(element.ref.textContent, 'two');
  });

  it('removes text content', () => {

    // given
    const element = utils.createFromTemplate([
      'div',
      'one',
    ]);

    assert.equal(element.text, 'one');
    assert.equal(element.ref.textContent, 'one');

    // when
    Patch.removeTextContent(element).apply();

    // then
    assert.equal(element.text, null);
    assert.equal(element.ref.textContent, '');
  });
});
