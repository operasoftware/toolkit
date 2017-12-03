describe('Nodes', () => {

  const {
    VirtualDOM,
    VirtualElement,
    VirtualNode,
  } = opr.Toolkit;

  const Component = Symbol.for('Component');

  const App = class extends opr.Toolkit.Root {};
  const ComponentClass = class extends opr.Toolkit.Component {

    render() {
      return this.children[0] || null;
    }
  };

  const createApp = (container, template) => {
    class RootClass extends opr.Toolkit.Root {
      render() {
        return template;
      }
    }
    const app = new RootClass(null, {}, {plugins: []});
    app.container = container;

    const node = utils.createFromTemplate(template);
    if (node) {
      app.appendChild(node);
    }
    return app;
  };

  const createElement = name => new VirtualElement({name});

  beforeEach(() => {
    sinon.stub(VirtualDOM, 'getComponentClass', symbol => {
      if (typeof symbol === 'string') {
        symbol = Symbol.for(symbol);
      }
      switch (symbol) {
        case Component:
          return ComponentClass;
      }
    });
  });

  afterEach(() => {
    VirtualDOM.getComponentClass.restore();
  });

  const root = new opr.Toolkit.Root({}, document.createElement('section'), {
    plugins: [],
  });
  const component = new opr.Toolkit.Component({}, [], null);
  const element = createElement('section');
  const comment = new opr.Toolkit.Comment('Dummy', null);

  describe('get node type', () => {

    it('returns "root" for a root', () => {
      assert.equal(root.nodeType, 'root');
    });

    it('returns "component" for a component', () => {
      assert.equal(component.nodeType, 'component');
    });

    it('returns "element" for an element', () => {
      assert.equal(element.nodeType, 'element');
    });

    it('returns "comment" for a comment', () => {
      assert.equal(comment.nodeType, 'comment');
    });
  });

  describe('is root', () => {

    it('returns true for a root', () => {
      assert(root.isRoot());
    });

    it('returns false for a component', () => {
      assert(!component.isRoot());
    });

    it('returns false for an element', () => {
      assert(!element.isRoot());
    });

    it('returns false for a comment', () => {
      assert(!comment.isRoot());
    });

  });

  describe('is component', () => {

    it('returns true for a root', () => {
      assert(root.isComponent());
    });

    it('returns true for a component', () => {
      assert(component.isComponent());
    });

    it('returns false for an element', () => {
      assert(!element.isComponent());
    });

    it('returns false for a comment', () => {
      assert(!comment.isComponent());
    });

  });

  describe('is element', () => {

    it('returns false for a root', () => {
      assert(!root.isElement());
    });

    it('returns false for a component', () => {
      assert(!component.isElement());
    });

    it('returns true for an element', () => {
      assert(element.isElement());
    });

    it('returns false for a comment', () => {
      assert(!comment.isElement());
    });

  });

  describe('is comment', () => {

    it('returns false for a root', () => {
      assert(!root.isComment());
    });

    it('returns false for a component', () => {
      assert(!component.isComment());
    });

    it('returns false for an element', () => {
      assert(!element.isComment());
    });

    it('returns true for a comment', () => {
      assert(comment.isComment());
    });
  });

  describe('get parent element', () => {

    it('returns null for a root component', () => {

      // given
      const container = document.createElement('container');

      // when
      const root = createApp(container, null);

      // then
      assert.equal(root.parentElement, null);
      assert.equal(root.container, container);
    });

    it('returns parent element for a child component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div',
        [
          Component,
        ],
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
        'div',
        [
          Component,
          [
            Component,
          ],
        ],
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
        'div',
        [
          'span',
        ],
      ]);
      const parent = app.child;
      const child = parent.children[0];

      // then
      assert(parent.isElement());
      assert(child.isElement());
      assert.equal(child.parentElement, parent);
    });

    it('returns null for detached element', () => {

      // given
      const component = new opr.Toolkit.Component();

      // then
      assert.equal(component.parentElement, null);
    });
  });

  describe('get container', () => {

    it('returns container for a root component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, null);

      // then
      assert.equal(app.container, container);
    });

    it('returns container for a top-level element', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div',
      ]);
      const element = app.child;

      // then
      assert(element.isElement());
      assert.equal(element.container, container);
    })

    it('returns container for a top-level component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [Component]);
      const component = app.child;

      // then
      assert(component.isComponent());
      assert.equal(component.container, container);
    });

    it('returns container for a nested element', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div',
        [
          'span',
        ],
      ]);
      const span = app.child.children[0];

      // then
      assert(span.isElement());
      assert.equal(span.container, container);
    });

    it('returns container for a nested component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createApp(container, [
        'div',
        [
          Component,
        ],
      ]);
      const component = app.child.children[0];

      // then
      assert(component.isComponent());
      assert.equal(component.container, container);
    });
  });

  describe('Component', () => {

    describe('render', () => {

      it('returns undefined by default', () => {

        // given
        const component = root;

        // then
        assert.equal(component.render(), undefined);
      });
    });

    describe('broadcast', () => {

      it('dispatches custom composed event', () => {

        // given
        const dispatchEvent = sinon.spy();
        const container = document.createElement('container');
        container.dispatchEvent = dispatchEvent;

        const root = new opr.Toolkit.Root(null, {}, {});
        root.container = container;
        const element = createElement('section');
        root.appendChild(element);
        const component = new opr.Toolkit.Component({}, [], null);
        element.insertChild(component);
        const eventName = 'event-name';
        const data = {view: 'speeddial'};

        // when
        component.broadcast(eventName, data);

        // then
        assert(dispatchEvent.called);
        assert.equal(dispatchEvent.firstCall.args[0].type, 'event-name');
        assert.deepEqual(dispatchEvent.firstCall.args[0].detail, data);
      });
    });

    describe('register service', () => {

      it('stores a reference to the clean-up task', () => {

        // given
        const disconnect = () => {};
        const Service = class {
          static connect() {
            return disconnect;
          }
        };
        const component = new opr.Toolkit.Component();

        // when
        component.connectTo(Service);

        // then
        assert.equal(component.cleanUpTasks.length, 1);
        assert.equal(component.cleanUpTasks[0], disconnect);
      });

      it('passes the listeners object to the connect method', () => {

        // given
        const listeners = {
          onSomeEvent: () => {},
        };
        const Service = class {
          static connect(listeners) {
            expectedListeners = listeners;
            return () => {};
          }
        };
        const component = new opr.Toolkit.Component();
        let expectedListeners;

        // when
        component.connectTo(Service, listeners);

        // then
        assert.equal(expectedListeners, listeners);
      });
    });

    describe('get ref', () => {

      it('returns DOM element for component with child element', () => {

        // given
        const component = new opr.Toolkit.Component();
        const element = createElement('span');
        const span = document.createElement('span');
        element.ref = span;
        component.appendChild(element);

        // then
        assert.equal(component.ref, span);
      });

      it('returns DOM text node for empty component', () => {

        // given
        const component = new opr.Toolkit.Component();
        const text = document.createTextNode('Component');
        component.comment.ref = text;

        // then
        assert.equal(component.ref, text);
      });
    });

    describe('append child', () => {

      it('removes the comment', () => {

        // given
        const component = new opr.Toolkit.Component();
        const subcomponent = new opr.Toolkit.Component();

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
          const component = new opr.Toolkit.Component();
          const subcomponent = new opr.Toolkit.Component();

          // when
          component.appendChild(subcomponent);

          // then
          assert.equal(component.child, subcomponent);
          assert.equal(subcomponent.parentNode, component);
        });

        it('between component and element', () => {

          // given
          const component = new opr.Toolkit.Component();
          const element = createElement('span');

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
        const component = new opr.Toolkit.Component();
        const subcomponent = new opr.Toolkit.Component();
        component.appendChild(subcomponent);

        // when
        component.removeChild(subcomponent);

        // then
        assert.equal(component.child, null);
        assert.equal(subcomponent.parentNode, null);
      });

      it('creates the comment', () => {
        // given
        const component = new opr.Toolkit.Component();
        const subcomponent = new opr.Toolkit.Component();
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
          'div',
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
          Component,
          [
            'div',
          ],
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
          Component,
          [
            Component,
            [
              'div',
            ],
          ],
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

      it('returns null for empty component', () => {

        // when
        const component = new opr.Toolkit.Component();

        // then
        assert.equal(component.childElement, null);
      });

      it('returns null for component with comment node', () => {

        // when
        const component = new opr.Toolkit.Component();
        component.appendChild(new opr.Toolkit.Comment());

        // then
        assert.equal(component.childElement, null);
      });
    });

    describe('get placeholder', () => {

      it('returns a comment for a new component', () => {

        // given
        const component = new opr.Toolkit.Component();

        // then
        assert(component.placeholder);
        assert(component.placeholder.isComment());
        assert.equal(component.placeholder, component.comment);
      });

      it('returns null for a component with a child element', () => {

        // given
        const component = new opr.Toolkit.Component();
        const element = createElement('span');

        // when
        component.appendChild(element);

        // then
        assert.equal(component.placeholder, null);
      });

      it('returns a subcomponents comment for a component with a child component',
         () => {

           // given
           const component = new opr.Toolkit.Component();
           const subcomponent = new opr.Toolkit.Component();

           // when
           component.appendChild(subcomponent);

           // then
           assert(component.placeholder);
           assert(component.placeholder.isComment());
           assert(component.placeholder, subcomponent.comment);
         });

      it('returns a comment for a component with no child', () => {

        // given
        const component = new opr.Toolkit.Component();
        const subcomponent = new opr.Toolkit.Component();
        const element = createElement('span');

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

  describe('Root', () => {

    const container = document.createElement('body');
    const settings = {plugins: []};
    const component = new opr.Toolkit.Root({}, settings);
    component.container = container;

    describe('get initial state', () => {

      it('by default returns an empty object', async () => {
        assert.deepEqual(await component.getInitialState(), {});
      });
    });

    describe('get reducers', () => {

      it('by default returns an empty array', () => {
        assert.deepEqual(component.getReducers(), []);
      });
    });
  });

  describe('Element', () => {

    describe('insert child', () => {

      it('inserts an element', () => {

        // given
        const element = createElement('section');
        const child = createElement('div');

        // when
        element.insertChild(child);

        // then
        assert.deepEqual(element.children, [child]);
        assert.equal(child.parentNode, element);
      });

      it('inserts a component', () => {

        // given
        const element = createElement('section');
        const child = new opr.Toolkit.Component();

        // when
        element.insertChild(child);

        // then
        assert.deepEqual(element.children, [child]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child at the beginning', () => {

        // given
        const element = createElement('section');
        const component = new opr.Toolkit.Component();
        element.insertChild(component);
        const child = new opr.Toolkit.Component();

        // when
        element.insertChild(child, 0);

        // then
        assert.deepEqual(element.children, [child, component]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child in the middle', () => {

        // given
        const element = createElement('section');
        const firstComponent = new opr.Toolkit.Component();
        element.insertChild(firstComponent);
        const div = createElement('div');
        element.insertChild(div);
        const span = createElement('span');

        // when
        element.insertChild(span, 1);

        // then
        assert.deepEqual(element.children, [firstComponent, span, div]);
        assert.equal(span.parentNode, element);
      });

      it('inserts child at the end', () => {

        // given
        const element = createElement('section');
        const component = new opr.Toolkit.Component();
        element.insertChild(component);
        const child = createElement('div');

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
        const parent = createElement('section');
        const component = new opr.Toolkit.Component();
        parent.insertChild(component);
        const div = createElement('div');
        parent.insertChild(div);
        const span = createElement('span');
        parent.insertChild(span);

        // when
        parent.removeChild(component);
        parent.removeChild(span);

        // then
        assert.deepEqual(parent.children, [div]);
        assert.equal(component.parentNode, null);
        assert.equal(span.parentNode, null);
      });

      it('removes the last child', () => {

        // given
        const parent = createElement('section');
        const child = new opr.Toolkit.Component();
        parent.insertChild(child);

        // when
        parent.removeChild(child);

        // then
        assert.deepEqual(parent.children, []);
        assert.equal(child.parentNode, null);
      });

      it('ignores node not being child', () => {

        const parent = createElement('section');
        const node = new opr.Toolkit.Component();

        // when
        assert.throws(() => parent.removeChild(node));
      });
    });
  });
})
