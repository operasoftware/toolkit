global.Reactor = createCore();
const ComponentTree = Reactor.ComponentTree;

describe('Core Types', () => {

  const Component = Symbol.for('Component');

  const App = class extends Reactor.Root {};
  const ComponentClass = class extends Reactor.Component {

    render() {
      return this.children[0] || null;
    }
  };

  const createApp = (container, template) => {
    const app = new App(container);
    const node = ComponentTree.createFromTemplate(template);
    if (node) {
      app.appendChild(node);
    }
    return app;
  };

  beforeEach(() => {
    ComponentTree.createComponentInstance = def => {
      switch (def) {
        case Component:
          return new ComponentClass();
      }
    };
  });

  describe('get node type', () => {

    it('returns "root" for a root', () => {
      assert.equal(new Reactor.Root().nodeType, 'root');
    });

    it('returns "component" for a component', () => {
      assert.equal(new Reactor.Component().nodeType, 'component');
    });

    it('returns "element" for an element', () => {
      assert.equal(new Reactor.VirtualElement().nodeType, 'element');
    });

    it('returns "comment" for a comment', () => {
      assert.equal(new Reactor.Comment().nodeType, 'comment');
    });
  });

  describe('is root', () => {

    it('returns true for a root', () => {
      assert(new Reactor.Root().isRoot());
    });

    it('returns false for a component', () => {
      assert(!new Reactor.Component().isRoot());
    });

    it('returns false for an element', () => {
      assert(!new Reactor.VirtualElement().isRoot());
    });

    it('returns false for a comment', () => {
      assert(!new Reactor.Comment().isRoot());
    });

  });

  describe('is component', () => {

    it('returns true for a root', () => {
      assert(new Reactor.Root().isComponent());
    });

    it('returns true for a component', () => {
      assert(new Reactor.Component().isComponent());
    });

    it('returns false for an element', () => {
      assert(!new Reactor.VirtualElement().isComponent());
    });

    it('returns false for a comment', () => {
      assert(!new Reactor.Comment().isComponent());
    });

  });

  describe('is element', () => {

    it('returns false for a root', () => {
      assert(!new Reactor.Root().isElement());
    });

    it('returns false for a component', () => {
      assert(!new Reactor.Component().isElement());
    });

    it('returns true for an element', () => {
      assert(new Reactor.VirtualElement().isElement());
    });

    it('returns false for a comment', () => {
      assert(!new Reactor.Comment().isElement());
    });

  });

  describe('is comment', () => {

    it('returns false for a root', () => {
      assert(!new Reactor.Root().isComment());
    });

    it('returns false for a component', () => {
      assert(!new Reactor.Component().isComment());
    });

    it('returns false for an element', () => {
      assert(!new Reactor.VirtualElement().isComment());
    });

    it('returns true for a comment', () => {
      assert(new Reactor.Comment().isComment());
    });
  });

  describe('get parent element', () => {

    it('returns container for an app component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, null);

      // then
      assert.equal(app.parentElement.ref, container);
    });

    it('returns container for a top-level element', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div'
      ]);
      const element = app.child;

      // then
      assert(element.isElement());
      assert.equal(element.parentElement.ref, container);
    })

    it('returns container for a top-level component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        Component
      ]);
      const component = app.child;

      // then
      assert(component.isComponent());
      assert.equal(component.parentElement.ref, container);
    });

    it('returns parent element for a child component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div', [
          Component
        ]
      ]);
      const element = app.child;
      const component = element.children[0];

      // then
      assert(element.isElement());
      assert(component.isComponent());
      assert.equal(component.parentElement, element);
    });

    it('returns ancestor element for a nested component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div', [
          Component, [
            Component
          ]
        ]
      ]);
      const element = app.child;
      const component = element.children[0];
      const subcomponent = component.child;

      // then
      assert(element.isElement());
      assert(component.isComponent());
      assert(subcomponent.isComponent());
      assert.equal(subcomponent.parentElement, element);
    });

    it('returns parent element for a child element', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div', [
          'span'
        ]
      ]);
      const parent = app.child;
      const child = parent.children[0];

      // then
      assert(parent.isElement());
      assert(child.isElement());
      assert.equal(child.parentElement, parent);
    });
  });

  describe('Component', () => {

    describe('append child', () => {

      it('removes the comment', () => {

          // given
          const component = new Reactor.Component();
          const subcomponent = new Reactor.Component();

          // when
          component.appendChild(subcomponent);

          // then
          assert.equal(component.comment, null);
          assert(subcomponent.comment.isComment());
          assert.equal(subcomponent.placeholder, subcomponent.comment);
          assert.equal(component.placeholder, subcomponent.placeholder);
      });

      describe('establishes the parent-child relation', () => {

        it('between component and subcomponent', () => {

          // given
          const component = new Reactor.Component();
          const subcomponent = new Reactor.Component();

          // when
          component.appendChild(subcomponent);

          // then
          assert.equal(component.child, subcomponent);
          assert.equal(subcomponent.parentNode, component);
        });

        it('between component and element', () => {

          // given
          const component = new Reactor.Component();
          const element = new Reactor.VirtualElement();

          // when
          component.appendChild(element);

          // then
          assert.equal(component.child, element);
          assert.equal(element.parentNode, component);
        });
      });
    });

    describe('remove child', () => {

      it('removes the parent-child relation', () => {

          // given
          const component = new Reactor.Component();
          const subcomponent = new Reactor.Component();
          component.appendChild(subcomponent);

          // when
          component.removeChild(subcomponent);

          // then
          assert.equal(component.child, null);
          assert.equal(subcomponent.parentNode, null);
      });

      it('creates the comment', () => {
          // given
          const component = new Reactor.Component();
          const subcomponent = new Reactor.Component();
          component.appendChild(subcomponent);

          // when
          component.removeChild(subcomponent);

          // then
          assert(component.comment);
          assert.equal(component.placeholder, component.comment);
          assert(component.comment.isComment());
      });
    });

    describe('get child element', () => {

      it('returns child element for an app component', () => {

        // given
        const container = document.createElement('container');

        // when
        const app = createApp(container, [
          'div'
        ]);
        const element = app.child;

        // then
        assert(element.isElement());
        assert.equal(app.childElement, element);
      });

      it('returns child element for a parent component', () => {

        // given
        const container = document.createElement('container');

        // when
        const app = createApp(container, [
          Component, [
            'div'
          ]
        ]);
        const component = app.child;
        const element = component.child;

        // then
        assert(component.isComponent());
        assert(element.isElement());
        assert.equal(component.childElement, element);
      });

      it('returns leaf element for a top-level component', () => {

        // given
        const container = document.createElement('container');

        // when
        const app = createApp(container, [
          Component, [
            Component, [
              'div'
            ]
          ]
        ]);
        const component = app.child;
        const subcomponent = component.child;
        const element = subcomponent.child;

        // then
        assert(component.isComponent());
        assert(subcomponent.isComponent());
        assert(element.isElement());
        assert.equal(app.childElement, element);
        assert.equal(component.childElement, element);
      });
    });

    describe('get placeholder', () => {

      it('returns a comment for a new component', () => {

        // given
        const component = new Reactor.Component();

        // then
        assert(component.placeholder);
        assert(component.placeholder.isComment());
        assert.equal(component.placeholder, component.comment);
      });

      it('returns null for a component with a child element', () => {

        // given
        const component = new Reactor.Component();
        const element = new Reactor.VirtualElement();

        // when
        component.appendChild(element);

        // then
        assert.equal(component.placeholder, null);
      });

      it('returns a subcomponents comment for a component with a child component', () => {

        // given
        const component = new Reactor.Component();
        const subcomponent = new Reactor.Component();

        // when
        component.appendChild(subcomponent);

        // then
        assert(component.placeholder);
        assert(component.placeholder.isComment());
        assert(component.placeholder, subcomponent.comment);
      });

      it('returns a comment for a component with no child', () => {

        // given
        const component = new Reactor.Component();
        const subcomponent = new Reactor.Component();
        const element = new Reactor.VirtualElement();

        // when
        component.appendChild(subcomponent);
        component.removeChild(subcomponent);

        // then
        assert(component.placeholder);
        assert(component.placeholder.isComment());
        assert.equal(component.placeholder, component.comment);

        // when
        component.appendChild(element);
        component.removeChild(element);

        // then
        assert(component.placeholder);
        assert(component.placeholder.isComment());
        assert.equal(component.placeholder, component.comment);
      });
    });
  });

  describe('Element', () => {

    describe('insert child', () => {

      it('inserts an element', () => {
        
        // given
        const element = new Reactor.VirtualElement();
        const child = new Reactor.VirtualElement();

        // when
        element.insertChild(child);

        // then
        assert.deepEqual(element.children, [child]);
        assert.equal(child.parentNode, element);
      });

      it('inserts a component', () => {
        
        // given
        const element = new Reactor.VirtualElement();
        const child = new Reactor.Component();

        // when
        element.insertChild(child);

        // then
        assert.deepEqual(element.children, [child]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child at the beginning', () => {
        
        // given
        const element = new Reactor.VirtualElement();
        const component = new Reactor.Component();
        element.insertChild(component);
        const child = new Reactor.Component();

        // when
        element.insertChild(child, 0);

        // then
        assert.deepEqual(element.children, [child, component]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child in the middle', () => {

        // given
        const element = new Reactor.VirtualElement();
        const firstComponent = new Reactor.Component();
        element.insertChild(firstComponent);
        const secondComponent = new Reactor.VirtualElement();
        element.insertChild(secondComponent);
        const child = new Reactor.VirtualElement();

        // when
        element.insertChild(child, 1);

        // then
        assert.deepEqual(element.children, [
          firstComponent, child, secondComponent
        ]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child at the end', () => {
        
        // given
        const element = new Reactor.VirtualElement();
        const component = new Reactor.Component();
        element.insertChild(component);
        const child = new Reactor.VirtualElement();

        // when
        element.insertChild(child, 1);

        // then
        assert.deepEqual(element.children, [component, child]);
        assert.equal(child.parentNode, element);
      });

    });

    describe('remove child', () => {

      it('removes multiple children', () => {
        
        // given
        const parent = new Reactor.VirtualElement();
        const component = new Reactor.Component();
        parent.insertChild(component);
        const child = new Reactor.VirtualElement();
        parent.insertChild(child);
        const element = new Reactor.VirtualElement();
        parent.insertChild(element);

        // when
        parent.removeChild(component);
        parent.removeChild(element);

        // then
        assert.deepEqual(parent.children, [child]);
        assert.equal(component.parentNode, null);
        assert.equal(element.parentNode, null);
      });

      it('removes the last child', () => {

        // given
        const parent = new Reactor.VirtualElement();
        const child = new Reactor.Component();
        parent.insertChild(child);

        // when
        parent.removeChild(child);

        // then
        assert.deepEqual(parent.children, []);
        assert.equal(child.parentNode, null);
      });
    });
  });
})