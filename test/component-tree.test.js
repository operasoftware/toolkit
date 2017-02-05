global.Reactor = createCore();
const VirtualNode = Reactor.VirtualNode;
const ComponentTree = Reactor.ComponentTree;

describe('Component Tree => create', () => {

  it('creates a leaf with a single element', () => {

    // given
    const LeafElement = class extends Reactor.Component {
      render() {
        return [
          'a', {
            href: this.props.url
          },
          this.props.label
        ];
      }
    };

    ComponentTree.createInstance = def => {
      return new LeafElement();
    };

    const label = 'Example';
    const url = 'http://www.example.com';
    const component = ComponentTree.create('LeafElement', {
      url,
      label
    });

    // then
    assert(component instanceof Reactor.Component);
    assert(component.child instanceof Reactor.VirtualNode);

    assert.equal(component.child.name, 'a');
    assert.equal(component.child.text, label);
    assert.equal(component.child.attrs.href, url);
  });

  it('creates a leaf with nested elements', () => {

    // given
    const NestedElements = class extends Reactor.Component {
      render() {
        return [
          'div', [
            'span', {
              onClick: this.props.onClick
            },
            [
              'a', {
                href: this.props.url
              },
              this.props.label
            ]
          ]
        ];
      }
    };

    ComponentTree.createInstance = def => {
      return new NestedElements();
    };

    const label = 'Example';
    const url = 'http://www.example.com';
    const onClick = () => {};
    const component = ComponentTree.create('NestedElements', {
      url,
      label,
      onClick
    });

    // then
    assert(component instanceof Reactor.Component);
    assert(component.child instanceof Reactor.VirtualNode);

    const divElement = component.child;
    assert.equal(divElement.name, 'div');
    assert(divElement.children);
    assert.equal(divElement.children.length, 1);

    const spanElement = divElement.children[0];
    assert.equal(spanElement.name, 'span');
    assert.equal(spanElement.listeners['click'], onClick);
    assert(spanElement.children);
    assert.equal(spanElement.children.length, 1);

    const linkElement = spanElement.children[0];
    assert.equal(linkElement.name, 'a');
    assert(linkElement.attrs.href, url);
    assert(linkElement.text, label);
  });

  it('creates a branch with nested components', () => {

    const ApplicationComponent = Symbol.for('application');
    const ParentComponent = Symbol.for('parent');
    const ChildComponent = Symbol.for('child');

    // given
    const Application = class extends Reactor.Component {
      render() {
        return [
          ParentComponent, [
            'p', {
              class: 'passed-from-application'
            }
          ]
        ];
      }
    };

    const Parent = class extends Reactor.Component {
      render() {
        return [
          ChildComponent, [
            'div', {
              class: 'passed-from-parent'
            }, ...this.children
          ]
        ];
      }
    };

    const Child = class extends Reactor.Component {
      render() {
        return [
          'span', {
            id: 'child'
          }, ...this.children
        ];
      }
    };

    ComponentTree.createInstance = def => {
      switch (def) {
        case ApplicationComponent:
          return new Application();
        case ParentComponent:
          return new Parent();
        case ChildComponent:
          return new Child();
          throw `Unknown definition: ${def}`;
      }
    };

    const component = ComponentTree.create(ApplicationComponent);

    // then
    assert(component instanceof Reactor.Component);
    assert(component.constructor === Application);

    const parent = component.child;
    assert(parent instanceof Reactor.Component);
    assert(parent.constructor === Parent);

    const child = parent.child;
    assert(child instanceof Reactor.Component);
    assert(child.constructor === Child);

    const spanElement = child.child;
    assert(spanElement instanceof Reactor.VirtualNode);

    const divElement = spanElement.children[0];
    assert(divElement instanceof Reactor.VirtualNode);

    const pElement = divElement.children[0];
    assert(pElement instanceof Reactor.VirtualNode);
  });

});