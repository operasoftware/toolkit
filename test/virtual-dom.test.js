global.VirtualNode = require('../src/virtual-dom/virtual-node.js');
global.VirtualDOM = require('../src/virtual-dom/virtual-dom.js');

describe('Virtual DOM', function() {

  it('creates text element', () => {

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
  })

});
