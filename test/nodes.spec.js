describe('Nodes', () => {

  const {
    VirtualDOM,
    Template,
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

  const createRoot = (container, template = null) => {
    class Root extends opr.Toolkit.Root {
      render() {
        return template;
      }
    }
    const root = createRootInstance(Root);
    root.container = container;

    const node = VirtualDOM.createFromDescription(
                                Template.describe(template), root);
    if (node) {
      root.content = node;
    }
    return root;
  }

  const createComponent = (template = null) => {
    class Component extends opr.Toolkit.Component {
      render() {
        return template;
      }
    }
    return createFromTemplate([Component]);
  }

  const root = createRootInstance(Root);
  const createElement = (name, parentNode) =>
      VirtualDOM.createFromDescription(Template.describe([name]), parentNode);

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
      const root = createRoot(container, null);

      // then
      assert.equal(root.parentElement, null);
      assert.equal(root.container, container);
    });

    it('returns parent element for a child component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createRoot(container, [
        'div',
        [
          Component,
        ],
      ]);
      const element = app.content;
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
      const app = createRoot(container, [
        'div',
        [
          Component,
          [
            Component,
          ],
        ],
      ]);
      const element = app.content;
      const component = element.children[0];
      const subcomponent = component.content;

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
      const app = createRoot(container, [
        'div',
        [
          'span',
        ],
      ]);
      const parent = app.content;
      const child = parent.children[0];

      // then
      assert(parent.isElement());
      assert(child.isElement());
      assert.equal(child.parentElement, parent);
    });

    it('returns null for detached element', () => {

      // given
      class Component extends opr.Toolkit.Component {
        render() {
          return null;
        }
      }
      const component = createFromTemplate([Component]);

      // then
      assert.equal(component.parentElement, null);
    });
  });

  describe('get container', () => {

    it('returns container for a root component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createRoot(container, null);

      // then
      assert.equal(app.container, container);
    });

    it('returns container for a top-level element', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createRoot(container, [
        'div',
      ]);
      const element = app.content;

      // then
      assert(element.isElement());
      assert.equal(element.container, container);
    })

    it('returns container for a top-level component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createRoot(container, [Component]);
      const component = app.content;

      // then
      assert(component.isComponent());
      assert.equal(component.container, container);
    });

    it('returns container for a nested element', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createRoot(container, [
        'div',
        [
          'span',
        ],
      ]);
      const span = app.content.children[0];

      // then
      assert(span.isElement());
      assert.equal(span.container, container);
    });

    it('returns container for a nested component', () => {

      // given
      const container = document.createElement('container');

      // when
      const app = createRoot(container, [
        'div',
        [
          Component,
        ],
      ]);
      const component = app.content.children[0];

      // then
      assert(component.isComponent());
      assert.equal(component.container, container);
    });
  });

  describe('get root node', () => {

    it('returns closest root node for a component', () => {

      const container = document.createElement('container');

      // when
      const app = createRoot(container, [
        'div',
        [
          Component,
        ],
      ]);
      const component = app.content.children[0];

      // then
      assert(component.isComponent());
      assert.equal(component.rootNode, app);
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

        const root = createRootInstance(Root);
        root.container = container;
        const element = createElement('section', root);
        root.content = element;
        const component = createComponent();
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

        class Component extends opr.Toolkit.Component {
          render() {
            return null;
          }
        }
        const component = createFromTemplate([Component]);

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
        const component = createComponent();
        let expectedListeners;

        // when
        component.connectTo(Service, listeners);

        // then
        assert.equal(expectedListeners, listeners);
      });
    });

    describe('get ref', () => {

      it('returns element for component with child element', () => {

        // given
        const component = createComponent([
          'span',
        ]);

        // then
        assert.equal(component.ref.nodeName, 'SPAN');
      });

      it('returns comment node for empty component', () => {

        // given
        const component = createComponent();

        // then
        assert(component.ref.textContent.includes(Component.name));
      });
    });

    describe('replace child', () => {

      it('removes the comment', () => {

        // given
        const component = createComponent();
        const subcomponent = createComponent();
        subcomponent.parentNode = component;

        // when
        component.setContent(subcomponent);

        // then
        assert.equal(component.placeholder, subcomponent.placeholder);
      });

      describe('establishes the parent-child relation', () => {

        it('between component and subcomponent', () => {

          // given
          const component = createComponent();
          const subcomponent = createComponent();
          subcomponent.parentNode = component;


          // when
          component.setContent(subcomponent);

          // then
          assert.equal(component.content, subcomponent);
          assert.equal(subcomponent.parentNode, component);
        });

        it('between component and element', () => {

          // given
          const component = createComponent();
          const element = createElement('span');
          element.parentNode = component;

          // when
          component.setContent(element);

          // then
          assert.equal(component.content, element);
          assert.equal(element.parentNode, component);
        });
      });
    });

    describe('get child element', () => {

      it('returns child element for an app component', () => {

        // given
        const container = document.createElement('container');

        // when
        const app = createRoot(container, [
          'div',
        ]);
        const element = app.content;

        // then
        assert(element.isElement());
        assert.equal(app.childElement, element);
      });

      it('returns child element for a parent component', () => {

        // given
        const container = document.createElement('container');

        // when
        const app = createRoot(container, [
          Component,
          [
            'div',
          ],
        ]);
        const component = app.content;
        const element = component.content;

        // then
        assert(component.isComponent());
        assert(element.isElement());
        assert.equal(component.childElement, element);
      });

      it('returns leaf element for a top-level component', () => {

        // given
        const container = document.createElement('container');

        // when
        const app = createRoot(container, [
          Component,
          [
            Component,
            [
              'div',
            ],
          ],
        ]);
        const component = app.content;
        const subcomponent = component.content;
        const element = subcomponent.content;

        // then
        assert(component.isComponent());
        assert(subcomponent.isComponent());
        assert(element.isElement());
        assert.equal(app.childElement, element);
        assert.equal(component.childElement, element);
      });

      it('returns null for empty component', () => {

        // when
        const component = createComponent();

        // then
        assert.equal(component.childElement, null);
      });

      it('returns null for component with comment node', () => {

        // when
        const component = createComponent();

        // then
        assert.equal(component.childElement, null);
      });
    });

    describe('get placeholder', () => {

      it('returns a comment for a new component', () => {

        // given
        const component = createComponent();

        // then
        assert(component.placeholder);
        assert(component.placeholder.isComment());
        assert(component.placeholder.description.text.includes(Component.name));
      });

      it('returns null for a component with a child element', () => {

        // given
        const component = createComponent();
        const element = createElement('span');
        element.parentNode = component;

        // when
        component.setContent(element);

        // then
        assert.equal(component.placeholder, null);
      });

      it('returns a subcomponents placeholder for a component with a child',
         () => {

           // given
           const component = createComponent();
           const subcomponent = createComponent();
           subcomponent.parentNode = component;

           // when
           component.setContent(subcomponent);

           // then
           assert(component.placeholder);
           assert(component.placeholder.isComment());
           assert(component.placeholder, subcomponent.placeholder);
         });
    });
  });

  describe('Root', () => {

    const container = document.createElement('body');
    const root = createRootInstance(Root);
    root.container = container;

    describe('get initial state', () => {

      it('by default returns an empty object', async () => {
        assert.deepEqual(await root.getInitialState(), {});
      });
    });

    describe('get reducers', () => {

      it('by default returns an empty array', () => {
        assert.deepEqual(root.getReducers(), []);
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
        const child = createComponent();

        // when
        element.insertChild(child);

        // then
        assert.deepEqual(element.children, [child]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child at the beginning', () => {

        // given
        const element = createElement('section');
        const component = createComponent();
        element.insertChild(component);
        const child = createComponent();

        // when
        element.insertChild(child, 0);

        // then
        assert.deepEqual(element.children, [child, component]);
        assert.equal(child.parentNode, element);
      });

      it('inserts child in the middle', () => {

        // given
        const element = createElement('section');
        const firstComponent = createComponent();
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
        const component = createComponent();
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
        const component = createComponent();
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
        // assert.equal(component.parentNode, null);
        // assert.equal(span.parentNode, null);
      });

      it('removes the last child', () => {

        // given
        const parent = createElement('section');
        const child = createComponent();
        parent.insertChild(child);

        // when
        parent.removeChild(child);

        // then
        assert.equal(parent.children, undefined);
        // assert.equal(child.parentNode, null);
      });

      it('ignores node not being child', () => {

        const parent = createElement('section');
        const node = createComponent();

        // when
        assert.throws(() => parent.removeChild(node));
      });
    });

    describe('create commands dispatcher', () => {

      it('creates a dispatcher', () => {

        // given
        const root = createRoot();
        root.dispatch = sinon.spy();
        root.state.reducer = () => {};
        root.state.reducer.commands = {
          someCommand: (key, value) => ({
            key,
            value,
          }),
        };
        const commands = root.createCommandsDispatcher();

        // when
        commands.someCommand(commands.someCommand('foo', 'bar'));

        // then
        assert(root.dispatch.called);
        assert(root.dispatch.calledWith({
          key: 'foo',
          value: 'bar',
        }));
      });
    });
  });
})
