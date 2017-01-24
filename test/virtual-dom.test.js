const consts = require('../src/virtual-dom/consts.js');
global.SUPPORTED_ATTRIBUTES = consts.SUPPORTED_ATTRIBUTES;
global.SUPPORTED_EVENTS = consts.SUPPORTED_EVENTS;

global.VirtualNode = require('../src/virtual-dom/virtual-node.js');
global.VirtualDOM = require('../src/virtual-dom/virtual-dom.js');

const ItemType = VirtualDOM.ItemType;

describe.only('Virtual DOM => create', () => {

  const createComponent = render => ({
    render
  });

  it('creates nested markup from static template', () => {

    // given

    const component = createComponent(() => (
      [
        'div', [
          'span', [
            'a', {
              href: 'http://www.example.com'
            }, 'Text'
          ]
        ]
      ]
    ));

    // when
    const rootNode = VirtualDOM.create(component);


    // then
    assert(rootNode instanceof VirtualNode)
    assert.equal(rootNode.name, 'div');
    assert.equal(rootNode.children.length, 1);

    const spanNode = rootNode.children[0];

    assert(spanNode instanceof VirtualNode)
    assert.equal(spanNode.name, 'span');
    // assert.equal(spanNode.children.length, 1);

  });

});