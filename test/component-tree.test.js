global.Reactor = createCore();
const VirtualNode = Reactor.VirtualNode;
const ComponentTree = Reactor.ComponentTree;

describe('Component Tree', () => {

  describe('=> create component instance', () => {

    const root = Symbol.for('Root');

    it.skip('creates a new instance of preloaded component', () => {

      // given
      require.preloaded = def => {
        switch (def) {
          case root:
            return Reactor.Root;
          default:
            throw new Error('Unknown definition: ' + def);
        }
      };
      console.log(require.preloaded);
      const instance = ComponentTree.createComponentInstance(root);

      // then
      assert(instance);
      assert(instance.isComponent());
      assert(instance.isRoot());
    });
  });

  describe('=> create element instance', () => {

    it.skip('creates empty element');
    it.skip('creates element with a key');
    it.skip('creates element with text content');
    it.skip('creates element with attributes');
    it.skip('creates element with data attributes');
    it.skip('creates element with class names');
    it.skip('creates element with style');
    it.skip('creates element with listeners');
  });

  describe('=> create child tree', () => {

    const App = class extends Reactor.Root {
      render() {
        return [
          'div',
        ];
      }
    };

    it('creates a tree bound to root component', () => {

      // given
      const app = new App();
      const props = {};

      // when
      const child = ComponentTree.createChildTree(app, props);

      // then
      assert(child);
      assert.equal(child.parentNode, app);
      assert.equal(child.name, 'div');
    });
  });

  describe('=> create', () => {

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

      ComponentTree.createComponentInstance = def => {
        return new LeafElement();
      };

      const label = 'Example';
      const url = 'http://www.example.com';
      const component = ComponentTree.create('LeafElement', {
        url,
        label
      });

      // then
      assert(component.isComponent());
      assert(component.childElement, component.child);

      assert(component.child.isElement());
      assert(component.child.parentNode, component);

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

      ComponentTree.createComponentInstance = def => {
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
      const divElement = component.child;
      const spanElement = divElement.children[0];
      const linkElement = spanElement.children[0];

      assert(component.isComponent());
      assert.equal(component.childElement, divElement);

      assert(divElement.isElement());
      assert.equal(divElement.parentNode, component);

      assert.equal(divElement.name, 'div');
      assert(divElement.children);
      assert.equal(divElement.children.length, 1);

      assert(spanElement.isElement());
      assert.equal(spanElement.parentNode, divElement);
      assert.equal(spanElement.parentElement, divElement);

      assert.equal(spanElement.name, 'span');
      assert.equal(spanElement.listeners['click'], onClick);
      assert(spanElement.children);
      assert.equal(spanElement.children.length, 1);

      assert(linkElement.isElement());
      assert.equal(linkElement.parentNode, spanElement);
      assert.equal(linkElement.parentElement, spanElement);

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

      ComponentTree.createComponentInstance = def => {
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
      assert(component.isComponent());
      assert.equal(component.constructor, Application);

      const parent = component.child;
      assert(parent.isComponent());
      assert.equal(parent.constructor, Parent);

      const child = parent.child;
      assert(child.isComponent());
      assert.equal(child.constructor, Child);

      const spanElement = child.child;
      assert(spanElement.isElement());

      const divElement = spanElement.children[0];
      assert(divElement.isElement());

      const paragraphElement = divElement.children[0];
      assert(paragraphElement.isElement());

      assert.equal(component.childElement, spanElement);
      assert.equal(parent.childElement, spanElement);
      assert.equal(child.childElement, spanElement);

      assert.equal(parent.parentNode, component);
      assert.equal(child.parentNode, parent);
      assert.equal(spanElement.parentNode, child);
      assert.equal(divElement.parentNode, spanElement);
      assert.equal(paragraphElement.parentNode, divElement);
    });

    it('throws an error for invalid template', () => {

      // given
      ComponentTree.createComponentInstance = () => {
        return {
          render: () => [666]
        }
      };

      // then
      assert.throws(ComponentTree.create, Error, 'Error');
    });

  });

  describe('=> create from template', () => {

    it('returns null for template === null', () => {
      assert.equal(ComponentTree.createFromTemplate(null), null);
    });

    it('returns null for template === false', () => {
      assert.equal(ComponentTree.createFromTemplate(false), null);
    });

    it('returns null for template === []', () => {
      assert.equal(ComponentTree.createFromTemplate([]), null);
    });

    it('throws when template === undefined', () => {
      assert.throws(ComponentTree.createFromTemplate, Error,
        'Invalid undefined template!');
    });

  });

});