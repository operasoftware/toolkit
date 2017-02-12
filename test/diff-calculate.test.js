global.Reactor = createCore();
const VirtualNode = Reactor.VirtualNode;
const ComponentTree = Reactor.ComponentTree;
const Diff = Reactor.Diff;
const Patch = Reactor.Patch;

describe('Diff => calculate patches', () => {

  describe('=> on an Element', () => {

    const createTrees = (...templates) => {
      let currentTemplate;
      return templates.map(
          template => ComponentTree.createFromTemplate(template));
    };

    it('adds an attribute', () => {

      // given
      const template = [
        'span', {}
      ];
      const nextTemplate = [
        'span', {
          class: 'next'
        }
      ];

      // when
      const [tree, nextTree] = createTrees(template, nextTemplate);
      const patches = Diff.calculate(tree, nextTree);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'class');
      assert.equal(patches[0].value, 'next');
    });

    it('replaces an attribute', () => {

      // given
      const template = [
        'span', {
          name: 'prev'
        }
      ];
      const nextTemplate = [
        'span', {
          name: 'next'
        }
      ];

      // when
      const [tree, nextTree] = createTrees(template, nextTemplate);
      const patches = Diff.calculate(tree, nextTree);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REPLACE_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'name');
      assert.equal(patches[0].value, 'next');
    });

    it('removes an attribute', () => {

      // given
      const template = [
        'span', {
          name: 'prev'
        }
      ];
      const nextTemplate = [
        'span', {}
      ];

      // when
      const [tree, nextTree] = createTrees(template, nextTemplate);
      const patches = Diff.calculate(tree, nextTree);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'name');
    });

    it('adds a listener', () => {

      // given
      const listener = () => {};

      const template = [
        'span', {}
      ];
      const nextTemplate = [
        'span', {
          onClick: listener
        }
      ];

      // when
      const [tree, nextTree] = createTrees(template, nextTemplate);
      const patches = Diff.calculate(tree, nextTree);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'click');
      assert.equal(patches[0].listener, listener);
    });

    it('replaces a listener', () => {

      // given
      const listener = () => {};
      const anotherListener = () => {};

      const template = [
        'span', {
          onClick: listener
        }
      ];
      const nextTemplate = [
        'span', {
          onClick: anotherListener
        }
      ];

      // when
      const [tree, nextTree] = createTrees(template, nextTemplate);
      const patches = Diff.calculate(tree, nextTree);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REPLACE_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'click');
      assert.equal(patches[0].removed, listener);
      assert.equal(patches[0].added, anotherListener);
    });

    it('removes a listener', () => {

      // given
      const listener = () => {};

      const template = [
        'span', {
          onClick: listener
        }
      ];
      const nextTemplate = [
        'span', {}
      ];

      // when
      const [tree, nextTree] = createTrees(template, nextTemplate);
      const patches = Diff.calculate(tree, nextTree);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'click');
      assert.equal(patches[0].listener, listener);
    });

    describe.only('reconcile children', () => {

      const assertInsertChildNode = (patch, name, at) => {
        assert.equal(patch.type, Patch.Type.INSERT_CHILD_NODE);
        assert.equal(patch.node.name, name);
        assert.equal(patch.at, at);
      };

      const assertMoveChildNode = (patch, name, from, to) => {
        assert.equal(patch.type, Patch.Type.MOVE_CHILD_NODE);
        assert.equal(patch.node.name, name);
        assert.equal(patch.from, from);
        assert.equal(patch.to, to);
      };

      const assertRemoveChildNode = (patch, name, at) => {
        assert.equal(patch.type, Patch.Type.REMOVE_CHILD_NODE);
        assert.equal(patch.node.name, name);
        assert.equal(patch.at, at);
      };

      describe('=> with keys', () => {

        const getChildren = (...items) => items.map(name => [
          name, {
            key: name
          }
        ]);

        it('inserts element at the beginning', () => {

          // given
          const template = [
            'section', ...getChildren('div', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('X', 'div', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertInsertChildNode(patches[0], 'X', 0);
        });

        it('inserts element at the end', () => {

          // given
          const template = [
            'section', ...getChildren('div', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('div', 'span', 'X')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertInsertChildNode(patches[0], 'X', 2);
        });

        it('moves an element up', () => {

          // given
          const template = [
            'section', ...getChildren('section', 'p', 'div', 'X', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'X', 'p', 'div', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 3, 1);
        });

        it('moves an element down', () => {

          // given
          const template = [
            'section', ...getChildren('section', 'X', 'p', 'div', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'p', 'div', 'X', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 1, 3);
        });

        it('moves an element to the beginning', () => {
          
          // given
          const template = [
            'section', ...getChildren('section', 'p', 'div', 'span', 'X')
          ];
          const nextTemplate = [
            'section', ...getChildren('X', 'section', 'p', 'div', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 4, 0);
        });

        it('moves an element to the end', () => {
          
          // given
          const template = [
            'section', ...getChildren('X', 'section', 'p', 'div', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'p', 'div', 'span', 'X')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 0, 4);          
        });

        it('swaps two elements', () => {
          
          // given
          const template = [
            'section', ...getChildren('section', 'X', 'div', 'Y', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'Y', 'div', 'X', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 2);
          assertMoveChildNode(patches[0], 'Y', 3, 1);          
          assertMoveChildNode(patches[1], 'div', 3, 2);          
        });

        it('swaps three elements', () => {
          
          // given
          const template = [
            'section', ...getChildren('section', 'Z', 'p', 'X', 'div', 'Y', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'X', 'p', 'Y', 'div', 'Z', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 3);
          assertMoveChildNode(patches[0], 'Z', 1, 5);          
          assertMoveChildNode(patches[1], 'div', 3, 4);          
          assertMoveChildNode(patches[2], 'p', 1, 2);          
        });

        it('removes an element', () => {
          
          // given
          const template = [
            'section', ...getChildren('section', 'p', 'div', 'X', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'p', 'div', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 1);
          assertRemoveChildNode(patches[0], 'X', 3);          
        });

        it('inserts and removes elements', () => {
          
          // given
          const template = [
            'section', ...getChildren('section', 'p', 'div', 'X', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'Y', 'p', 'div', 'span')
          ];

          // when
          const [tree, nextTree] = createTrees(template, nextTemplate);
          const patches = Diff.calculate(tree, nextTree);

          // then
          assert.equal(patches.length, 2);
          assertRemoveChildNode(patches[0], 'X', 3);          
          assertInsertChildNode(patches[1], 'Y', 1);          
        });
      });

      describe('without keys', () => {

        it.skip('inserts an element');
        it.skip('moves an element up');
        it.skip('moves an element down');
        it.skip('swaps two elements');
        it.skip('removes an element');
        it.skip('inserts and removes elements');
        it.skip('inserts, moves and removes elements');
      });

      describe.skip('with mixed keys', () => {

        it.skip('inserts an element');
        it.skip('moves an element up');
        it.skip('moves an element down');
        it.skip('swaps two elements');
        it.skip('removes an element');
        it.skip('inserts and removes elements');
        it.skip('inserts, moves and removes elements');
        it.skip('handles duplicated keys');
      });
    });
  });

  describe('=> on a Component', () => {

    const Component = Symbol.for('Component');
    const Subcomponent = Symbol.for('Subcomponent');
    const OtherComponent = Symbol.for('OtherComponent');
    const createComponents = (props, children, nextProps, nextChildren) => {
      return [
        ComponentTree.create(Component, props, children),
        ComponentTree.create(Component, nextProps, nextChildren)
      ];
    };

    const ComponentClass = class extends Reactor.Component {
      render() {
        return this.children[0] || null;
      }
    };
    const SubcomponentClass = class extends Reactor.Component {
      render() {
        return null;
      }
    };
    const OtherComponentClass = class extends Reactor.Component {
      render() {
        return null;
      }
    };

    beforeEach(() => {
      ComponentTree.createInstance = def => {
        switch (def) {
          case Component:
            return new ComponentClass();
          case Subcomponent:
            return new SubcomponentClass();
          case OtherComponent:
            return new OtherComponentClass();
        }
      };
    });

    const assertComponentUpdate = (patch, component, props) => {
      assert.equal(patch.type, Patch.Type.UPDATE_COMPONENT);
      assert.equal(patch.target, component);
      assert.equal(patch.props, props);
    };

    it('adds an element', () => {

      // given
      const props = {};
      const children = [];

      const nextProps = { child: true };
      const nextChildren = [
        [ 'div' ]
      ];

      // when
      const [component, nextComponent] = createComponents(
        props, children,
        nextProps, nextChildren,
      );

      const patches = Diff.calculate(component, nextComponent);

      // then
      assert.equal(patches.length, 2);

      assertComponentUpdate(patches[0], component, nextProps);

      assert.equal(patches[1].type, Patch.Type.ADD_ELEMENT);
      assert(patches[1].parent.isComponent());
      assert.equal(patches[1].parent, component);
      assert(patches[1].element.isElement());
      assert.equal(patches[1].element.name, 'div');
    });

    it('removes an element', () => {

      // given
      const props = { child: true };
      const children = [
        [ 'div' ]
      ];

      const nextProps = {};
      const nextChildren = [];

      // when
      const [component, nextComponent] = createComponents(
        props, children,
        nextProps, nextChildren,
      );

      const patches = Diff.calculate(component, nextComponent);

      // then
      assert.equal(patches.length, 2);

      assertComponentUpdate(patches[0], component, nextProps);

      assert.equal(patches[1].type, Patch.Type.REMOVE_ELEMENT);
      assert(patches[1].parent.isComponent());
      assert.equal(patches[1].parent, component);
      assert(patches[1].element.isElement());
      assert.equal(patches[1].element.name, 'div');      
    });

    it('adds a component', () => {

      // given
      const props = {};
      const children = [];

      const nextProps = { child: true };
      const nextChildren = [
        [ Subcomponent ]
      ];

      // when
      const [component, nextComponent] = createComponents(
        props, children,
        nextProps, nextChildren,
      );

      const patches = Diff.calculate(component, nextComponent);

      // then
      assert.equal(patches.length, 2);

      assertComponentUpdate(patches[0], component, nextProps);

      assert.equal(patches[1].type, Patch.Type.ADD_COMPONENT);
      assert(patches[1].parent.isComponent());
      assert.equal(patches[1].parent, component);
      assert(patches[1].component.isComponent());
      assert.equal(patches[1].component.constructor, SubcomponentClass);
    });

    it('removes a component', () => {

      // given
      const props = { child: true };
      const children = [
        [ Subcomponent ]
      ];

      const nextProps = {};
      const nextChildren = [];

      // when
      const [component, nextComponent] = createComponents(
        props, children,
        nextProps, nextChildren,
      );

      const patches = Diff.calculate(component, nextComponent);

      // then
      assert.equal(patches.length, 2);

      assertComponentUpdate(patches[0], component, nextProps);

      assert.equal(patches[1].type, Patch.Type.REMOVE_COMPONENT);
      assert(patches[1].parent.isComponent());
      assert.equal(patches[1].parent, component);
      assert(patches[1].component.isComponent());
      assert.equal(patches[1].component.constructor, SubcomponentClass);      
    });

    describe('replaces a child element', () => {

      it('with an element', () => {

        // given
        const props = { child: 'div' };
        const children = [
          [ 'div' ]
        ];

        const nextProps = { child: 'span' };
        const nextChildren = [
          [ 'span' ]
        ];

        // when
        const [component, nextComponent] = createComponents(
          props, children,
          nextProps, nextChildren,
        );

        const patches = Diff.calculate(component, nextComponent);

        // then
        assert.equal(patches.length, 3);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[1].type, Patch.Type.REMOVE_ELEMENT);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].element.isElement());
        assert.equal(patches[1].element.name, 'div');

        assert.equal(patches[2].type, Patch.Type.ADD_ELEMENT);
        assert(patches[2].parent.isComponent());
        assert.equal(patches[2].parent, component);
        assert(patches[2].element.isElement());
        assert.equal(patches[2].element.name, 'span');
      });

      it('with a component', () => {

        // given
        const props = { child: 'div' };
        const children = [
          [ 'div' ]
        ];

        const nextProps = { child: 'component' };
        const nextChildren = [
          [ Subcomponent ]
        ];

        // when
        const [component, nextComponent] = createComponents(
          props, children,
          nextProps, nextChildren,
        );

        const patches = Diff.calculate(component, nextComponent);

        // then
        assert.equal(patches.length, 3);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[1].type, Patch.Type.REMOVE_ELEMENT);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].element.isElement());
        assert.equal(patches[1].element.name, 'div');

        assert.equal(patches[2].type, Patch.Type.ADD_COMPONENT);
        assert(patches[2].parent.isComponent());
        assert.equal(patches[2].parent, component);
        assert(patches[2].component.isComponent());
        assert.equal(patches[2].component.constructor, SubcomponentClass);
      });

    });
    
    describe('replaces a child component', () => {
      
      it('with an element', () => {

        // given
        const props = { child: 'subcomponent' };
        const children = [
          [ Subcomponent ]
        ];

        const nextProps = { child: 'div' };
        const nextChildren = [
          [ 'div' ]
        ];

        // when
        const [component, nextComponent] = createComponents(
          props, children,
          nextProps, nextChildren,
        );

        const patches = Diff.calculate(component, nextComponent);

        // then
        assert.equal(patches.length, 3);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[1].type, Patch.Type.REMOVE_COMPONENT);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].component.isComponent());
        assert.equal(patches[1].component.constructor, SubcomponentClass);

        assert.equal(patches[2].type, Patch.Type.ADD_ELEMENT);
        assert(patches[2].parent.isComponent());
        assert.equal(patches[2].parent, component);
        assert(patches[2].element.isElement());
        assert.equal(patches[2].element.name, 'div');
      });

      it('with a component', () => {

        // given
        const props = { child: 'subcomponent' };
        const children = [
          [ Subcomponent ]
        ];

        const nextProps = { child: 'other-component' };
        const nextChildren = [
          [ OtherComponent ]
        ];

        // when
        const [component, nextComponent] = createComponents(
          props, children,
          nextProps, nextChildren,
        );

        const patches = Diff.calculate(component, nextComponent);

        // then
        assert.equal(patches.length, 3);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[1].type, Patch.Type.REMOVE_COMPONENT);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].component.isComponent());
        assert.equal(patches[1].component.constructor, SubcomponentClass);

        assert.equal(patches[2].type, Patch.Type.ADD_COMPONENT);
        assert(patches[2].parent.isComponent());
        assert.equal(patches[2].parent, component);
        assert(patches[2].component.isComponent());
        assert.equal(patches[2].component.constructor, OtherComponentClass);
      });
    });
  });
});
