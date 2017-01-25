const consts = require('../src/virtual-dom/consts.js');
global.SUPPORTED_ATTRIBUTES = consts.SUPPORTED_ATTRIBUTES;
global.SUPPORTED_EVENTS = consts.SUPPORTED_EVENTS;

global.VirtualNode = require('../src/virtual-dom/virtual-node.js');
global.VirtualDOM = require('../src/virtual-dom/virtual-dom.js');

const ItemType = VirtualDOM.ItemType;

describe('Virtual DOM => create', () => {

  const createComponent = render => {
    return new class Component {
      render() {
        return render.apply(this);
      }
    };
  };

  it('supports nested markup', () => {

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
    assert(spanNode instanceof VirtualNode);
    assert.equal(spanNode.name, 'span');
    assert.equal(spanNode.children.length, 1);

    const linkNode = spanNode.children[0];
    assert(linkNode instanceof VirtualNode);
    assert.equal(linkNode.name, 'a');
    assert.equal(linkNode.text, 'Text');
  });

  it('supports nested components', () => {

    // given
    const A = Symbol.for('A');
    const B = Symbol.for('B');
    const component = createComponent(() => ([A]));

    global.Reactor = {
      construct: component => {
        switch (component) {
          case A:
            return createComponent(() => ([B]));
          case B:
            return createComponent(() => (['div', 'Text']));
          default:
            throw 'Unknown component';
        }
      }
    };

    // when
    const rootNode = VirtualDOM.create(component);

    // then
    assert(rootNode instanceof VirtualNode);
    assert.equal(rootNode.name, 'div');
    assert.equal(rootNode.text, 'Text');
    assert.equal(rootNode.children, undefined);
    assert.equal(rootNode.attrs, undefined);
    assert.equal(rootNode.listeners, undefined);
  });

  it('supports passing props to subcomponents', () => {

    // given
    const A = Symbol.for('A');
    const component = createComponent(function() {
      const items = this.props.items.map(label => (
        [A, {
          label
        }]
      ));
      return ['div', ...items];
    });
    component.props = {
      items: ['A', 'B', 'C', 'D', 'E']
    };

    global.Reactor = {
      construct: () => createComponent(function() {
        return [
          'span', 'Item ' + this.props.label
        ];
      })
    };

    // when
    const rootNode = VirtualDOM.create(component);

    // then
    assert(rootNode instanceof VirtualNode);
    assert(rootNode.children);
    assert.equal(rootNode.children.length, 5);
    assert(rootNode.children[0].text, 'Item A');
    assert(rootNode.children[1].text, 'Item B');
    assert(rootNode.children[2].text, 'Item C');
    assert(rootNode.children[3].text, 'Item D');
    assert(rootNode.children[4].text, 'Item E');
  });

  it('supports passing children to subcomponents', () => {

    // given
    const A = Symbol.for('A');
    const component = createComponent(function() {
      return [
        'div', [
          'span', 'Text'
        ],
        [
          A, [
            'span', 'from parent'
          ]
        ]
      ];
    });

    global.Reactor = {
      construct: () => createComponent(function() {
        return [
          'div', ...this.props.children, [
            'span', 'from child'
          ]
        ];
      })
    };

    // when
    const rootNode = VirtualDOM.create(component);

    // then
    assert(rootNode instanceof VirtualNode);
    assert(rootNode.children);
    assert.equal(rootNode.children.length, 2);
    assert.equal(rootNode.children[0].name, 'span');
    assert.equal(rootNode.children[0].text, 'Text');

    const subnode = rootNode.children[1]
    assert.equal(subnode.name, 'div');
    assert(subnode.children);

    assert.equal(subnode.children.length, 2);
    assert.equal(subnode.children[0].name, 'span');
    assert.equal(subnode.children[0].text, 'from parent');
    assert.equal(subnode.children[1].name, 'span');
    assert.equal(subnode.children[1].text, 'from child');
  });
});
