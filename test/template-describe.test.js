describe('Template => describe', () => {

  const Template = opr.Toolkit.Template;;

  suppressConsoleErrors();

  it('detects component', () => {

    // given
    const component = Symbol.for('component');
    const template = [
      component
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      component
    });
  });

  it('detects component with properties', () => {

    // given
    const component = Symbol.for('component');
    const props = {
      prop: 'prop'
    };
    const template = [
      component, props
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      component,
      props
    });
  });

  it('detects component with child nodes', () => {

    // given
    const component = Symbol.for('component');
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [
      component, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      component,
      children,
    });
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
    const template = [
      component, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      component,
      children: [
        ['div'],
        ['span'],
      ]
    });
  });

  it('detects component with properties and child nodes', () => {

    // given
    const component = Symbol.for('component');
    const props = {
      prop: 'prop'
    };
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [
      component, props, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      component,
      props,
      children,
    });
  });

  it('detects component with properties and filtered child nodes', () => {

    // given
    const component = Symbol.for('component');
    const props = {
      prop: 'prop'
    };
    const children = [
      false,
      ['div'],
      null,
      ['span'],
      null,
    ];
    const template = [
      component, props, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      component,
      props,
      children: [
        ['div'],
        ['span'],
      ]
    });
  });

  it('detects empty element', () => {

    // given
    const template = [
      'div'
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name: 'div'
    });
  });

  it('detects empty element with properties', () => {

    // given
    const props = {
      prop: 'prop'
    };
    const template = [
      'div', props
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name: 'div',
      props
    });
  });

  it('detects text element', () => {

    // given
    const name = 'div';
    const text = 'text';
    const template = [
      name, text
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name,
      text
    });
  });

  it('detects text element with properties', () => {

    // given
    const name = 'div';
    const text = 'text';
    const props = {
      prop: 'prop'
    };
    const template = [
      name, props, text
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name,
      props,
      text
    });
  });

  it('detects element with child nodes', () => {

    // given
    const name = 'div';
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [
      name, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name,
      children
    });
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
    const template = [
      name, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name,
      children: [
        ['div'],
        ['span'],
      ]
    });
  });

  it('detects element with properties and child nodes', () => {

    // given
    const name = 'div';
    const props = {
      prop: 'prop'
    };
    const children = [
      ['div'],
      ['span'],
    ];
    const template = [
      name, props, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name,
      props,
      children
    });
  });

  it('detects element with properties and filtered child nodes', () => {

    // given
    const name = 'div';
    const props = {
      prop: 'prop'
    };
    const children = [
      false,
      null,
      ['div'],
      ['span'],
      null,
    ];
    const template = [
      name, props, ...children
    ];

    // when
    const description = Template.describe(template);

    // then
    assert.deepEqual(description, {
      name,
      props,
      children: [
        ['div'],
        ['span'],
      ]
    });
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
