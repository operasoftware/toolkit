const consts = require('../src/core/consts.js');
global.Reactor = Object.assign({}, consts);

describe('Virtual Node => create', () => {

  it('creates an empty element', () => {

    // given
    const definition = {
      name: 'span'
    };

    // when
    const node = VirtualNode.create(definition);

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
    const definition = {
      name:'input',
      props: {
        type: 'text',
        tabIndex: 1,
        autoFocus: true,
        onChange: onChangeListener
      }
    };

    // when
    const node = VirtualNode.create(definition);

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
    const definition = {
      name: 'div',
      text: 'Text'
    };

    // when
    const node = VirtualNode.create(definition);

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
    const definition = {
      name: 'a',
      props: {
        href: 'http://www.opera.com/',
        target: '_blank',
        title: 'Opera Software',
        onClick: onClickListener,
      },
      text: 'Opera Software'
    };

    // when
    const node = VirtualNode.create(definition);

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