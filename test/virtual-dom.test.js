global.Reactor = createCore();
const VirtualElement = Reactor.VirtualElement;
const VirtualDOM = Reactor.VirtualDOM;
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
    const rootElement = VirtualDOM.create(component);

    // then
    assert(rootElement instanceof VirtualElement)
    assert.equal(rootElement.name, 'div');
    assert.equal(rootElement.children.length, 1);

    const spanElement = rootElement.children[0];
    assert(spanElement instanceof VirtualElement);
    assert.equal(spanElement.name, 'span');
    assert.equal(spanElement.children.length, 1);

    const linkElement = spanElement.children[0];
    assert(linkElement instanceof VirtualElement);
    assert.equal(linkElement.name, 'a');
    assert.equal(linkElement.text, 'Text');
  });

  it('supports nested components', () => {

    // given
    const A = Symbol.for('A');
    const B = Symbol.for('B');
    const component = createComponent(() => ([A]));

    VirtualDOM.createInstance = component => {
      switch (component) {
        case A:
          return createComponent(() => ([B]));
        case B:
          return createComponent(() => (['div', 'Text']));
      }
    };

    // when
    const rootElement = VirtualDOM.create(component);

    // then
    assert(rootElement instanceof VirtualElement);
    assert.equal(rootElement.name, 'div');
    assert.equal(rootElement.text, 'Text');
    assert.deepEqual(rootElement.children, []);
    assert.deepEqual(rootElement.attrs, {});
    assert.deepEqual(rootElement.listeners, {});
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

    VirtualDOM.createInstance = () => createComponent(function() {
      return [
        'span', 'Item ' + this.props.label
      ];
    });

    // when
    const rootElement = VirtualDOM.create(component);

    // then
    assert(rootElement instanceof VirtualElement);
    assert(rootElement.children);
    assert.equal(rootElement.children.length, 5);
    assert(rootElement.children[0].text, 'Item A');
    assert(rootElement.children[1].text, 'Item B');
    assert(rootElement.children[2].text, 'Item C');
    assert(rootElement.children[3].text, 'Item D');
    assert(rootElement.children[4].text, 'Item E');
  });

  it('supports passing children to subcomponents', () => {

    // given
    const A = Symbol.for('A');
    const component = createComponent(function() {
      return [
        A, [
          'span', 'from parent'
        ]
      ];
    });

    VirtualDOM.createInstance = () => createComponent(function() {
      return [
        'div', ...this.children, [
          'span', 'from child'
        ]
      ];
    });

    // when
    const rootElement = VirtualDOM.create(component);

    // then
    assert(rootElement instanceof VirtualElement);
    assert(rootElement.children);
    assert.equal(rootElement.children.length, 2);

    assert.equal(rootElement.children.length, 2);
    assert.equal(rootElement.children[0].name, 'span');
    assert.equal(rootElement.children[0].text, 'from parent');
    assert.equal(rootElement.children[1].name, 'span');
    assert.equal(rootElement.children[1].text, 'from child');
  });

  it('supports mixing subcomponents and static markup', () => {

    // given
    const A = Symbol.for('A');
    const B = Symbol.for('B');
    const component = createComponent(function() {
      return [
        A, [
          'p', [
            B, [
              'span', 'root'
            ]
          ]
        ]
      ];
    });

    VirtualDOM.createInstance = component => {
      switch (component) {
        case A:
          return createComponent(function() {
            return ['section', ['h1', 'A'], ...this.children];
          });
        case B:
          return createComponent(function() {
            return ['div', ['h2', 'B'], ...this.children];
          });
      }
    };

    // when
    const rootElement = VirtualDOM.create(component);

    // then
    assert(rootElement instanceof VirtualElement);
    assert.equal(rootElement.name, 'section');
    assert(rootElement.children);
    assert.equal(rootElement.children.length, 2);
    assert.equal(rootElement.children[0].name, 'h1');
    assert.equal(rootElement.children[0].text, 'A');

    const paragraphElement = rootElement.children[1];
    assert.equal(paragraphElement.name, 'p');
    assert(paragraphElement.children);
    assert.equal(paragraphElement.children.length, 1);

    const divElement = paragraphElement.children[0];
    assert.equal(divElement.name, 'div');
    assert(divElement.children);
    assert.equal(divElement.children[0].name, 'h2');
    assert.equal(divElement.children[1].name, 'span');
    assert.equal(divElement.children[1].text, 'root');
  });
});
