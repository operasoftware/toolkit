describe('Diff => calculate patches', () => {

  const {
    Diff,
    Patch,
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
    onUpdated() {
    }
  }

  class Subcomponent extends opr.Toolkit.Component {
    render() {
      return null;
    }
  }

  class OtherComponent extends opr.Toolkit.Component {
    render() {
      return null;
    }
  }

  const calculatePatches = (node, description) => {
    const diff = new Diff(node.rootNode);
    diff.patches.length = 0;
    diff.childPatches(node, description);
    return diff.patches;
  };

  const assertUpdatesNode = (patch, node) => {
    assert.equal(patch.type, opr.Toolkit.Patch.Type.UPDATE_NODE);
    assert.equal(patch.node, node);
  };

  describe('create key', () => {

    it('creates valid string key for indices', () => {
      assert.equal(Diff.createKey(10), '00000010');
      assert.equal(Diff.createKey(999), '00000999');
      assert.equal(Diff.createKey(4444), '00004444');
    });
  });

  describe('=> on an Element', () => {

    const renderNodeAndDescription = (currentTemplate, nextTemplate) => {
      const root = createRootInstance(Root);
      const node = VirtualDOM.createFromDescription(
          Template.describe(currentTemplate), root);
      root.setContent(node);
      const description = Template.describe(nextTemplate);
      return [
        node,
        description,
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'value');
      assert.equal(patches[0].value, 'next');

      assertUpdatesNode(patches[1], element);
    });

    it('replaces an attribute', () => {

      // given
      const template = [
        'button',
        {
          name: 'prev',
        },
      ];
      const nextTemplate = [
        'button',
        {
          name: 'next',
        },
      ];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'name');
      assert.equal(patches[0].value, 'next');

      assertUpdatesNode(patches[1], element);
    });

    it('removes an attribute', () => {

      // given
      const template = [
        'button',
        {
          name: 'prev',
        },
      ];
      const nextTemplate = [
        'button',
        {},
      ];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.REMOVE_ATTRIBUTE);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'name');

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_DATA_ATTRIBUTE);
      assert.equal(patches[0].name, 'reactorId');
      assert.equal(patches[0].value, '666');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_DATA_ATTRIBUTE);
      assert.equal(patches[0].name, 'customAttrName');
      assert.equal(patches[0].value, 'foobar');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.REMOVE_DATA_ATTRIBUTE);
      assert.equal(patches[0].name, 'id');
      assert(patches[0].target.isElement());
    });

    it('adds a style property', () => {

      // given
      const template = ['input', {}];
      const nextTemplate = ['input', {
        style: {
          width: [100, 'px'],
        },
      }];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_STYLE_PROPERTY);
      assert.equal(patches[0].property, 'width');
      assert.equal(patches[0].value, '100px');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_STYLE_PROPERTY);
      assert.equal(patches[0].property, 'height');
      assert.equal(patches[0].value, '50%');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.REMOVE_STYLE_PROPERTY);
      assert.equal(patches[0].property, 'animationDelay');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_CLASS_NAME);
      assert.equal(patches[0].className, 'one two');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_CLASS_NAME);
      assert.equal(patches[0].className, '');
      assert(patches[0].target.isElement());

      assertUpdatesNode(patches[1], element);
    });

    it('adds a listener', () => {

      // given
      const listener = () => {};

      const template = ['span', {}];
      const nextTemplate = ['span', {onClick: listener}];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.ADD_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'onClick');
      assert.equal(patches[0].listener, listener);

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.REPLACE_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'onClick');
      assert.equal(patches[0].removed, listener);
      assert.equal(patches[0].added, anotherListener);

      assertUpdatesNode(patches[1], element);
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
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.REMOVE_LISTENER);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].name, 'onClick');
      assert.equal(patches[0].listener, listener);

      assertUpdatesNode(patches[1], element);
    });

    it('sets property', () => {

      // given
      const template = [
        'video',
      ];
      const nextTemplate = [
        'video',
        {
          properties: {
            muted: true,
          },
        },
      ];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_PROPERTY);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'muted');
      assert.equal(patches[0].value, true);

      assertUpdatesNode(patches[1], element);
    });

    it('deletes property', () => {

      // given
      const template = [
        'video',
        {
          properties: {
            muted: true,
          },
        },
      ];
      const nextTemplate = [
        'video',
      ];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.DELETE_PROPERTY);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'muted');

      assertUpdatesNode(patches[1], element);
    });

    it('replaces property', () => {

      // given
      const template = [
        'span',
        {
          properties: {
            muted: true,
          },
        },
      ];
      const nextTemplate = [
        'span',
        {
          properties: {
            muted: false,
          },
        },
      ];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 2);
      assert.equal(patches[0].type, Patch.Type.SET_PROPERTY);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'muted');
      assert.equal(patches[0].value, false);

      assertUpdatesNode(patches[1], element);
    });

    it('adds, removes and replaces properties', () => {

      // given
      const template = [
        'span',
        {
          properties: {
            a: 'xxx',
            c: 'before',
          },
        },
      ];
      const nextTemplate = [
        'span',
        {
          properties: {
            b: 'yyy',
            c: 'after',
          },
        },
      ];

      // when
      const [element, description] =
          renderNodeAndDescription(template, nextTemplate);
      const patches = calculatePatches(element, description);

      // then
      assert.equal(patches.length, 4);

      assert.equal(patches[0].type, Patch.Type.SET_PROPERTY);
      assert(patches[0].target.isElement());
      assert.equal(patches[0].key, 'b');
      assert.equal(patches[0].value, 'yyy');

      assert.equal(patches[1].type, Patch.Type.DELETE_PROPERTY);
      assert(patches[1].target.isElement());
      assert.equal(patches[1].key, 'a');

      assert.equal(patches[2].type, Patch.Type.SET_PROPERTY);
      assert(patches[2].target.isElement());
      assert.equal(patches[2].key, 'c');
      assert.equal(patches[2].value, 'after');

      assertUpdatesNode(patches[3], element);
    });

    describe('reconcile children', () => {

      const assertInsertChildNode = (patch, id, at) => {
        assert.equal(patch.type, Patch.Type.INSERT_CHILD);
        if (typeof id === 'function') {
          assert.equal(patch.node.constructor, id);
        } else if (typeof id === 'string') {
          assert.equal(patch.node.description.name, id);
        }
        assert.equal(patch.at, at);
      };

      const assertMoveChildNode = (patch, id, from, to) => {
        assert.equal(patch.type, Patch.Type.MOVE_CHILD);
        if (typeof id === 'function') {
          assert.equal(patch.child.constructor, id);
        } else if (typeof id === 'string') {
          assert.equal(patch.child.description.name, id);
        }
        assert.equal(patch.from, from);
        assert.equal(patch.to, to);
      };

      const assertRemoveChildNode = (patch, id, at) => {
        assert.equal(patch.type, Patch.Type.REMOVE_CHILD);
        if (typeof id === 'function') {
          assert.equal(patch.node.constructor, id);
        } else if (typeof id === 'string') {
          assert.equal(patch.child.description.name, id);
        }
        assert.equal(patch.at, at);
      };

      const assertReplaceChildNode = (patch, removed, inserted) => {
        assert.equal(patch.type, Patch.Type.REPLACE_CHILD);
        if (typeof removed === 'function') {
          assert.equal(patch.child.constructor, removed);
        } else if (typeof removed === 'string') {
          assert.equal(patch.child.description.name, removed);
        }
        if (typeof inserted === 'function') {
          assert.equal(patch.node.constructor, inserted);
        } else if (typeof inserted === 'string') {
          assert.equal(patch.node.description.name, inserted);
        }
      };

      // const assertUpdateComponent = (patch, id, props) => {
      //   assert.equal(patch.type, Patch.Type.UPDATE_COMPONENT);
      //   assert.deepEqual(patch.props, props);
      // };

      const createChildren = ({keys}) => ({
        from: (...items) => items.map(name => [name, {
                                        key: (keys === true ? name : undefined),
                                      }]),
      });

      describe('=> with keys', () => {

        const getChildren = (...items) => createChildren({
                                            keys: true,
                                          }).from(...items);

        it('throws an error for non-unique keys', () => {

          // given
          const template = ['section', ...getChildren('p', 'div', 'span', 'p')];
          const nextTemplate = ['section', ...getChildren('div', 'span', 'p')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          assert.throws(() => calculatePatches(element, description), Error);
        });

        it('inserts element at the beginning', () => {

          // given
          const template = ['section', ...getChildren('div', 'span')];
          const nextTemplate = ['section', ...getChildren('X', 'div', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertInsertChildNode(patches[0], 'X', 0);

          assertUpdatesNode(patches[1], element);
        });

        it('inserts element at the end', () => {

          // given
          const template = ['section', ...getChildren('div', 'span')];
          const nextTemplate = ['section', ...getChildren('div', 'span', 'X')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertInsertChildNode(patches[0], 'X', 2);

          assertUpdatesNode(patches[1], element);
        });

        it('moves an element up', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'X', 'p', 'div', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertMoveChildNode(patches[0], 'X', 3, 1);

          assertUpdatesNode(patches[1], element);
        });

        it('moves an element down', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'X', 'p', 'div', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertMoveChildNode(patches[0], 'X', 1, 3);

          assertUpdatesNode(patches[1], element);
        });

        it('moves an element to the beginning', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'span', 'X')];
          const nextTemplate =
              ['section', ...getChildren('X', 'section', 'p', 'div', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertMoveChildNode(patches[0], 'X', 4, 0);

          assertUpdatesNode(patches[1], element);
        });

        it('moves an element to the end', () => {

          // given
          const template =
              ['section', ...getChildren('X', 'section', 'p', 'div', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'p', 'div', 'span', 'X')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertMoveChildNode(patches[0], 'X', 0, 4);

          assertUpdatesNode(patches[1], element);
        });

        it('swaps two elements', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'X', 'div', 'Y', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'Y', 'div', 'X', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 3);
          assertMoveChildNode(patches[0], 'X', 1, 3);
          assertMoveChildNode(patches[1], 'div', 1, 2);

          assertUpdatesNode(patches[2], element);
        });

        it('swaps three elements', () => {

          // given
          const template = [
            'section',
            ...getChildren('section', 'Z', 'p', 'X', 'div', 'Y', 'span'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('section', 'X', 'p', 'Y', 'div', 'Z', 'span'),
          ];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 4);
          assertMoveChildNode(patches[0], 'Z', 1, 5);
          assertMoveChildNode(patches[1], 'div', 3, 4);
          assertMoveChildNode(patches[2], 'p', 1, 2);

          assertUpdatesNode(patches[3], element);
        });

        it('removes an element', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'p', 'div', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertRemoveChildNode(patches[0], 'X', 3);

          assertUpdatesNode(patches[1], element);
        });

        it('inserts and removes elements', () => {

          // given
          const template =
              ['section', ...getChildren('section', 'p', 'div', 'X', 'span')];
          const nextTemplate =
              ['section', ...getChildren('section', 'Y', 'p', 'div', 'span')];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 3);
          assertRemoveChildNode(patches[0], 'X', 3);
          assertInsertChildNode(patches[1], 'Y', 1);

          assertUpdatesNode(patches[2], element);
        });

        it('inserts, moves and removes elements', () => {

          // given
          const template = [
            'section',
            ...getChildren('X', 'section', 'p', 'div', 'Y', 'span'),
          ];
          const nextTemplate = [
            'section',
            ...getChildren('section', 'p', 'div', 'Z', 'span', 'X'),
          ];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 5);
          assertRemoveChildNode(patches[0], 'Y', 4);
          assertInsertChildNode(patches[1], 'Z', 3);
          assertMoveChildNode(patches[2], 'X', 0, 5);
          assertMoveChildNode(patches[3], 'Z', 2, 3);

          assertUpdatesNode(patches[4], element);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertInsertChildNode(patches[0], 'span', 2);

          assertUpdatesNode(patches[1], element);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertRemoveChildNode(patches[0], 'span', 2);

          assertUpdatesNode(patches[1], element);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 4);

          assertReplaceChildNode(patches[0], 'p', 'div');
          assertReplaceChildNode(patches[1], 'div', 'span');
          assertReplaceChildNode(patches[2], 'span', 'p');

          assertUpdatesNode(patches[3], element);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 3);
          assertInsertChildNode(patches[0], 'span', 2);
          assertReplaceChildNode(patches[1], 'span', 'div');

          assertUpdatesNode(patches[2], element);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 3);
          assertRemoveChildNode(patches[0], 'span', 2);
          assertReplaceChildNode(patches[1], 'p', 'div');

          assertUpdatesNode(patches[2], element);
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
            const [element, description] =
                renderNodeAndDescription(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 2);
            assertReplaceChildNode(patches[0], 'span', 'a');
            assertUpdatesNode(patches[1], element);
          });

          it('with a component', () => {

            // given
            const template = [
              'section',
              ...getChildren('div', 'span'),
            ];
            const nextTemplate = ['section', ...getChildren('div', Component)];

            // when
            const [element, description] =
                renderNodeAndDescription(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 2);
            assertReplaceChildNode(patches[0], 'span', Component);
            assertUpdatesNode(patches[1], element);
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
            const [element, description] =
                renderNodeAndDescription(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 2);
            assertReplaceChildNode(patches[0], Component, 'a');
            assertUpdatesNode(patches[1], element);
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
            const [element, description] =
                renderNodeAndDescription(template, nextTemplate);
            const patches = calculatePatches(element, description);

            // then
            assert.equal(patches.length, 2);
            assertReplaceChildNode(
                patches[0], Component, Subcomponent);
            assertUpdatesNode(patches[1], element);
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
          const [element, description] =
              renderNodeAndDescription(template, template);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assertUpdatesNode(patches[0], element.children[0]);
          assertUpdatesNode(patches[1], element);
        });

        it('adds an attribute', () => {

          // given
          const template = [
            'textarea',
          ];

          const nextTemplate = [
            'textarea',
            {
              name: 'value',
            },
          ];

          // when
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assert.equal(patches[0].type, Patch.Type.SET_ATTRIBUTE);
          assert.equal(patches[0].name, 'name');
          assert.equal(patches[0].value, 'value');
          assertUpdatesNode(patches[1], element);
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
          const [element, description] =
              renderNodeAndDescription(template, nextTemplate);
          const patches = calculatePatches(element, description);

          // then
          assert.equal(patches.length, 2);
          assert.equal(patches[0].type, Patch.Type.ADD_LISTENER);
          assert.equal(patches[0].name, 'onClick');
          assert.equal(patches[0].listener, onClick);
          assertUpdatesNode(patches[1], element);
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
        const [element, description] =
            renderNodeAndDescription(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);
        assert.equal(patches[0].type, Patch.Type.INSERT_CHILD);
        assert.equal(patches[0].at, 0);
        assert.equal(patches[0].node.description.text, 'some text');
        assertUpdatesNode(patches[1], element);
      });

      it('replaces existing text node with another text node', () => {

        const template = [
          'section',
          'some text',
        ];

        const nextTemplate = [
          'section',
          'another text',
        ];

        // when
        const [element, description] =
            renderNodeAndDescription(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);
        assert.equal(patches[0].type, Patch.Type.REPLACE_CHILD);
        assert.equal(patches[0].child.description.text, 'some text');
        assert.equal(patches[0].node.description.text, 'another text');
        assertUpdatesNode(patches[1], element);
      });

      it('replaces existing child element with text node', () => {

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
        const [element, description] =
            renderNodeAndDescription(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.REPLACE_CHILD);
        assert.equal(patches[0].parent, element);
        assert.equal(patches[0].child, element.children[0]);
        assert.equal(patches[0].node.description, description.children[0]);

        assertUpdatesNode(patches[1], element);
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
        const [element, description] =
            renderNodeAndDescription(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);
        assert.equal(patches[0].type, Patch.Type.REMOVE_CHILD);
        assert.equal(patches[0].child, element.children[0]);
        assertUpdatesNode(patches[1], element);
      });

      it('replaces text content with child element', () => {

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
        const [element, description] =
            renderNodeAndDescription(template, nextTemplate);
        const patches = calculatePatches(element, description);

        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.REPLACE_CHILD);
        assert.equal(patches[0].parent, element);
        assert.equal(patches[0].child, element.children[0]);
        assertUpdatesNode(patches[1], element);
      });
    });
  });

  describe('=> on a Component', () => {

    const renderComponentAndDescription =
        (props, children, nextProps, nextChildren) => {
          const root = createRootInstance(Root);
          const component = VirtualDOM.createFromDescription(
              Template.describe([Component, props, ...children]), root);
          root.content = component;
          const description =
              Template.describe([Component, nextProps, ...nextChildren]);
          return [
            component,
            description,
          ];
        };

    const assertComponentUpdate = (patch, component, props) => {
      assert.equal(patch.type, Patch.Type.UPDATE_NODE);
      assert.equal(patch.node, component);
      assert.deepEqual(patch.description.props || {}, props);
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
      const [component, description] = renderComponentAndDescription(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

      // then
      assert.equal(patches.length, 2);

      assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
      assert.equal(patches[0].parent, component);
      assert(patches[0].node.isElement());
      assert.deepEqual(patches[0].node.description, description.children[0]);

      assertComponentUpdate(patches[1], component, nextProps);
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
      const [component, description] = renderComponentAndDescription(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

      // then
      assert.equal(patches.length, 2);

      assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
      assert.equal(patches[0].parent, component);
      assert(patches[0].node.isComment());

      assertComponentUpdate(patches[1], component, nextProps);
    });

    it('adds a component', () => {

      // given
      const props = {};
      const children = [];

      const nextProps = {
        child: true,
      };
      const nextChildren = [
        [
          Subcomponent,
        ],
      ];

      // when
      const [component, description] = renderComponentAndDescription(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

      // then
      assert.equal(patches.length, 2);

      assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
      assert.equal(patches[0].parent, component);
      assert.deepEqual(patches[0].node.description, description.children[0]);

      assertComponentUpdate(patches[1], component, nextProps);
    });

    it('removes a component', () => {

      // given
      const props = {
        child: true,
      };
      const children = [
        [
          Subcomponent,
        ],
      ];

      const nextProps = {};
      const nextChildren = [];

      // when
      const [component, description] = renderComponentAndDescription(
          props,
          children,
          nextProps,
          nextChildren,
      );

      const patches = calculatePatches(component, description);

      // then
      assert.equal(patches.length, 2);

      assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
      assert.equal(patches[0].parent, component);
      assert(patches[0].node.isComment());

      assertComponentUpdate(patches[1], component, nextProps);
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
        const [component, description] = renderComponentAndDescription(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
        assert(patches[0].parent.isComponent());
        assert.equal(patches[0].parent, component);
        assert(patches[0].node.isElement());
        assert.equal(patches[0].node.description.name, 'span');

        assertComponentUpdate(patches[1], component, nextProps);
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
        const [component, description] = renderComponentAndDescription(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
        assert(patches[0].parent.isComponent());
        assert.equal(patches[0].parent, component);
        assert(patches[0].node.isComponent());
        assert.equal(patches[0].node.constructor, Subcomponent);

        assertComponentUpdate(patches[1], component, nextProps);
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
        const [component, description] = renderComponentAndDescription(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
        assert(patches[0].parent.isComponent());
        assert.equal(patches[0].parent, component);
        assert(patches[0].node.isElement());
        assert.equal(patches[0].node.description.name, 'div');

        assertComponentUpdate(patches[1], component, nextProps);
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
        const [component, description] = renderComponentAndDescription(
            props,
            children,
            nextProps,
            nextChildren,
        );

        const patches = calculatePatches(component, description);

        // then
        assert.equal(patches.length, 2);

        assert.equal(patches[0].type, Patch.Type.SET_CONTENT);
        assert(patches[0].parent.isComponent());
        assert.equal(patches[0].parent, component);
        assert(patches[0].node.isComponent());
        assert.equal(patches[0].node.constructor, OtherComponent);

        assertComponentUpdate(patches[1], component, nextProps);
      });
    });
  });
});
