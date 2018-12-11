describe('Lifecycle', () => {

  const {
    Lifecycle,
    Patch,
  } = opr.Toolkit;

  let spy = sinon.spy();

  class Root extends opr.Toolkit.Root {
    render() {
      return this.children[0] || null;
    }
    onCreated() {
      spy('onCreated', this);
    }
    onAttached() {
      spy('onAttached', this);
    }
    onPropsReceived(props) {
      spy('onPropsReceived', this, props);
    }
    onUpdated(props) {
      spy('onUpdated', this, props);
    }
    onDestroyed() {
      spy('onDestroyed', this);
    }
    onDetached() {
      spy('onDetached', this);
    }
  }

  class Component extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
    onCreated() {
      spy('onCreated', this);
    }
    onAttached() {
      spy('onAttached', this);
    }
    onPropsReceived(props) {
      spy('onPropsReceived', this, props);
    }
    onUpdated(props) {
      spy('onUpdated', this, props);
    }
    onDestroyed() {
      spy('onDestroyed', this);
    }
    onDetached() {
      spy('onDetached', this);
    }
  }

  class Subcomponent extends Component {
    hasOwnMethod(method) {
      return [
        'onCreated',
        'onAttached',
        'onPropsReceived',
        'onUpdated',
        'onDestroyed',
        'onDetached',
      ].includes(method);
    }
  }

  let root;

  const createRootWith = template => {
    root = createRootInstance(Root);
    const node = createFromTemplate(template);
    root.child = node;
    return node;
  };

  const assertCalled = expectedCalls => {
    assert.equal(spy.callCount, expectedCalls.length);
    const actualCalls = spy.getCalls();
    for (let i = 0; i < expectedCalls.length; i++) {
      assert.equal(actualCalls[i].args[0], expectedCalls[i][0]);
      assert.equal(actualCalls[i].args[1].constructor, expectedCalls[i][1]);
    }
  };

  beforeEach(() => {
    spy.resetHistory();
  });

  describe('on created', () => {

    const assertOnCreatedCalled = (...components) => {
      assert.equal(spy.callCount, components.length);
      assertCalled(components.map(component => ['onCreated', component]));
    };

    describe('=> is called when: ', () => {

      it('creating root component', () => {

        // given
        const root = createRootInstance(Root);
        const patches = [
          Patch.initRootComponent(root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Root);
      });

      it('adding component', () => {

        // given
        const root = createRootInstance(Root);
        const component = createFromTemplate([Component]);
        const patches = [
          Patch.insertChild(component, 0, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component);
      });

      it('adding nested components', () => {

        // given
        const root = createRootInstance(Root);
        const component = createFromTemplate([
          Component,
          [
            Subcomponent,
          ],
        ]);
        const patches = [
          Patch.insertChild(component, 0, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component, Subcomponent);
      });

      it('adding element containing component', () => {

        // given
        const root = createRootInstance(Root);
        const element = createFromTemplate([
          'div',
          [
            Component,
          ],
        ]);
        const patches = [
          Patch.insertChild(element, 0, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component);
      });

      it('adding element containing nested components', () => {

        // given
        const root = createRootInstance(Root);
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
        const patches = [
          Patch.insertChild(element, 0, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component, Subcomponent);
      });

      it('inserting component', () => {

        // given
        const element = createFromTemplate([
          'div',
        ]);
        const component = createFromTemplate([Component]);
        const patches = [
          Patch.insertChild(component, 0, element),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component);
      });

      it('inserting nested components', () => {

        // given
        const div = createFromTemplate([
          'div',
          [
            'span',
          ],
        ]);
        const span = div.child;
        const component = createFromTemplate([
          Component,
          [
            Subcomponent,
          ],
        ]);
        const patches = [
          Patch.insertChild(component, 1, span),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component, Subcomponent);
      });

      it('inserting element containing component', () => {

        // given
        const div = createFromTemplate([
          'div',
        ]);
        const span = createFromTemplate([
          'span',
          [
            Component,
          ],
        ]);
        const patches = [
          Patch.insertChild(span, 0, div),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component);
      });

      it('inserting element containing nested components', () => {

        // given
        const div = createFromTemplate([
          'div',
        ]);
        const span = createFromTemplate([
          'span',
          [
            Component,
            [
              Subcomponent,
            ],
          ],
        ]);
        const patches = [Patch.insertChild(span, 0, div)];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnCreatedCalled(Component, Subcomponent);
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
        const root = createRootInstance(Root);
        const patches = [
          Patch.initRootComponent(root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Root);
      });

      it('added component', () => {

        // given
        const root = createRootInstance(Root);
        const component = createFromTemplate([
          Component,
        ]);
        const patches = [
          Patch.insertChild(component, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Component);
      });

      it('added nested components', () => {

        // given
        const root = createRootInstance(Root);
        const component = createFromTemplate([
          Component,
          [
            Subcomponent,
          ],
        ]);
        const patches = [
          Patch.insertChild(component, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Subcomponent, Component);
      });

      it('added element containing component', () => {

        // given
        const root = createRootInstance(Root);
        const element = createFromTemplate([
          'div',
          [
            Component,
          ],
        ]);
        const patches = [
          Patch.insertChild(element, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Component);
      });

      it('added element containing nested components', () => {

        // given
        const root = createRootInstance(Root);
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
        const patches = [
          Patch.insertChild(element, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Subcomponent, Component);
      });

      it('inserted component', () => {

        // given
        const element = createFromTemplate([
          'div',
        ]);
        const component = createFromTemplate([
          Component,
        ]);
        const patches = [
          Patch.insertChild(component, 0, element),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Component);
      });

      it('inserted nested components', () => {

        // given
        const div = createFromTemplate([
          'div',
          [
            'span',
          ],
        ]);
        const span = div.child;
        const component = createFromTemplate([
          Component,
          [
            Subcomponent,
          ],
        ]);
        const patches = [
          Patch.insertChild(component, 1, span),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Subcomponent, Component);
      });

      it('inserted element containing component', () => {

        // given
        const div = createFromTemplate([
          'div',
        ]);
        const span = createFromTemplate([
          'span',
          [
            Component,
          ],
        ]);
        const patches = [
          Patch.insertChild(span, 0, div),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Component);
      });

      it('inserted element containing nested components', () => {

        // given
        const div = createFromTemplate([
          'div',
        ]);
        const span = createFromTemplate([
          'span',
          [
            Component,
            [
              Subcomponent,
            ],
          ],
        ]);
        const patches = [
          Patch.insertChild(span, 0, div),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnAttachedCalled(Subcomponent, Component);
      });
    });
  });

  describe('on props received', () => {

    const assertOnPropsReceivedCalled = (component, props) => {
      assert.equal(spy.callCount, 1);
      assert.equal(spy.firstCall.args[0], 'onPropsReceived');
      assert.equal(spy.firstCall.args[1], component.sandbox);
      assert.deepEqual(spy.firstCall.args[2], props);
    };

    it('=> is called before updating component', () => {

      // given
      const props = {};
      const component = createFromTemplate([
        Component,
        props,
      ]);

      const updatedProps = {
        test: 'test',
      };
      const description = opr.Toolkit.Template.describe([
        Component,
        updatedProps,
      ]);

      const patches = [
        Patch.updateNode(component, description),
      ];

      // when
      Lifecycle.beforeUpdate(patches);

      // then
      assertOnPropsReceivedCalled(component, updatedProps);
    });
  });

  describe('on updated', () => {

    const assertOnUpdatedCalled = (component, prevProps) => {
      assert.equal(spy.callCount, 1);
      assert.equal(spy.firstCall.args[0], 'onUpdated');
      assert.equal(spy.firstCall.args[1], component.sandbox);
      assert.deepEqual(spy.firstCall.args[2], prevProps);
    };

    it('=> is called after updating component', () => {

      // given
      const props = {};
      const component = createFromTemplate([
        Component,
        props,
      ]);

      const updatedProps = {
        foo: 'bar',
      };
      const description = opr.Toolkit.Template.describe([
        Component,
        updatedProps,
      ]);
      const patches = [
        Patch.updateNode(component, description),
      ];

      // when
      Lifecycle.afterUpdate(patches);

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
        const component = createRootWith([
          Component,
        ]);

        const patches = [
          Patch.removeChild(component, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(Component);
      });

      it('removing nested components', () => {

        // given
        const component = createRootWith([
          Component, [
            Subcomponent,
          ],
        ]);
        const patches = [
          Patch.removeChild(component, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(Component, Subcomponent);
      });

      it('removing element containing component', () => {

        // given
        const element = createRootWith([
          'div',
          [
            Component,
          ],
        ]);
        const patches = [
          Patch.removeChild(element, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(Component);
      });

      it('removing element containing nested components', () => {

        // given
        const element = createRootWith([
          'div',
          [
            Component,
            [
              Subcomponent,
            ],
          ],
        ]);
        const patches = [
          Patch.removeChild(element, root),
        ];

        // when
        Lifecycle.beforeUpdate(patches);

        // then
        assertOnDestroyedCalled(Component, Subcomponent);
      });

      describe('from element:', () => {

        it('removing component', () => {

          // given
          const element = createRootWith([
            'div',
            [
              Component,
            ],
          ]);
          const component = element.children[0];
          const patches = [
            Patch.removeChild(component, 0, element),
          ];

          // when
          Lifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(Component);
        });

        it('removing nested components', () => {

          // given
          const element = createRootWith([
            'div',
            [
              Component,
              [
                Subcomponent,
              ],
            ],
          ]);
          const component = element.children[0];
          const patches = [
            Patch.removeChild(component, 0, element),
          ];

          // when
          Lifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(Component, Subcomponent);
        });

        it('removing element containing component', () => {

          // given
          const div = createRootWith([
            'div',
            [
              'span',
              [
                Component,
              ],
            ],
          ]);
          const span = div.children[0];
          const patches = [Patch.removeChild(span, 0, div)];

          // when
          Lifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(Component);
        });

        it('removing element containing nested components', () => {

          // given
          const div = createRootWith([
            'div',
            [
              'span',
              [
                Component,
                [
                  'span',
                  [
                    Subcomponent,
                  ],
                ],
              ],
            ],
          ]);
          const span = div.children[0];
          const patches = [Patch.removeChild(span, 0, div)];

          // when
          Lifecycle.beforeUpdate(patches);

          // then
          assertOnDestroyedCalled(Component, Subcomponent);
        });
      });
    });

    it('cleans up bindings to services', () => {

      // given
      const disconnect = sinon.spy();
      const Service = class {
        static connect() {
          return disconnect;
        }
      };
      const element = createFromTemplate([
        'div',
        [
          Component,
        ],
      ]);
      const component = element.children[0];
      const patches = [
        Patch.removeChild(component, 0, element),
      ];

      // when
      component.connectTo(Service);
      Lifecycle.beforeUpdate(patches);

      // then
      assert(disconnect.called);
      assert(disconnect.calledOnce);
    });
  });

  describe('on detached', () => {

    const assertOnDetachedCalled = (...components) => {
      assertCalled(components.map(component => ['onDetached', component]));
    };

    describe('=> is called when: ', () => {

      it('removed component', () => {

        // given
        const component = createFromTemplate([
          Component,
        ]);
        const patches = [
          Patch.removeChild(component, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(Component);
      });

      it('removed nested components', () => {

        // given
        const component = createRootWith([
          Component,
          [
            Subcomponent,
          ],
        ]);
        const patches = [
          Patch.removeChild(component, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(Subcomponent, Component);
      });

      it('removed element containing component', () => {

        // given
        const element = createRootWith([
          'div',
          [
            Component,
          ],
        ]);
        const patches = [
          Patch.removeChild(element, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(Component);
      });

      it('removed element containing nested components', () => {

        // given
        const element = createRootWith([
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
        const patches = [
          Patch.removeChild(element, root),
        ];

        // when
        Lifecycle.afterUpdate(patches);

        // then
        assertOnDetachedCalled(Subcomponent, Component);
      });

      describe('from element:', () => {

        it('removed component', () => {

          // given
          const element = createRootWith([
            'div',
            [
              Component,
            ],
          ]);
          const component = element.children[0];
          const patches = [
            Patch.removeChild(component, 0, element),
          ];

          // when
          Lifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(Component);
        });

        it('removed nested components', () => {

          // given
          const element = createRootWith([
            'div',
            [
              Component,
              [
                Subcomponent,
              ],
            ],
          ]);
          const component = element.children[0];
          const patches = [Patch.removeChild(component, 0, element)];

          // when
          Lifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(Subcomponent, Component);
        });

        it('removed element containing component', () => {

          // given
          const div = createRootWith([
            'div',
            [
              'span',
              [
                Component,
              ],
            ],
          ]);
          const span = div.children[0];
          const patches = [
            Patch.removeChild(span, 0, div),
          ];

          // when
          Lifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(Component);
        });

        it('removed element containing nested components', () => {

          // given
          const div = createRootWith([
            'div',
            [
              'span',
              [
                Component,
                [
                  Subcomponent,
                ],
              ],
            ],
          ]);
          const span = div.children[0];
          const patches = [Patch.removeChild(span, 0, div)];

          // when
          Lifecycle.afterUpdate(patches);

          // then
          assertOnDetachedCalled(Subcomponent, Component);
        });
      });
    });
  });

  describe('=> throws an error for unsupported node type in:', () => {

    const unsupportedNode = {
      nodeType: 'invalid',
    };

    it('on node created', () => {
      assert.throws(
          () => Lifecycle.onNodeCreated(unsupportedNode),
          'Unsupported node type: invalid');
    });

    it('on node attached', () => {
      assert.throws(
          () => Lifecycle.onNodeAttached(unsupportedNode),
          'Unsupported node type: invalid');
    });

    it('on node destroyed', () => {
      assert.throws(
          () => Lifecycle.onNodeDestroyed(unsupportedNode),
          'Unsupported node type: invalid');
    });

    it('on node detached', () => {
      assert.throws(
          () => Lifecycle.onNodeDetached(unsupportedNode),
          'Unsupported node type: invalid');
    });
  });
});
