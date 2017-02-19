global.Reactor = createCore();
const VirtualNode = Reactor.VirtualNode;

describe('Virtual Node => create', () => {

  it('creates an empty element', () => {

    // given
    const description = {
      name: 'span'
    };

    // when
    const node = VirtualNode.create(description);

    // then
    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'span');
    assert.equal(node.attrs, undefined);
    assert.equal(node.listeners, undefined);
    assert.equal(node.text, undefined);
    assert.equal(node.children, undefined);
  });

  it('creates an empty element with attributes and listeners', () => {

    // given
    const onChangeListener = () => {};
    const description = {
      name: 'input',
      props: {
        type: 'text',
        tabIndex: 1,
        autoFocus: true,
        onChange: onChangeListener
      }
    };

    // when
    const node = VirtualNode.create(description);

    // then
    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'input');
    assert.deepEqual(node.attrs, {
      'type': 'text',
      'tab-index': '1',
      'auto-focus': 'true',
    });
    assert.deepEqual(node.listeners, {
      'change': onChangeListener,
    });
    assert.equal(node.text, undefined);
    assert.equal(node.children, undefined);
  });

  it('creates a text element', () => {

    // given
    const description = {
      name: 'div',
      text: 'Text'
    };

    // when
    const node = VirtualNode.create(description);

    // then
    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'div');
    assert.equal(node.attrs, undefined);
    assert.equal(node.listeners, undefined);
    assert.equal(node.text, 'Text');
    assert.equal(node.children, undefined);
  });

  it('creates a text element with attributes and listeners', () => {

    // given
    const onClickListener = () => {};
    const description = {
      name: 'a',
      props: {
        href: 'http://www.opera.com/',
        target: '_blank',
        title: 'Opera Software',
        onClick: onClickListener,
      },
      text: 'Opera Software'
    };

    // when
    const node = VirtualNode.create(description);

    // then
    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'a');
    assert.deepEqual(node.attrs, {
      'href': 'http://www.opera.com/',
      'target': '_blank',
      'title': 'Opera Software',
    });
    assert.deepEqual(node.listeners, {
      'click': onClickListener,
    });
    assert.equal(node.text, 'Opera Software');
    assert.equal(node.children, undefined);
  });

  it('ignores null and undefined attribute values', () => {

    // given
    const description = {
      name: 'a',
      props: {
        href: null,
        target: undefined,
        title: 'Test'
      },
      text: 'Text'
    };

    // when
    const node = VirtualNode.create(description);

    // then
    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'a');
    assert.deepEqual(node.attrs, {
      'title': 'Test'
    });
    assert.equal(node.text, 'Text');
    assert.equal(node.children, undefined);
  });

  it('ignores listeners not being functions', () => {

    // given
    const onClickListener = () => {};
    const description = {
      name: 'a',
      props: {
        onClick: onClickListener,
        onChange: 1,
        onSubmit: false,
        onCopy: 'copy',
        onPaste: null,
        onCut: undefined
      },
      text: 'Link'
    };

    // when
    const node = VirtualNode.create(description);

    // then
    assert(node instanceof VirtualNode);
    assert.equal(node.name, 'a');
    assert.deepEqual(node.attrs, undefined);
    assert.deepEqual(node.listeners, {
      'click': onClickListener
    });
    assert.equal(node.text, 'Link');
    assert.equal(node.children, undefined);
  });


  describe('supports adding attributes', () => {

    it('adds string attributes', () => {

      // given
      const description = {
        name: 'div',
        props: {
          title: 'Title',
          value: 'Value',
        }
      };

      // when
      const node = VirtualNode.create(description);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'div');
      assert.deepEqual(node.attrs, {
        title: 'Title',
        value: 'Value',
      });
    });

    it('adds number attributes', () => {

      // given
      const description = {
        name: 'span',
        props: {
          height: 0,
          width: 200,
        }
      };

      // when
      const node = VirtualNode.create(description);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'span');
      assert.deepEqual(node.attrs, {
        height: '0',
        width: '200',
      });
    });

    it('adds boolean attributes', () => {

      // given
      const description = {
        name: 'input',
        props: {
          checked: true,
          selected: true,
        }
      };

      // when
      const node = VirtualNode.create(description);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'input');
      assert.deepEqual(node.attrs, {
        checked: 'true',
        selected: 'true',
      });
    });

    it('ignores null, undefined and function values', () => {

      // given
      const description = {
        name: 'section',
        props: {
          title: undefined,
          type: null,
          value: () => {},
        }
      };

      // when
      const node = VirtualNode.create(description);

      // then
      assert(node instanceof VirtualNode);
      assert.equal(node.name, 'section');
      assert.equal(node.attrs, undefined);
    });

    describe('add "class" attribute', () => {

      const createNode = (name, classNames) => {
        const description = {
          name,
          props: {
            class: classNames
          }
        };
        return VirtualNode.create(description);
      }

      it('supports strings', () => {

        // given
        const classNames = 'foo bar';

        // when
        const node = createNode('div', classNames);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'div');
        assert.deepEqual(node.attrs, {
          class: 'foo bar'
        });
      });

      it('supports arrays', () => {

        // given
        const classNames = ['foo', null, 'bar', undefined];

        // when
        const node = createNode('div', classNames);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'div');
        assert.deepEqual(node.attrs, {
          class: 'foo bar'
        });
      });

      it('supports objects', () => {

        // given
        const classNames = {
          foo: true,
          absent: false,
          bar: true,
          missing: null,
        };

        // when
        const node = createNode('div', classNames);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'div');
        assert.deepEqual(node.attrs, {
          class: 'foo bar'
        });
      });

      it('supports nesting', () => {

        // given
        const classNames = [
          null,
          'foo', [{
            bar: true,
          }]
        ];

        // when
        const node = createNode('div', classNames);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'div');
        assert.deepEqual(node.attrs, {
          class: 'foo bar'
        });
      });
    });

    describe('add "style" attribute', () => {

      const createNode = (name, style) => {
        const description = {
          name,
          props: {
            style
          }
        };
        return VirtualNode.create(description);
      }

      it('supports plain values', () => {

        // given
        const style = {
          display: 'inherit',
          height: 60,
          width: 80,
        };

        // when
        const node = createNode('div', style);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'div');
        assert.deepEqual(node.attrs, {
          style
        });
      });

      it('supports array values', () => {

        // given
        const style = {
          height: [10, 'em'],
          width: [100, 'px'],
        };

        // when
        const node = createNode('div', style);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'div');
        assert.deepEqual(node.attrs, {
          style: {
            height: '10em',
            width: '100px',
          }
        });
      });

      it('ignores null, undefined and function values', () => {

        // given
        const style = {
          width: null,
          height: () => {},
          size: undefined,
        };

        // when
        const node = createNode('section', style);

        // then
        assert(node instanceof VirtualNode);
        assert.equal(node.name, 'section');
        assert.equal(node.attrs, undefined);
      });

      describe('add "filter"', () => {

        const createNode = (name, filter) => {
          const description = {
            name,
            props: {
              style: {
                filter
              }
            }
          };
          return VirtualNode.create(description);
        }

        it('supports known filters', () => {

          // given
          const filter = {
            blur: '5px',
            saturate: [2],
            brightness: null,
            unknown: 10,
          };

          // when
          const node = createNode('section', filter);

          // then
          assert(node instanceof VirtualNode);
          assert.equal(node.name, 'section');
          assert.deepEqual(node.attrs, {
            style: {
              filter: 'blur(5px) saturate(2)',
            }
          });
        });
      });

      describe('add "transform"', () => {

        const createNode = (name, transform) => {
          const description = {
            name,
            props: {
              style: {
                transform
              }
            }
          };
          return VirtualNode.create(description);
        }

        it('supports known transforms', () => {

          // given
          const filter = {
            translate3d: '0, 0, 0',
            scale: 2,
            brightness: null,
            rotate: [90, 'deg'],
          };

          // when
          const node = createNode('section', filter);

          // then
          assert(node instanceof VirtualNode);
          assert.equal(node.name, 'section');
          assert.deepEqual(node.attrs, {
            style: {
              transform: 'translate3d(0, 0, 0) scale(2) rotate(90deg)',
            }
          });
        });
      });
    });
  });
});