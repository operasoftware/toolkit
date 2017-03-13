describe('Component Lifecycle', () => {

  const ComponentTree = Reactor.ComponentTree;
  const ComponentLifecycle = Reactor.ComponentLifecycle;
  const Patch = Reactor.Patch;

  let container;
  let stub = sinon.spy();

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');

  const AbstractComponent = class extends Reactor.Component {
    onCreated() {
      stub('onCreated', this);
    }
    onAttached() {
      stub('onAttached', this);
    }
    onPropsReceived(props) {
      stub('onPropsReceived', this, props);
    }
    onUpdated(props) {
      stub('onUpdated', this, props);
    }
    onDestroyed() {
      stub('onDestroyed', this);
    }
    onDetached() {
      stub('onDetached', this);
    }
  };

  const App = class extends Reactor.Root {
    constructor() {
      super(container);
    }
    onCreated() {
      stub('onCreated', this);
    }
    onAttached() {
      stub('onAttached', this);
    }
    onPropsReceived(props) {
      stub('onPropsReceived', this, props);
    }
    onUpdated(props) {
      stub('onUpdated', this, props);
    }
    onDestroyed() {
      stub('onDestroyed', this);
    }
    onDetached() {
      stub('onDetached', this);
    }
  };

  const createApp = template => {
    const app = new App();
    let node = null;
    if (template) {
      node = ComponentTree.createFromTemplate(template);
      if (node.isElement()) {
        Patch.addElement(node, app).apply();
      }
      if (node.isComponent()) {
        Patch.addComponent(node, app).apply();
      }
    }
    return [app, node];
  };

  const ComponentClass = class extends AbstractComponent {
    render() {
      return this.children ? this.children[0] : null;
    }
  };

  const SubcomponentClass = class extends AbstractComponent {
    render() {
      return this.children ? this.children[0] : null;
    }
  };

  const assertCalled = expectedCalls => {
    assert.equal(stub.callCount, expectedCalls.length);
    const actualCalls = stub.getCalls();
    for (let i = 0; i < expectedCalls.length; i++) {
      assert.equal(actualCalls[i].args[0], expectedCalls[i][0]);
      assert.equal(actualCalls[i].args[1].constructor, expectedCalls[i][1]);
    }
  };

  beforeEach(() => {
    container = document.createElement('app');
    stub.reset();
    ComponentTree.createComponentInstance = def => {
      switch (def) {
        case Component:
          return new ComponentClass();
        case Subcomponent:
          return new SubcomponentClass();
        default:
          throw new Error('Unknown definition: ' + def);
      }
    };
  });

  describe('on created', () => {

    const assertOnCreatedCalled = (...components) => {
      assertCalled(components.map(component => ['onCreated', component]));
    };

    describe('=> is called when: ', () => {

      it('creating root component', () => {

        // given
        const app = new App();
        const patches = [Patch.createRootComponent(app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(App);
      });

      it('adding component', () => {

        // given
        const app = new App();
        const component = ComponentTree.createFromTemplate([
          Component
        ])
        const patches = [Patch.addComponent(component, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass);
      });

      it('adding nested components', () => {

        // given
        const app = new App();
        const component = ComponentTree.createFromTemplate([
          Component, [
            Subcomponent,
          ]
        ])
        const patches = [Patch.addComponent(component, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass, SubcomponentClass);
      });

      it('adding element containing component', () => {

        // given
        const app = new App();
        const element = ComponentTree.createFromTemplate([
          'div', [
            Component,
          ]
        ])
        const patches = [Patch.addElement(element, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass);
      });

      it('adding element containing nested components', () => {

        // given
        const app = new App();
        const element = ComponentTree.createFromTemplate([
          'div', [
            Component, [
              'span', [
                Subcomponent,
              ]
            ]
          ]
        ])
        const patches = [Patch.addElement(element, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass, SubcomponentClass);
      });

      it('inserting component', () => {

        // given
        const [app, element] = createApp([
          'div',
        ]);
        const component = ComponentTree.createFromTemplate([
          Component,
        ]);
        const patches = [Patch.insertChildNode(component, 0, element)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass);
      });

      it('inserting nested components', () => {

        // given
        const [app, element] = createApp([
          'div', [
            'span',
          ]
        ]);
        const component = ComponentTree.createFromTemplate([
          Component, [
            Subcomponent
          ]
        ]);
        const patches = [Patch.insertChildNode(component, 1, element)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass, SubcomponentClass);
      });

      it('inserting element containing component', () => {

        // given
        const [app, element] = createApp([
          'div'
        ]);
        const spanElement = ComponentTree.createFromTemplate([
          'span', [
            Component
          ]
        ]);
        const patches = [Patch.insertChildNode(spanElement, 0, element)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass);
      });

      it('inserting element containing nested components', () => {

        // given
        const [app, element] = createApp([
          'div'
        ]);
        const spanElement = ComponentTree.createFromTemplate([
          'span', [
            Component, [
              Subcomponent,
            ]
          ]
        ]);
        const patches = [Patch.insertChildNode(spanElement, 0, element)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(ComponentClass, SubcomponentClass);
      });
    });
  });

  describe('on attached', () => {

    const assertOnAttachedCalled = (...components) => {
      assertCalled(components.map(component => ['onAttached', component]));
    };

    describe('=> is called when: ', () => {

      it('created root component', () => {

        // given
        const app = new App();
        const patches = [Patch.createRootComponent(app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(App);
      });

      it('added component', () => {

        // given
        const app = new App();
        const component = ComponentTree.createFromTemplate([
          Component
        ])
        const patches = [Patch.addComponent(component, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(ComponentClass);
      });

      it('added nested components', () => {

        // given
        const app = new App();
        const component = ComponentTree.createFromTemplate([
          Component, [
            Subcomponent,
          ]
        ])
        const patches = [Patch.addComponent(component, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(SubcomponentClass, ComponentClass);
      });

      it('added element containing component', () => {

        // given
        const app = new App();
        const element = ComponentTree.createFromTemplate([
          'div', [
            Component,
          ]
        ])
        const patches = [Patch.addElement(element, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(ComponentClass);
      });

      it('added element containing nested components', () => {

        // given
        const app = new App();
        const element = ComponentTree.createFromTemplate([
          'div', [
            Component, [
              'span', [
                Subcomponent,
              ]
            ]
          ]
        ])
        const patches = [Patch.addElement(element, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(SubcomponentClass, ComponentClass);
      });

      it('inserted component', () => {

        // given
        const [app, element] = createApp([
          'div',
        ]);
        const component = ComponentTree.createFromTemplate([
          Component,
        ]);
        const patches = [Patch.insertChildNode(component, 0, element)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(ComponentClass);
      });

      it('inserted nested components', () => {

        // given
        const [app, element] = createApp([
          'div', [
            'span',
          ]
        ]);
        const component = ComponentTree.createFromTemplate([
          Component, [
            Subcomponent
          ]
        ]);
        const patches = [Patch.insertChildNode(component, 1, element)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(SubcomponentClass, ComponentClass);
      });

      it('inserted element containing component', () => {

        // given
        const [app, element] = createApp([
          'div'
        ]);
        const spanElement = ComponentTree.createFromTemplate([
          'span', [
            Component
          ]
        ]);
        const patches = [Patch.insertChildNode(spanElement, 0, element)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(ComponentClass);
      });

      it('inserted element containing nested components', () => {

        // given
        const [app, element] = createApp([
          'div'
        ]);
        const spanElement = ComponentTree.createFromTemplate([
          'span', [
            Component, [
              Subcomponent,
            ]
          ]
        ]);
        const patches = [Patch.insertChildNode(spanElement, 0, element)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(SubcomponentClass, ComponentClass);
      });
    });
  });

  describe('on props received', () => {

    const assertOnPropsReceivedCalled = (component, props) => {
      assert.equal(stub.callCount, 1);
      assert.equal(stub.firstCall.args[0], 'onPropsReceived');
      assert.equal(stub.firstCall.args[1], component);
      assert.equal(stub.firstCall.args[2], props);
    };

    it('=> is called before updating component', () => {

      // given
      const component = new ComponentClass();
      const props = {
        test: 'test'
      };
      const patches = [Patch.updateComponent(component, props)];

      // when
      ComponentLifecycle.beforeUpdate(patches);

      // then
      assertOnPropsReceivedCalled(component, props);
    });
  });

  describe('on updated', () => {

    const assertOnUpdatedCalled = (component, props) => {
      assert.equal(stub.callCount, 1);
      assert.equal(stub.firstCall.args[0], 'onUpdated');
      assert.equal(stub.firstCall.args[1], component);
      assert.equal(stub.firstCall.args[2], props);
    };

    it('=> is called after updating component', () => {

      // given
      const component = new ComponentClass();
      const props = {
        foo: 'bar'
      };
      const patches = [Patch.updateComponent(component, props)];

      // when
      ComponentLifecycle.afterUpdate(patches);

      // then
      assertOnUpdatedCalled(component, props);
    });
  });

  describe('on destroyed', () => {

    const assertOnDestroyedCalled = (...components) => {
      assertCalled(components.map(component => ['onDestroyed', component]));
    };

    describe('=> is called when: ', () => {

      it('removing component', () => {

        // given
        const [app, component] = createApp([
          Component
        ]);
        const patches = [Patch.removeComponent(component, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(ComponentClass);
      });

      it.skip('removed nested components');
      it.skip('removed element containing component');
      it.skip('removed element containing nested components');

      describe('from element:', () => {
        it.skip('removed component from element');
        it.skip('removed nested components from element');
        it.skip('removed element containing component');
        it.skip('removed element containing nested components');
      });
    });
  });

  describe('on detached', () => {

    const assertOnDetachedCalled = (...components) => {
      assertCalled(components.map(component => ['onDetached', component]));
    };

    describe('=> is called when: ', () => {

      it('removed component', () => {

        // given
        const [app, component] = createApp([
          Component
        ]);
        const patches = [Patch.removeComponent(component, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(ComponentClass);
      });

      it.skip('removed nested components');
      it.skip('removed element containing component');
      it.skip('removed element containing nested components');

      describe('from element:', () => {
        it.skip('removed component from element');
        it.skip('removed nested components from element');
        it.skip('removed element containing component');
        it.skip('removed element containing nested components');
      });
    });
  });
});