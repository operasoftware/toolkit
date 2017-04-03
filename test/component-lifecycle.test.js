describe('Component Lifecycle', () => {

  const ComponentTree = opr.Toolkit.ComponentTree;
  const ComponentLifecycle = opr.Toolkit.ComponentLifecycle;
  const Patch = opr.Toolkit.Patch;

  let container;
  let stub = sinon.spy();

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');

  const AbstractComponent = class extends opr.Toolkit.Component {
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

  const App = class extends opr.Toolkit.Root {
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
    sinon.stub(ComponentTree, 'createComponentInstance', def => {
      switch (def) {
        case Component:
          return new ComponentClass();
        case Subcomponent:
          return new SubcomponentClass();
        default:
          throw new Error('Unknown definition: ' + def);
      }
    });
  });

  afterEach(() => {
    ComponentTree.createComponentInstance.restore();
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

      it('removing nested components', () => {

        // given
        const [app, component] = createApp([
          Component, [
            Subcomponent
          ]
        ]);
        const patches = [Patch.removeComponent(component, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(ComponentClass, SubcomponentClass);
      });

      it('removing element containing component', () => {

        // given
        const [app, element] = createApp([
          'div', [
            Component
          ]
        ]);
        const patches = [Patch.removeElement(element, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(ComponentClass);
      });

      it('removing element containing nested components', () => {

        // given
        const [app, element] = createApp([
          'div', [
            Component, [
              Subcomponent
            ]
          ]
        ]);
        const patches = [Patch.removeElement(element, app)];

        // when
        ComponentLifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(ComponentClass, SubcomponentClass);
      });

      describe('from element:', () => {

        it('removing component', () => {

          // given
          const [app, element] = createApp([
            'div', [
              Component
            ]
          ]);
          const component = element.children[0];
          const patches = [Patch.removeChildNode(component, 0, element)];

          // when
          ComponentLifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(ComponentClass);
        });

        it('removing nested components', () => {

          // given
          const [app, element] = createApp([
            'div', [
              Component, [
                Subcomponent
              ]
            ]
          ]);
          const component = element.children[0];
          const patches = [Patch.removeChildNode(component, 0, element)];

          // when
          ComponentLifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(ComponentClass, SubcomponentClass);
        });

        it('removing element containing component', () => {

          // given
          const [app, element] = createApp([
            'div', [
              'span', [
                Component
              ]
            ]
          ]);
          const spanElement = element.children[0];
          const patches = [Patch.removeChildNode(spanElement, 0, element)];

          // when
          ComponentLifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(ComponentClass);
        });

        it('removing element containing nested components', () => {

          // given
          const [app, element] = createApp([
            'div', [
              'span', [
                Component, [
                  'span', [
                    Subcomponent
                  ]
                ]
              ]
            ]
          ]);
          const spanElement = element.children[0];
          const patches = [Patch.removeChildNode(spanElement, 0, element)];

          // when
          ComponentLifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(ComponentClass, SubcomponentClass);
        });
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

      it('removed nested components', () => {

        // given
        const [app, component] = createApp([
          Component, [
            Subcomponent
          ]
        ]);
        const patches = [Patch.removeComponent(component, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(SubcomponentClass, ComponentClass);
      });

      it('removed element containing component', () => {

        // given
        const [app, element] = createApp([
          'div', [
            Component
          ]
        ]);
        const patches = [Patch.removeElement(element, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(ComponentClass);
      });

      it('removed element containing nested components', () => {

        // given
        const [app, element] = createApp([
          'div', [
            Component, [
              'span', [
                Subcomponent
              ]
            ]
          ]
        ]);
        const patches = [Patch.removeElement(element, app)];

        // when
        ComponentLifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(SubcomponentClass, ComponentClass);
      });

      describe('from element:', () => {

        it('removed component', () => {

          // given
          const [app, element] = createApp([
            'div', [
              Component
            ]
          ]);
          const component = element.children[0];
          const patches = [Patch.removeChildNode(component, 0, element)];

          // when
          ComponentLifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(ComponentClass);
        });

        it('removed nested components', () => {

          // given
          const [app, element] = createApp([
            'div', [
              Component, [
                Subcomponent
              ]
            ]
          ]);
          const component = element.children[0];
          const patches = [Patch.removeChildNode(component, 0, element)];

          // when
          ComponentLifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(SubcomponentClass, ComponentClass);
        });

        it('removed element containing component', () => {

          // given
          const [app, element] = createApp([
            'div', [
              'span', [
                Component
              ]
            ]
          ]);
          const spanElement = element.children[0];
          const patches = [Patch.removeChildNode(spanElement, 0, element)];

          // when
          ComponentLifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(ComponentClass);
        });

        it('removed element containing nested components', () => {

          // given
          const [app, element] = createApp([
            'div', [
              'span', [
                Component, [
                  Subcomponent
                ]
              ]
            ]
          ]);
          const spanElement = element.children[0];
          const patches = [Patch.removeChildNode(spanElement, 0, element)];

          // when
          ComponentLifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(SubcomponentClass, ComponentClass);
        });
      });
    });
  });

  describe('=> throws an error for unsupported node type in:', () => {

    const unsupportedNode = {
      nodeType: 'invalid',
    };

    it('on node created', () => {
      assert.throws(() => {
        ComponentLifecycle.onNodeCreated(unsupportedNode)
      }, 'Unsupported node type: invalid');
    });

    it('on node attached', () => {
      assert.throws(() => {
        ComponentLifecycle.onNodeAttached(unsupportedNode)
      }, 'Unsupported node type: invalid');
    });

    it('on node destroyed', () => {
      assert.throws(() => {
        ComponentLifecycle.onNodeDestroyed(unsupportedNode)
      }, 'Unsupported node type: invalid');
    });

    it('on node detached', () => {
      assert.throws(() => {
        ComponentLifecycle.onNodeDetached(unsupportedNode)
      }, 'Unsupported node type: invalid');
    });
  });
});
