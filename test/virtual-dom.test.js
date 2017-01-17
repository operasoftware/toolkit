const consts = require('../src/virtual-dom/consts.js');
global.SUPPORTED_ATTRIBUTES = consts.SUPPORTED_ATTRIBUTES;
global.SUPPORTED_EVENTS = consts.SUPPORTED_EVENTS;

global.VirtualNode = require('../src/virtual-dom/virtual-node.js');
global.VirtualDOM = require('../src/virtual-dom/virtual-dom.js');

describe('Virtual DOM', () => {

  it('creates a text element', () => {

    const template = [
      'div', 'Text'
    ];

    const node = VirtualDOM.createNode(template);

    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'div');
    assert.equal(node.attrs, undefined);
    assert.equal(node.listeners, undefined);
    assert.equal(node.text, 'Text');
    assert.equal(node.children, undefined);
  });

  it('creates an empty element with attributes', () => {

    const template = [
      'input', {
        type: 'text',
        tabIndex: 1,
        autoFocus: true,
      }
    ];

    const node = VirtualDOM.createNode(template);

    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'input');
    assert.deepEqual(node.attrs, {
      'type': 'text',
      'tab-index': '1',
      'auto-focus': 'true',
    });
    assert.equal(node.listeners, undefined);
    assert.equal(node.text, undefined);
    assert.equal(node.children, undefined);
  });

  it('creates a link with attributes and listeners', () => {

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

    const node = VirtualDOM.createNode(template);

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
