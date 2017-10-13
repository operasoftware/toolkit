describe('Virtual DOM', () => {

  const {Renderer,VirtualDOM} = opr.Toolkit;

  const container = document.createElement('container');
  const root = new opr.Toolkit.Root({}, container, {});

  const render = (symbol, props) => {
    const component = VirtualDOM.createComponent(symbol, props, [], root, root);
    const description = Renderer.render(component, props);
    const child = VirtualDOM.createFromDescription(description, root, root);
    if (child) {
      component.appendChild(child);
    }
    return component;
  };

  describe('=> render component', () => {

    it('creates a leaf with a single element', () => {

      // given
      class LeafElement extends opr.Toolkit.Component {
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
      const component = render('LeafElement', {url, label});

      // then
      assert(component.isComponent());
      assert.equal(component.childElement, component.child);

      assert(component.child.isElement());
      assert.equal(component.child.parentNode, component);

      assert.equal(component.child.name, 'a');
      assert.equal(component.child.text, label);
      assert.equal(component.child.attrs.href, url);
    });

    it('creates a leaf with nested elements', () => {

      // given
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
      const component = render('NestedElements', {url, label, onClick});

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
      assert.equal(spanElement.listeners.onClick, onClick);
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

      const component = render('application');

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

  });
});
