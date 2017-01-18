const consts = require('../src/virtual-dom/consts.js');
global.SUPPORTED_ATTRIBUTES = consts.SUPPORTED_ATTRIBUTES;
global.SUPPORTED_EVENTS = consts.SUPPORTED_EVENTS;

global.VirtualNode = require('../src/virtual-dom/virtual-node.js');
global.VirtualDOM = require('../src/virtual-dom/virtual-dom.js');

describe('Virtual DOM', () => {

  describe('=> get item type', () => {

    it('returns "string" for a string', () => {

      // when
      const type = VirtualDOM.getItemType('string');

      // then
      assert.equal(type, 'string');
    });

    it('returns "number" for a number', () => {

      // when
      const type = VirtualDOM.getItemType(13);

      // then
      assert.equal(type, 'number');
    });

    it('returns "boolean" for a boolean', () => {

      // when
      const type = VirtualDOM.getItemType(true);

      // then
      assert.equal(type, 'boolean');
    });

    it('returns "symbol" for a symbol', () => {

      // when
      const type = VirtualDOM.getItemType(Symbol.for('symbol'));

      // then
      assert.equal(type, 'symbol');
    });

    it('returns "null" for null', () => {

      // when
      const type = VirtualDOM.getItemType(null);

      // then
      assert.equal(type, 'null');
    });

    it('returns "undefined" for undefined', () => {

      // when
      const type = VirtualDOM.getItemType(undefined);

      // then
      assert.equal(type, 'undefined');
    });

    it('returns "array" for an array', () => {

      // when
      const type = VirtualDOM.getItemType([]);

      // then
      assert.equal(type, 'array');
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
