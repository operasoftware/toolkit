describe('Template => describe', () => {

  const Template = opr.Toolkit.Template;

  suppressConsoleErrors();

  it('detects component', () => {

    // given
    const component = Symbol.for('Component');
    const template = [component];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'component');
    assert.equal(description.symbol, 'Component');
  });

  it('detects component with properties', () => {

    // given
    const component = Symbol.for('Component');
    const props = {
      prop: 'prop',
    };
    const template = [component, props];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'component');
    assert.equal(description.symbol, 'Component');
    assert.equal(description.props, props);
  });

  it('detects component with child nodes', () => {

    // given
    const component = Symbol.for('Component');
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [component, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'component');
    assert.equal(description.symbol, 'Component');
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects component with filtered child nodes', () => {

    // given
    const component = Symbol.for('component');
    const children = [
      null,
      false,
      ['div'],
      ['span'],
    ];
    const template = [component, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'component');
    assert.equal(description.symbol, 'component');
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects component with properties and child nodes', () => {

    // given
    const component = Symbol.for('component');
    const props = {
      prop: 'prop',
    };
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [component, props, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'component');
    assert.equal(description.symbol, 'component');
    assert.equal(description.props, props);
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects component with properties and filtered child nodes', () => {

    // given
    const component = Symbol.for('component');
    const props = {prop: 'prop'};
    const children = [
      false,
      ['div'],
      null,
      ['span'],
      null,
    ];
    const template = [component, props, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'component');
    assert.equal(description.symbol, 'component');
    assert.equal(description.props, props);
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects empty element', () => {

    // given
    const template = ['div'];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
  });

  it('detects empty element with properties', () => {

    // given
    const props = {
      id: 'some-id',
    };
    const template = [
      'div',
      props,
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.deepEqual(description.props, {
      attrs: props,
    });
  });

  it('detects text element', () => {

    // given
    const name = 'div';
    const text = 'text';
    const template = [name, text];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.equal(description.text, 'text');
  });

  it('detects text element with properties', () => {

    // given
    const name = 'div';
    const text = 'text';
    const props = {name: 'name'};
    const template = [name, props, text];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.deepEqual(description.props, {
      attrs: props,
    })
    assert.equal(description.text, 'text');
  });

  it('detects element with child nodes', () => {

    // given
    const name = 'div';
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [name, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects element with filtered child nodes', () => {

    // given
    const name = 'div';
    const children = [
      ['div'],
      null,
      ['span'],
      null,
    ];
    const template = [name, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects element with properties and child nodes', () => {

    // given
    const name = 'div';
    const onClick = () => {};
    const props = {
      tabIndex: 10,
      onClick,
    };
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [name, props, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.deepEqual(description.props, {
      attrs: {
        tabIndex: '10',  // TODO: should be a number (?)
      },
      listeners: {
        onClick,
      },
    });
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('detects element with properties and filtered child nodes', () => {

    // given
    const name = 'div';
    const props = {
      id: 'id',
    };
    const children = [
      false,
      null,
      ['div'],
      ['span'],
      null,
    ];
    const template = [name, props, ...children];

    // when
    const description = Template.describe(template);

    // then
    assert.equal(description.type, 'element');
    assert.equal(description.name, 'div');
    assert.deepEqual(description.props, {
      attrs: {
        id: 'id',
      },
    });
    assert.equal(description.children.length, 2);
    assert.equal(description.children[0][0], 'div');
    assert.equal(description.children[1][0], 'span');
  });

  it('returns null description for null template', () => {

    // when
    const description = Template.describe(null);

    // then
    assert.equal(description, null);
  });

  it('returns null description for false template', () => {

    // when
    const description = Template.describe(false);

    // then
    assert.equal(description, null);
  });

  it('rejects invalid template', () => {
    assert.throws(() => {
      Template.describe(5);
    });
  });

});
