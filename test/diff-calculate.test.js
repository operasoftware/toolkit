describe('Diff => calculate patches', () => {

  const VirtualNode = opr.Toolkit.VirtualNode;
  const VirtualDOM = opr.Toolkit.VirtualDOM;
  const Diff = opr.Toolkit.Diff;
  const Patch = opr.Toolkit.Patch;

  const Template = opr.Toolkit.Template;

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');
  const OtherComponent = Symbol.for('OtherComponent');

  const ComponentWithoutKey = Symbol.for('ComponentWithoutKey');
  const ComponentWithKey = Symbol.for('ComponentWithKey');

  class ComponentClass extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
    onUpdated() {
    }
  };

  class SubcomponentClass extends opr.Toolkit.Component {
    render() {
      return null;
    }
  };

  class OtherComponentClass extends opr.Toolkit.Component {
    render() {
      return null;
    }
  };

  class ComponentWithoutKeyClass extends opr.Toolkit.Component {
    render() {
      return [
        'span',
      ];
    }
  }

  class ComponentWithKeyClass extends opr.Toolkit.Component {

    getKey() {
      return this.props.name;
    }

    render() {
      return [
        'span',
      ];
    }
  }

  const getComponentClass = symbol => {
    if (typeof symbol === 'string') {
      symbol = Symbol.for(symbol);
    }
    switch (symbol) {
      case Component:
        return ComponentClass;
      case Subcomponent:
        return SubcomponentClass;
      case OtherComponent:
        return OtherComponentClass;
      case ComponentWithoutKey:
        return ComponentWithoutKeyClass;
      case ComponentWithKey:
        return ComponentWithKeyClass;
    }
  };

  beforeEach(() => {
    sinon.stub(VirtualDOM, 'getComponentClass', getComponentClass);
  });

  afterEach(() => {
    VirtualDOM.getComponentClass.restore();
  });

  const calculatePatches = (node, description) => {
    const root = utils.createRoot();
    const diff = new Diff(root);
    if (node.isElement()) {
      diff.elementPatches(node, description);
    }
    if (node.isComponent()) {
      diff.componentPatches(node, description);
    }
    return diff.patches;
  };

  describe('=> on an Element', () => {

    const createTrees = (currentTemplate, nextTemplate) => {
      return [
        utils.createFromTemplate(currentTemplate),
        utils.createDescription(nextTemplate),
      ];
    };

    it('adds an attribute', () => {

      // given
      const template = [
        'input',
      ];
      const nextTemplate = [
        'input',
        {
          value: 'next',
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'value');
      assert.equal(patches[0].value, 'next');
    });

    it('replaces an attribute', () => {

      // given
      const template = [
        'span',
        {
          name: 'prev',
        },
      ];
      const nextTemplate = [
        'span',
        {
          name: 'next',
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

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
        'span',
        {
          name: 'prev',
        },
      ];
      const nextTemplate = [
        'span',
        {},
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'name');
    });

    it('adds a data attribute', () => {

      // given
      const template = [
        'input',
        {},
      ];
      const nextTemplate = [
        'input',
        {
          dataset: {
            reactorId: 666,
          },
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_DATA_ATTRIBUTE);
      assert.equal(patches[0].name, 'reactorId');
      assert.equal(patches[0].value, '666');
      assert(patches[0].target.isElement());
    });

    it('replaces a data attribute', () => {

      // given
      const template = [
        'div',
        {
          dataset: {
            customAttrName: 'foo',
          },
        },
      ];
      const nextTemplate = [
        'div',
        {
          dataset: {
            customAttrName: ['foo', 'bar'],
          },
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REPLACE_DATA_ATTRIBUTE);
      assert.equal(patches[0].name, 'customAttrName');
      assert.equal(patches[0].value, 'foobar');
      assert(patches[0].target.isElement());
    });

    it('removes a data attribute', () => {

      // given
      const template = [
        'div',
        {
          dataset: {
            id: 42,
          },
        },
      ];
      const nextTemplate = ['div'];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_DATA_ATTRIBUTE);
      assert.equal(patches[0].name, 'id');
      assert(patches[0].target.isElement());
    });

    it('adds a style property', () => {

      // given
      const template = ['input', {}];
      const nextTemplate = ['input', {style: {width: [100, 'px']}}];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_STYLE_PROPERTY);
      assert.equal(patches[0].property, 'width');
      assert.equal(patches[0].value, '100px');
      assert(patches[0].target.isElement());
    });

    it('replaces a style property', () => {

      // given
      const template = [
        'div',
        {
          style: {
            height: '100%',
          },
        },
      ];
      const nextTemplate = [
        'div',
        {
          style: {
            height: '50%',
          },
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REPLACE_STYLE_PROPERTY);
      assert.equal(patches[0].property, 'height');
      assert.equal(patches[0].value, '50%');
      assert(patches[0].target.isElement());
    });

    it('removes a style property', () => {

      // given
      const template = [
        'div',
        {
          style: {
            animationDelay: '.666s',
          },
        },
      ];
      const nextTemplate = ['div'];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_STYLE_PROPERTY);
      assert.equal(patches[0].property, 'animationDelay');
      assert(patches[0].target.isElement());
    });

    it('adds a class name', () => {

      // given
      const template = [
        'div',
        {
          class: 'one',
        },
      ];
      const nextTemplate = [
        'div',
        {
          class: 'one two',
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_CLASS_NAME);
      assert.equal(patches[0].name, 'two');
      assert(patches[0].target.isElement());
    });

    it('removes a class name', () => {

      // given
      const template = [
        'div',
        {
          class: 'some-name',
        },
      ];
      const nextTemplate = [
        'div',
        {},
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_CLASS_NAME);
      assert.equal(patches[0].name, 'some-name');
      assert(patches[0].target.isElement());
    });

    it('adds a listener', () => {

      // given
      const listener = () => {};

      const template = ['span', {}];
      const nextTemplate = ['span', {onClick: listener}];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'onClick');
      assert.equal(patches[0].listener, listener);
    });

    it('replaces a listener', () => {

      // given
      const listener = () => {};
      const anotherListener = () => {};

      const template = [
        'span',
        {
          onClick: listener,
        },
      ];
      const nextTemplate = [
        'span',
        {
          onClick: anotherListener,
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REPLACE_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'onClick');
      assert.equal(patches[0].removed, listener);
      assert.equal(patches[0].added, anotherListener);
    });

    it('removes a listener', () => {

      // given
      const listener = () => {};

      const template = [
        'span',
        {
          onClick: listener,
        },
      ];
      const nextTemplate = [
        'span',
        {},
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'onClick');
      assert.equal(patches[0].listener, listener);
    });

    it('adds metadata', () => {

      // given
      const metadata = {
        a: 'some-value',
      };

      const template = [
        'span',
      ];
      const nextTemplate = [
        'span',
        {
          metadata,
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.ADD_METADATA);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'a');
      assert.equal(patches[0].value, 'some-value');
    });

    it('removes metadata', () => {

      // given
      const metadata = {
        a: 'some-value',
      };

      const template = [
        'span',
        {
          metadata,
        },
      ];
      const nextTemplate = [
        'span',
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REMOVE_METADATA);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'a');
    });

    it('replaces metadata', () => {

      // given
      const template = [
        'span',
        {
          metadata: {
            a: 'xxx',
          },
        },
      ];
      const nextTemplate = [
        'span',
        {
          metadata: {
            a: 'yyy',
          },
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 1);
      assert.equal(patches[0].type, Patch.Type.REPLACE_METADATA);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'a');
      assert.equal(patches[0].value, 'yyy');
    });

    it('adds, removes and replaces metadata', () => {

      // given
      const template = [
        'span',
        {
          metadata: {
            a: 'xxx',
            c: 'before',
          },
        },
      ];
      const nextTemplate = [
        'span',
        {
          metadata: {
            b: 'yyy',
            c: 'after',
          },
        },
      ];

      // when
      const [element, description] = createTrees(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 3);

      assert.equal(patches[0].type, Patch.Type.ADD_METADATA);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'b');
      assert.equal(patches[0].value, 'yyy');

      assert.equal(patches[1].type, Patch.Type.REMOVE_METADATA);
      assert(patches[1].target.isElement());
      assert.equal(patches[1].key, 'a');

      assert.equal(patches[2].type, Patch.Type.REPLACE_METADATA);
      assert(patches[2].target.isElement());
      assert.equal(patches[2].key, 'c');
      assert.equal(patches[2].value, 'after');
    });

    describe('reconcile children', () => {

      const assertInsertChildNode = (patch, id, at) => {
        assert.equal(patch.type, Patch.Type.INSERT_CHILD_NODE);
        if (typeof id === 'function') {
          assert.equal(patch.node.constructor, id);
        } else if (typeof id === 'string') {
          assert.equal(patch.node.name, id);
        }
        assert.equal(patch.at, at);
      };

      const assertMoveChildNode = (patch, id, from, to) => {
        assert.equal(patch.type, Patch.Type.MOVE_CHILD_NODE);
        if (typeof id === 'function') {
          assert.equal(patch.node.constructor, id);
        } else if (typeof id === 'string') {
          assert.equal(patch.node.name, id);
        }
        assert.equal(patch.from, from);
        assert.equal(patch.to, to);
      };

      const assertRemoveChildNode = (patch, id, at) => {
        assert.equal(patch.type, Patch.Type.REMOVE_CHILD_NODE);
        if (typeof id === 'function') {
          assert.equal(patch.node.constructor, id);
        } else if (typeof id === 'string') {
          assert.equal(patch.node.name, id);
        }
        assert.equal(patch.at, at);
      };

      const assertReplaceChildNode = (patch, removed, inserted) => {
        assert.equal(patch.type, Patch.Type.REPLACE_CHILD_NODE);
        if (typeof removed === 'function') {
          assert.equal(patch.child.constructor, removed);
        } else if (typeof removed === 'string') {
          assert.equal(patch.child.name, removed);
        }
        if (typeof inserted === 'function') {
          assert.equal(patch.node.constructor, inserted);
        } else if (typeof inserted === 'string') {
          assert.equal(patch.node.name, inserted);
        }
      };

      const assertUpdateComponent = (patch, id, props) => {
        assert.equal(patch.type, Patch.Type.UPDATE_COMPONENT);
        assert.equal(patch.props, props);
      };

      const createChildren = ({keys}) => ({
        from: (...items) => items.map(
            name => [name, {key: (keys === true ? name : undefined)}])
      });

      describe('=> with keys', () => {

        const getChildren = (...items) => {
          return createChildren({keys: true}).from(...items);
        };

        it('inserts element at the beginning', () => {

          // given
          const template = ['section', ...getChildren('div', 'span')];
          const nextTemplate = ['section', ...getChildren('X', 'div', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertInsertChildNode(patches[0], 'X', 0);
        });

        it('inserts element at the end', () => {

          // given
          const template = ['section', ...getChildren('div', 'span')];
          const nextTemplate = ['section', ...getChildren('div', 'span', 'X')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertInsertChildNode(patches[0], 'X', 2);
        });

        it('moves an element up', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'X', 'p', 'div', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 3, 1);
        });

        it('moves an element down', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'X', 'p', 'div', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 1, 3);
        });

        it('moves an element to the beginning', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'span', 'X')];
          const nextTemplate =
              ['section', ...getChildren('X', 'section', 'p', 'div', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 4, 0);
        });

        it('moves an element to the end', () => {

          // given
          const template =
              ['section', ...getChildren('X', 'section', 'p', 'div', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'p', 'div', 'span', 'X')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertMoveChildNode(patches[0], 'X', 0, 4);
        });

        it('swaps two elements', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'X', 'div', 'Y', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'Y', 'div', 'X', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertMoveChildNode(patches[0], 'Y', 3, 1);
          assertMoveChildNode(patches[1], 'div', 3, 2);
        });

        it('swaps three elements', () => {

          // given
          const template = [
            'section',
            ...getChildren('section', 'Z', 'p', 'X', 'div', 'Y', 'span')
          ];
          const nextTemplate = [
            'section',
            ...getChildren('section', 'X', 'p', 'Y', 'div', 'Z', 'span')
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 3);
          assertMoveChildNode(patches[0], 'Z', 1, 5);
          assertMoveChildNode(patches[1], 'div', 3, 4);
          assertMoveChildNode(patches[2], 'p', 1, 2);
        });

        it('removes an element', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'p', 'div', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertRemoveChildNode(patches[0], 'X', 3);
        });

        it('inserts and removes elements', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'Y', 'p', 'div', 'span')];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertRemoveChildNode(patches[0], 'X', 3);
          assertInsertChildNode(patches[1], 'Y', 1);
        });

        it('inserts, moves and removes elements', () => {

          // given
          const template = [
            'section', ...getChildren('X', 'section', 'p', 'div', 'Y', 'span')
          ];
          const nextTemplate = [
            'section', ...getChildren('section', 'p', 'div', 'Z', 'span', 'X')
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 4);
          assertRemoveChildNode(patches[0], 'Y', 4);
          assertInsertChildNode(patches[1], 'Z', 3);
          assertMoveChildNode(patches[2], 'X', 0, 5);
          assertMoveChildNode(patches[3], 'Z', 2, 3);
        });
      });

      describe('=> without keys', () => {

        const getChildren = (...items) =>
            createChildren({keys: false}).from(...items);

        it('inserts an element', () => {

          // given
          const template = [
            'section',
            ...getChildren('p', 'div'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('p', 'div', 'span'),
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertInsertChildNode(patches[0], 'span', 2);
        });

        it('removes an element', () => {

          // given
          const template = [
            'section',
            ...getChildren('p', 'div', 'span'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('p', 'div'),
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertRemoveChildNode(patches[0], 'span', 2);
        });

        it('replaces reordered elements', () => {

          // given
          const template = [
            'section',
            ...getChildren('p', 'div', 'span'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('div', 'span', 'p'),
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 3);

          assertReplaceChildNode(patches[0], 'p', 'div');
          assertReplaceChildNode(patches[1], 'div', 'span');
          assertReplaceChildNode(patches[2], 'span', 'p');
        });

        it('replaces and inserts elements', () => {

          // given
          const template = [
            'section',
            ...getChildren('p', 'span'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('p', 'div', 'span'),
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertInsertChildNode(patches[0], 'span', 2);
          assertReplaceChildNode(patches[1], 'span', 'div');
        });

        it('replaces and removes elements', () => {

          // given
          const template = [
            'section',
            ...getChildren('p', 'div', 'span'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('div', 'div'),
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertRemoveChildNode(patches[0], 'span', 2);
          assertReplaceChildNode(patches[1], 'p', 'div');
        });

        describe('replaces an element', () => {

          it('with an element', () => {

            // given
            const template = [
              'section',
              ...getChildren('p', 'div', 'span'),
            ];
            const nextTemplate = [
              'section',
              ...getChildren('p', 'div', 'a'),
            ];

            // when
            const [element, description] = createTrees(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 1);
            assertReplaceChildNode(patches[0], 'span', 'a');
          });

          it('with a component', () => {

            // given
            const template = [
              'section',
              ...getChildren('div', 'span'),
            ];
            const nextTemplate = ['section', ...getChildren('div', Component)];

            // when
            const [element, description] = createTrees(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 1);
            assertReplaceChildNode(patches[0], 'span', ComponentClass);
          });
        });

        describe('replaces a component', () => {

          it('with an element', () => {

            // given
            const template = [
              'section',
              ...getChildren('p', 'div', 'span', Component),
            ];
            const nextTemplate = [
              'section',
              ...getChildren('p', 'div', 'span', 'a'),
            ];

            // when
            const [element, description] = createTrees(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 1);
            assertReplaceChildNode(patches[0], ComponentClass, 'a');
          });

          it('with a component', () => {

            // given
            const template = [
              'section',
              ...getChildren('div', Component, 'span'),
            ];
            const nextTemplate = [
              'section',
              ...getChildren('div', Subcomponent, 'span'),
            ];

            // when
            const [element, description] = createTrees(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 1);
            assertReplaceChildNode(
                patches[0], ComponentClass, SubcomponentClass);
          });
        });
      });

      describe('update child nodes', () => {

        it('skips a component', () => {

          // given
          const props = {
            value: 'universal',
          };
          const template = [
            'section',
            [
              Component,
              props,
            ],
          ];

          // when
          const [element, description] = createTrees(template, template);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 0);
        });

        it('updates a component', () => {

          // given
          const props = {
            value: 'old',
          };
          const template = [
            'section',
            [
              Component,
              props,
            ],
          ];

          const nextProps = {
            value: 'new',
          };
          const nextTemplate = [
            'section',
            [
              Component,
              nextProps,
            ],
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assertUpdateComponent(patches[0], SubcomponentClass, nextProps);
        });

        it('adds an attribute', () => {

          // given
          const template = [
            'section',
          ];

          const nextTemplate = [
            'section',
            {
              name: 'value',
            },
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assert.equal(patches[0].type, Patch.Type.ADD_ATTRIBUTE);
          assert.equal(patches[0].name, 'name');
          assert.equal(patches[0].value, 'value');
        });

        it('adds a listener', () => {

          // given
          const onClick = () => {};

          const template = [
            'section',
          ];

          const nextTemplate = [
            'section',
            {
              onClick,
            },
          ];

          // when
          const [element, description] = createTrees(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 1);
          assert.equal(patches[0].type, Patch.Type.ADD_LISTENER);
          assert.equal(patches[0].name, 'onClick');
          assert.equal(patches[0].listener, onClick);
        });
      });
    });

    describe('set text content', () => {

      it('sets text on an empty element', () => {

        const template = [
          'section',
        ];

        const nextTemplate = [
          'section',
          'some text',
        ];

        // when
        const [element, description] = createTrees(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 1);
        assert.equal(patches[0].type, Patch.Type.SET_TEXT_CONTENT);
        assert.equal(patches[0].text, 'some text');
      });

      it('replaces existing text content', () => {

        const template = [
          'section',
          'some text',
        ];

        const nextTemplate = [
          'section',
          'another text',
        ];

        // when
        const [element, description] = createTrees(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 1);
        assert.equal(patches[0].type, Patch.Type.SET_TEXT_CONTENT);
        assert.equal(patches[0].text, 'another text');
      });

      it('replaces existing child nodes', () => {

        const template = [
          'section',
          [
            'div',
          ],
        ];

        const nextTemplate = [
          'section',
          'some text',
        ];

        // when
        const [element, description] = createTrees(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.REMOVE_CHILD_NODE);
        assert.equal(patches[0].parent, element);
        assert.equal(patches[0].at, 0);
        assert.equal(patches[0].node, element.children[0]);

        assert.equal(patches[1].type, Patch.Type.SET_TEXT_CONTENT);
        assert.equal(patches[1].text, 'some text');
      });
    });

    describe('remove text content', () => {

      it('removes existing text content', () => {

        const template = [
          'section',
          'some text',
        ];

        const nextTemplate = [
          'section',
        ];

        // when
        const [element, description] = createTrees(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 1);
        assert.equal(patches[0].type, Patch.Type.REMOVE_TEXT_CONTENT);
      });

      it('removes text content before appending child nodes', () => {

        const template = [
          'section',
          'some text',
        ];

        const nextTemplate = [
          'section',
          [
            'div',
          ],
        ];

        // when
        const [element, description] = createTrees(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.REMOVE_TEXT_CONTENT);

        assert.equal(patches[1].type, Patch.Type.INSERT_CHILD_NODE);
        assert.equal(patches[1].parent, element);
        assert.equal(patches[1].at, 0);
        assert.equal(patches[1].node.name, description.children[0][0]);
      });
    });
  });

  describe('=> on a Component', () => {

    const createComponents = (props, children, nextProps, nextChildren) => {
      return [
        utils.createFromTemplate([Component, props, ...children]),
        utils.createDescription([Component, nextProps, ...nextChildren]),
      ];
    };

    const assertComponentUpdate = (patch, component, props) => {
      assert.equal(patch.type, Patch.Type.UPDATE_COMPONENT);
      assert.equal(patch.target, component);
      assert.equal(patch.target.props, props);
    };

    it('adds an element', () => {

      // given
      const props = {};
      const children = [];

      const nextProps = {
        child: true,
      };
      const nextChildren = [
        [
          'div',
        ],
      ];

      // when
      const [component, description] = createComponents(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

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
      const props = {
        child: true,
      };
      const children = [
        [
          'div',
        ],
      ];

      const nextProps = {};
      const nextChildren = [];

      // when
      const [component, description] = createComponents(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

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

      const nextProps = {child: true};
      const nextChildren = [[Subcomponent]];

      // when
      const [component, description] = createComponents(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

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
      const props = {child: true};
      const children = [[Subcomponent]];

      const nextProps = {};
      const nextChildren = [];

      // when
      const [component, description] = createComponents(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

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
        const props = {
          child: 'div',
        };
        const children = [
          [
            'div',
          ],
        ];

        const nextProps = {
          child: 'span',
        };
        const nextChildren = [
          [
            'span',
          ],
        ];

        // when
        const [component, description] = createComponents(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[0].type, Patch.Type.UPDATE_COMPONENT);

        assert.equal(patches[1].type, Patch.Type.REPLACE_CHILD);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].child.isElement());
        assert.equal(patches[1].child.name, 'div');
        assert(patches[1].node.isElement());
        assert.equal(patches[1].node.name, 'span');
      });

      it('with a component', () => {

        // given
        const props = {
          child: 'div',
        };
        const children = [
          [
            'div',
          ],
        ];

        const nextProps = {
          child: 'component',
        };
        const nextChildren = [
          [
            Subcomponent,
          ],
        ];

        // when
        const [component, description] = createComponents(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[0].type, Patch.Type.UPDATE_COMPONENT);

        assert.equal(patches[1].type, Patch.Type.REPLACE_CHILD);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].child.isElement());
        assert.equal(patches[1].child.name, 'div');
        assert(patches[1].node.isComponent());
        assert.equal(patches[1].node.constructor, SubcomponentClass);
      });

    });

    describe('replaces a child component', () => {

      it('with an element', () => {

        // given
        const props = {child: 'subcomponent'};
        const children = [
          [
            Subcomponent,
          ],
        ];

        const nextProps = {
          child: 'div',
        };
        const nextChildren = [
          [
            'div',
          ],
        ];

        // when
        const [component, description] = createComponents(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[0].type, Patch.Type.UPDATE_COMPONENT);

        assert.equal(patches[1].type, Patch.Type.REPLACE_CHILD);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].child.isComponent());
        assert.equal(patches[1].child.constructor, SubcomponentClass);
        assert(patches[1].node.isElement());
        assert.equal(patches[1].node.name, 'div');
      });

      it('with a component', () => {

        // given
        const props = {
          child: 'subcomponent',
        };
        const children = [
          [
            Subcomponent,
          ],
        ];

        const nextProps = {
          child: 'other-component',
        };
        const nextChildren = [
          [
            OtherComponent,
          ],
        ];

        // when
        const [component, description] = createComponents(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assertComponentUpdate(patches[0], component, nextProps);

        assert.equal(patches[0].type, Patch.Type.UPDATE_COMPONENT);

        assert.equal(patches[1].type, Patch.Type.REPLACE_CHILD);
        assert(patches[1].parent.isComponent());
        assert.equal(patches[1].parent, component);
        assert(patches[1].child.isComponent());
        assert.equal(patches[1].child.constructor, SubcomponentClass);
        assert(patches[1].node.isComponent());
        assert.equal(patches[1].node.constructor, OtherComponentClass);
      });
    });
  });
});
