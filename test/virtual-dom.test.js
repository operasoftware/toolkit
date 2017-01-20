const consts = require('../src/virtual-dom/consts.js');
global.SUPPORTED_ATTRIBUTES = consts.SUPPORTED_ATTRIBUTES;
global.SUPPORTED_EVENTS = consts.SUPPORTED_EVENTS;

global.VirtualNode = require('../src/virtual-dom/virtual-node.js');
global.VirtualDOM = require('../src/virtual-dom/virtual-dom.js');

const ItemType = VirtualDOM.ItemType;

describe('Virtual DOM', () => {

  describe('=> get item type', () => {

    it('returns "string" for a string', () => {

      // when
      const type = VirtualDOM.getItemType('string');

      // then
      assert.equal(type, ItemType.STRING);
    });

    it('returns "number" for a number', () => {

      // when
      const type = VirtualDOM.getItemType(13);

      // then
      assert.equal(type, ItemType.NUMBER);
    });

    it('returns "boolean" for a boolean', () => {

      // when
      const type = VirtualDOM.getItemType(true);

      // then
      assert.equal(type, ItemType.BOOLEAN);
    });

    it('returns "component" for a symbol', () => {

      // when
      const type = VirtualDOM.getItemType(Symbol.for('component'));

      // then
      assert.equal(type, ItemType.COMPONENT);
    });

    it('returns "null" for null', () => {

      // when
      const type = VirtualDOM.getItemType(null);

      // then
      assert.equal(type, ItemType.NULL);
    });

    it('returns "undefined" for undefined', () => {

      // when
      const type = VirtualDOM.getItemType(undefined);

      // then
      assert.equal(type, ItemType.UNDEFINED);
    });

    it('returns "element" for an array', () => {

      // when
      const type = VirtualDOM.getItemType([]);

      // then
      assert.equal(type, ItemType.ELEMENT);
    });

    it('returns "props" for an object', () => {

      // when
      const type = VirtualDOM.getItemType({});

      // then
      assert.equal(type, ItemType.PROPS);
    });
  });

  describe('=> validate template', () => {

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

      // then
      assert.deepEqual(result, {
        types: ['component', 'props', 'element', 'element', 'element']
      });
      assert(!console.error.called);
    });

    it('rejects a number as a parameter', () => {

      // when
      const result = VirtualDOM.validate([5]);

      // then
      assert(result.error instanceof Error);
      assert.equal(result.error.message, 'Invalid parameter type "number" at index 0');
      assert(console.error.called);
    });

    it('rejects a boolean as a parameter', () => {

      // when
      const result = VirtualDOM.validate([true]);

      // then
      assert(result.error instanceof Error);
      assert.equal(result.error.message, 'Invalid parameter type "boolean" at index 0');
      assert(console.error.called);
    });

    it('rejects null as a parameter', () => {

      // when
      const result = VirtualDOM.validate([null]);

      // then
      assert(result.error instanceof Error);
      assert.equal(result.error.message, 'Invalid parameter type "null" at index 0');
      assert(console.error.called);
    });

    it('rejects undefined as a parameter', () => {

      // when
      const result = VirtualDOM.validate([undefined]);

      // then
      assert(result.error instanceof Error);
      assert.equal(result.error.message, 'Invalid parameter type "undefined" at index 0');
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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

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
      const result = VirtualDOM.validate(template);

      // then
      assert(result.error instanceof Error);
      assert.equal(result.error.message, 'Subcomponents do not accept text content');
      assert(console.error.called);
    });
  });

  describe('=> spread template', () => {

    it('detects component', () => {

      // given
      const component = Symbol.for('component');
      const template = [
        component
      ];

      // when
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

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
      const definition = VirtualDOM.spread(template);

      // then
      assert.deepEqual(definition, {
        name,
        props,
        children
      });
    });
  });

  describe('=> create node', () => {

    it('creates an empty element', () => {

      // given
      const template = [
        'span'
      ];

      // when
      const node = VirtualDOM.createNode(template);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'span');
      assert.equal(node.attrs, undefined);
      assert.equal(node.listeners, undefined);
      assert.equal(node.text, undefined);
      assert.equal(node.children, undefined);
    });

    it('creates an empty element with attributes and listeners', () => {

      // given
      const onChangeListener = () => {};
      const template = [
        'input', {
          type: 'text',
          tabIndex: 1,
          autoFocus: true,
          onChange: onChangeListener
        }
      ];

      // when
      const node = VirtualDOM.createNode(template);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'input');
      assert.deepEqual(node.attrs, {
        'type': 'text',
        'tab-index': '1',
        'auto-focus': 'true',
      });
      assert.deepEqual(node.listeners, {
        'change': onChangeListener,
      });
      assert.equal(node.text, undefined);
      assert.equal(node.children, undefined);
    });

    it('creates a text element', () => {

      // given
      const template = [
        'div', 'Text'
      ];

      // when
      const node = VirtualDOM.createNode(template);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'div');
      assert.equal(node.attrs, undefined);
      assert.equal(node.listeners, undefined);
      assert.equal(node.text, 'Text');
      assert.equal(node.children, undefined);
    });

    it('creates a text element with attributes and listeners', () => {

      // given
      const onClickListener = () => {};
      const template = [
        'a', {
          href: 'http://www.opera.com/',
          target: '_blank',
          title: 'Opera Software',
          onClick: onClickListener,
        },
        'Opera Software'
      ];

      // when
      const node = VirtualDOM.createNode(template);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'a');
      assert.deepEqual(node.attrs, {
        'href': 'http://www.opera.com/',
        'target': '_blank',
        'title': 'Opera Software',
      });
      assert.deepEqual(node.listeners, {
        'click': onClickListener,
      });
      assert.equal(node.text, 'Opera Software');
      assert.equal(node.children, undefined);
    });
  });
});
