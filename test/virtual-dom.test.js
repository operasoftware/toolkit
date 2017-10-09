describe('Virtual DOM', () => {

  const VirtualDOM = opr.Toolkit.VirtualDOM;

  suppressConsoleErrors();

  const cache = new Map();

  describe('=> create component from', () => {

    const root = Symbol.for('Root');

    class RootClass extends opr.Toolkit.Root {};
    loader.define('Root', RootClass);

    it('creates a new instance of preloaded component', () => {

      // given
      const instance = VirtualDOM.createComponentFrom(root);

      // then
      assert(instance);
      assert(instance.isComponent());
      assert(instance.isRoot());
    });

    it('creates a new instance of preloaded component with key', () => {

      // given
      const instance = VirtualDOM.createComponentFrom(root, {
        key: 'key',
      });

      // then
      assert(instance);
      assert(instance.isComponent());
      assert(instance.isRoot());
      assert.equal(instance.key, 'key');
    });
  });

  describe('=> create element instance', () => {

    it('creates empty element', () => {

      // given
      const description = {
        name: 'div',
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element with a key', () => {

      // given
      const description = {
        name: 'span',
        props: {
          key: 'key',
        },
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'span');
      assert.equal(element.text, null);
      assert.equal(element.key, 'key');
      assert.equal(element.ref, null);
    });

    it('creates element with text content', () => {

      // given
      const description = {
        name: 'span',
        text: 'Text',
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'span');
      assert.equal(element.text, 'Text');
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element with attributes', () => {

      // given
      const description = {
        name: 'input',
        props: {
          value: 'value',
          id: 'some-id',
          unknown: true,
        },
      };

      // when
      const element = VirtualDOM.createElementInstance(
          description, new opr.Toolkit.Component());

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'input');
      assert.deepEqual(element.attrs, {
        value: 'value',
        id: 'some-id',
      });
      assert.deepEqual(element.dataset, {});
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element with data attributes', () => {

      // given
      const description = {
        name: 'input',
        props: {
          dataset: {
            custom: true,
            another: 17,
          },
        },
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'input');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {
        custom: 'true',
        another: '17',
      });
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element with class names', () => {

      // given
      const description = {
        name: 'div',
        props: {
          class: [
            'foo',
            {
              bar: true,
            },
            [
              [
                [
                  'nested',
                ],
              ],
              [
                [() => {}],
              ],
            ],
          ],
        },
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {});
      assert.deepEqual(element.classNames, ['foo', 'bar', 'nested']);
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element with style', () => {

      // given
      const description = {
        name: 'div',
        props: {
          style: {
            color: 'red',
            backgroundColor: 'black',
            unknown: 'green',
          },
        },
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {});
      assert.deepEqual(element.style, {
        color: 'red',
        backgroundColor: 'black',
      });
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element with listeners', () => {

      // given
      const onClick = () => {};
      const onChange = () => {};
      const description = {
        name: 'div',
        props: {
          onClick,
          onChange,
        },
      };

      // when
      const element = VirtualDOM.createElementInstance(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {});
      assert.deepEqual(element.listeners, {
        click: onClick,
        change: onChange,
      });
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert.equal(element.ref, null);
    });

    it('creates element and reuses existing child nodes', () => {

      const Component = Symbol.for('Component');

      const ComponentClass = class extends opr.Toolkit.Component {
        render() {
          return [
            'span',
            this.id,
          ];
        }
      };

      loader.define('Component', ComponentClass);

      // given
      const previousElement = VirtualDOM.createElement({
        name: 'div',
        children: [
          [
            Component,
          ],
        ],
      });

      // when
      const element = VirtualDOM.createElement(
          {
            name: 'div',
            children: [
              [
                Component,
              ],
            ],
          },
          previousElement);

      // then
      assert.equal(
          element.children[0].child.text,
          previousElement.children[0].child.text);
    });
  });

  describe('=> create child tree', () => {

    const App = class extends opr.Toolkit.Root {
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
      const child = VirtualDOM.createChildTree(app, props);

      // then
      assert(child);
      assert.equal(child.parentNode, app);
      assert.equal(child.name, 'div');
    });

    it('handles null tree', () => {

      // given
      const Empty = class extends opr.Toolkit.Root {
        render() {
          return null;
        }
      };
      const app = new Empty();
      const props = {};

      // when
      const child = VirtualDOM.createChildTree(app, props);

      // then
      assert.equal(child, null);
      assert.equal(app.child, null);
    });
  });

  describe('=> create component', () => {

    it('creates a leaf with a single element', () => {

      // given
      const LeafElementComponent = Symbol.for('LeafElement');

      const LeafElement = class extends opr.Toolkit.Component {
        render() {
          return [
            'a',
            {
              href: this.props.url,
            },
            this.props.label,
          ];
        }
      };

      loader.define('LeafElement', LeafElement);

      const label = 'Example';
      const url = 'http://www.example.com';
      const component =
          VirtualDOM.createComponent(LeafElementComponent, {url, label});

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
      const NestedElementsComponent = Symbol.for('NestedElements');

      const NestedElements = class extends opr.Toolkit.Component {
        render() {
          return [
            'div',
            [
              'span',
              {
                onClick: this.props.onClick,
              },
              [
                'a',
                {
                  href: this.props.url,
                },
                this.props.label,
              ],
            ],
          ];
        }
      };

      loader.define('NestedElements', NestedElements);

      const label = 'Example';
      const url = 'http://www.example.com';
      const onClick = () => {};
      const component = VirtualDOM.createComponent(
          NestedElementsComponent, {url, label, onClick});

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
      const Application = class extends opr.Toolkit.Component {
        render() {
          return [ParentComponent, ['p', {class: 'passed-from-application'}]];
        }
      };

      const Parent = class extends opr.Toolkit.Component {
        render() {
          return [
            ChildComponent,
            [
              'div',
              {
                class: 'passed-from-parent',
              },
              ...this.children,
            ],
          ];
        }
      };

      const Child = class extends opr.Toolkit.Component {
        render() {
          return [
            'span',
            {
              id: 'child',
            },
            ...this.children,
          ];
        }
      };

      loader.define('application', Application);
      loader.define('parent', Parent);
      loader.define('child', Child);

      const component = VirtualDOM.createComponent(ApplicationComponent);

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

    it('reuses sandboxed context from the existing component', () => {

      // given
      const Component = Symbol.for('Component');

      const ReusedComponent = class extends opr.Toolkit.Component {
        render() {
          return [
            'span',
            this.id,
          ];
        }
      };
      loader.define('Component', ReusedComponent);
      const previousComponent = VirtualDOM.createComponent(Component);

      // when
      const component =
          VirtualDOM.createComponent(Component, {}, [], previousComponent);

      // then
      assert.equal(component.child.text, previousComponent.child.text);

    });
  });

  describe('=> create from template', () => {

    it('supports nested markup', () => {

      // given
      const template = [
        'div',
        [
          'span',
          [
            'a',
            {
              href: 'http://www.example.com',
            },
            'Text',
          ],
        ],
      ];

      // when
      const divElement = VirtualDOM.createFromTemplate(template);

      // then
      assert(divElement.isElement())
      assert.equal(divElement.name, 'div');
      assert.equal(divElement.children.length, 1);

      const spanElement = divElement.children[0];
      assert(spanElement.isElement());
      assert.equal(spanElement.name, 'span');
      assert.equal(spanElement.children.length, 1);

      const linkElement = spanElement.children[0];
      assert(linkElement.isElement());
      assert.equal(linkElement.name, 'a');
      assert.equal(linkElement.text, 'Text');
    });

    it('returns null for template === null', () => {
      assert.equal(VirtualDOM.createFromTemplate(null), null);
    });

    it('returns null for template === false', () => {
      assert.equal(VirtualDOM.createFromTemplate(false), null);
    });

    it('returns null for template === []', () => {
      assert.equal(VirtualDOM.createFromTemplate([]), null);
    });

    it('throws when template === undefined', () => {
      assert.throws(
          VirtualDOM.createFromTemplate, Error, 'Invalid undefined template!');
    });
  });

  describe('=> normalize props', () => {

    const createComponentClass = defaultProps => {
      return class Component {
        static get defaultProps() {
          return defaultProps;
        }
      }
    };

    it('overrides undefined values', () => {

      // given
      const props = {
        foo: undefined,
      };

      const ComponentClass = createComponentClass({
        foo: [],
      });

      // when
      const normalizedProps = VirtualDOM.normalizeProps(ComponentClass, props);

      // then
      assert.deepEqual(normalizedProps, {
        foo: [],
      });
    });

    it('does not override falsy values', () => {

      // given
      const props = {
        foo: null,
        bar: 0,
        boolean: false,
      };

      const ComponentClass = createComponentClass({
        foo: [],
        bar: 10,
        boolean: true,
      });

      // when
      const normalizedProps = VirtualDOM.normalizeProps(ComponentClass, props);

      // then
      assert.deepEqual(normalizedProps, props);
    });

    it('does not override truthy values', () => {

      // given
      const props = {
        foo: {},
        bar: 10,
        other: [],
      };

      const ComponentClass = createComponentClass({
        foo: {a: 1},
        bar: 20,
        other: [1, 2, 3],
      });

      // when
      const normalizedProps = VirtualDOM.normalizeProps(ComponentClass, props);

      // then
      assert.deepEqual(normalizedProps, props);
    });
  });
});
