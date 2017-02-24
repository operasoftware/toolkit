const Template = require('../src/core/template.js');

describe('Template => describe', () => {

  it('detects component', () => {

    // given
    const component = Symbol.for('component');
    const template = [
      component
    ];

    // when
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
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
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
      component,
      props
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
      ['span']
    ];
    const template = [
      component, props, ...children
    ];

    // when
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
      component,
      props,
      children
    });
  });

  it('detects empty element', () => {

    // given
    const template = [
      'div'
    ];

    // when
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
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
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
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
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
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
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
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
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
      name,
      children
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
    const definition = Template.describe(template);

    // then
    assert.deepEqual(definition, {
      name,
      props,
      children
    });
  });

  it('rejects invalid template', () => {
    assert.throws(() => {
      Template.describe(null);
    });
  });
});