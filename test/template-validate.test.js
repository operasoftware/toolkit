const Template = require('../src/core/template.js');

describe('Template => validate', () => {

  beforeEach(() => {
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore(console);
  });

  it('accepts an empty element', () => {

    // given
    const template = [
      'span'
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string']
    });
    assert(!console.error.called);
  });

  it('accepts an empty element with properties', () => {

    // given
    const template = [
      'span', {}
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'props']
    });
    assert(!console.error.called);
  });

  it('accepts a text element', () => {

    // given
    const template = [
      'span', 'Text'
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'string']
    });
    assert(!console.error.called);
  });

  it('accepts a text element with properties', () => {

    // given
    const template = [
      'span', {}, 'Text'
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'props', 'string']
    });
    assert(!console.error.called);
  });

  it('accepts an element with a single child', () => {

    // given
    const template = [
      'div', [
        'span'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts an element with multiple children', () => {

    // given
    const template = [
      'div', [
        'span', '1'
      ],
      [
        'span', '2'
      ],
      [
        'span', '3'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'element', 'element', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts an element with properties and a single child', () => {

    // given
    const template = [
      'div', {},
      [
        'span'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'props', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts an element with properties and multiple children', () => {

    // given
    const template = [
      'div', {},
      [
        'span', '1'
      ],
      [
        'span', '2'
      ],
      [
        'span', '3'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['string', 'props', 'element', 'element', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts a subcomponent', () => {


    // given
    const component = Symbol.for('component');
    const template = [
      component
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['component']
    });
    assert(!console.error.called);
  });

  it('accepts a subcomponent with a single child', () => {


    // given
    const component = Symbol.for('component');
    const template = [
      component, [
        'span'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['component', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts a subcomponent with multiple children', () => {


    // given
    const component = Symbol.for('component');
    const template = [
      component, [
        'span', '1'
      ],
      [
        'span', '2'
      ],
      [
        'span', '3'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['component', 'element', 'element', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts a subcomponent with properties', () => {


    // given
    const component = Symbol.for('component');
    const template = [
      component, {}
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['component', 'props']
    });
    assert(!console.error.called);
  });

  it('accepts a subcomponent with properties and a single child', () => {


    // given
    const component = Symbol.for('component');
    const template = [
      component, {},
      [
        'span'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['component', 'props', 'element']
    });
    assert(!console.error.called);
  });

  it('accepts a subcomponent with properties and multiple children', () => {

    // given
    const component = Symbol.for('component');
    const template = [
      component, {},
      [
        'span', '1'
      ],
      [
        'span', '2'
      ],
      [
        'span', '3'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert.deepEqual(result, {
      types: ['component', 'props', 'element', 'element', 'element']
    });
    assert(!console.error.called);
  });

  it('rejects a number as a parameter', () => {

    // when
    const result = Template.validate([5]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Invalid parameter type "number" at index 0');
    assert(console.error.called);
  });

  it('rejects a boolean as a parameter', () => {

    // when
    const result = Template.validate([true]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Invalid parameter type "boolean" at index 0');
    assert(console.error.called);
  });

  it('rejects null as a parameter', () => {

    // when
    const result = Template.validate([null]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Invalid parameter type "null" at index 0');
    assert(console.error.called);
  });

  it('rejects function as a parameter', () => {

    // when
    const result = Template.validate([() => {}]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Invalid parameter type "function" at index 0');
    assert(console.error.called);
  });

  it('rejects undefined as a parameter', () => {

    // when
    const result = Template.validate([undefined]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Invalid parameter type "undefined" at index 0');
    assert(console.error.called);
  });

  it('rejects second parameter', () => {

    // when
    const result = Template.validate(['span', null]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message,
      'Invalid parameter type "null" at index 1, ' +
      'expecting: properties object, text content or first child element');
    assert(console.error.called);
  });

  it('rejects third parameter', () => {

    // when
    const result = Template.validate(['span', {}, () => {}]);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Invalid parameter type "function" at index 2');
    assert(console.error.called);
  });

  it('rejects a text element with child nodes', () => {

    // given
    const template = [
      'div', 'Text', [
        'span', '1'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Text elements cannot have child nodes');
    assert(console.error.called);
  });

  it('rejects a text element with properties and child nodes', () => {

    // given
    const template = [
      'div', {}, 'Text', [
        'span', '1'
      ]
    ];

    // when
    const result = Template.validate(template);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Text elements cannot have child nodes');
    assert(console.error.called);
  });

  it('rejects a subcomponent with text content', () => {

    // given
    const component = Symbol.for('component');
    const template = [
      component, 'Text'
    ];

    // when
    const result = Template.validate(template);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Subcomponents do not accept text content');
    assert(console.error.called);
  });

  it('rejects a subcomponent with properties and text content', () => {

    // given
    const component = Symbol.for('component');
    const props = {
      prop: 'prop'
    };
    const template = [
      component, props, 'Text'
    ];

    // when
    const result = Template.validate(template);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Subcomponents do not accept text content');
    assert(console.error.called);
  });

  it('rejects null template', () => {

    // given
    const template = null;

    // when
    const result = Template.validate(null);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Specified template: "null" is not an array!');
    assert(console.error.called);
  });

  it('rejects false template', () => {

    // given
    const template = false;

    // when
    const result = Template.validate(false);

    // then
    assert(result.error instanceof Error);
    assert.equal(result.error.message, 'Specified template: "false" is not an array!');
    assert(console.error.called);
  });
});