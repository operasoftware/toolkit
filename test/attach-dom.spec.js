describe('Virtual Element => Attach DOM', () => {

  const {
    Template,
    VirtualDOM,
  } = opr.Toolkit;

  class Root extends opr.Toolkit.Root {
    render() {
      return null;
    }
  }

  class Component extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  }

  class Subcomponent extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  }

  const createElement = (name, props = {}, content = []) => {
    const template = typeof content === 'string' ? [name, props, content] :
                                                   [name, props, ...content];
    const description = Template.describe(template);
    const root = createRootInstance(Root);
    const element = VirtualDOM.createFromDescription(description, root);
    root.child = element;
    return element;
  };

  describe('=> create element', () => {

    it('supports empty elements', () => {

      // when
      const element = createElement('span');

      // then
      assert.equal(element.description.name, 'span')
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert(!element.ref.textContent);
    });

    it('supports text elements', () => {

      // when
      const element = createElement('span', {}, 'Text');

      // then
      assert.equal(element.description.name, 'span')
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert.equal(element.ref.textContent, 'Text');
    });

    it('supports style attribute', () => {

      // when
      const element = createElement('span', {
        style: {
          color: 'red',
        },
      });

      // then
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert.equal(element.ref.style.length, 1);
      assert.deepEqual(element.ref.style.color, 'red');
    });

    it('supports adding event listeners', () => {

      // given
      const onClick = () => {};
      const onChange = () => {};

      // when
      const element = createElement('span', {onClick, onChange}, 'Text');

      // then
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert.equal(element.ref.textContent, 'Text');
      typeof window !== 'object' &&
          assert.deepEqual(element.ref.eventListeners_, {
            click: [onClick],
            change: [onChange],
          });
    });
  });

  describe('=> create element', () => {

    const createFromTemplate = template => {
      const root = createRootInstance(Root);
      const node =
          VirtualDOM.createFromDescription(Template.describe(template), root);
      root.child = node;
      return node;
    };

    it('creates a single element', () => {

      // given
      const element = createElement('div');

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.children, undefined);
      assert.equal(element.ref.tagName, 'DIV');
      assert.deepEqual(element.ref.children, []);
    });

    it('creates two nested elements', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          'span',
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      assert.equal(element.children[0].description.name, 'span');
      assert.equal(element.ref.children[0].tagName, 'SPAN');
    });

    it('creates three nested elements', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          'span',
          [
            'a',
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const span = element.children[0];
      assert.equal(element.ref.children[0], span.ref);
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');

      const link = span.children[0];
      assert.equal(span.ref.children[0], link.ref);
      assert.equal(link.description.name, 'a');
      assert.equal(link.ref.tagName, 'A');
    });

    it('supports component present within the tree', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          Component,
          [
            'span',
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, Component);

      const span = component.content;
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');
    });

    it('supports nested components present within the tree', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          Component,
          [
            Subcomponent,
            [
              'span',
            ],
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, Component);
      assert(component instanceof opr.Toolkit.Component);

      const subcomponent = component.content;
      assert.equal(subcomponent.constructor, Subcomponent);

      const span = subcomponent.content;
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');
    });

    it('supports component with no children', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          Component,
          [
            'span',
            [
              Subcomponent,
            ],
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, Component);
      assert(component.isComponent());

      const span = component.content;
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');

      const subcomponent = span.children[0];
      assert.equal(subcomponent.constructor, Subcomponent);
      assert(subcomponent.content.isComment());
    });

    it('creates properties', () => {

      // when
      const element = createFromTemplate([
        'video',
        {
          properties: {
            muted: true,
          },
        },
      ]);

      // then
      assert.equal(element.description.name, 'video');
      assert.equal(element.ref.tagName, 'VIDEO');

      assert.equal(element.ref.muted, true);
    });

    describe('creates a comment node', () => {

      it('for a component with no child', () => {

        // when
        const component = createFromTemplate([
          Component,
        ]);

        // then
        assert(component.content);
        assert(component.placeholder.description.text.includes(Component.name));
      });

      it('for nested components with no child element', () => {

        // given
        const component = createFromTemplate([
          Component,
          [
            Component,
            [
              Subcomponent,
            ],
          ],
        ]);

        // then
        assert(component.content);
        assert(
            component.placeholder.description.text.includes(Subcomponent.name));
      });
    });
  });
});
