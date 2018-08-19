describe('Virtual DOM => create element', () => {

  const {VirtualElement, VirtualDOM, Template} = opr.Toolkit;

  const createElement = details =>
      VirtualDOM.createFromDescription(Template.normalize(details), null, null);

  it('creates an empty element', () => {

    // given
    const description = {
      element: 'span',
    };

    // when
    const element = createElement(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.name, 'span');
  });

  it('creates an empty element with attributes and listeners', () => {

    // given
    const onChange = () => {};
    const description = {
      element: 'input',
      props: {
        type: 'text',
        tabIndex: 1,
        autoFocus: true,
        onChange,
      },
    };

    // when
    const element = createElement(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.name, 'input');
    assert.deepEqual(element.attrs, {
      type: 'text',
      tabIndex: '1',
      autoFocus: 'true',
    });
    assert.deepEqual(element.listeners, {
      onChange,
    });
    assert.equal(element.text, null);
    assert.deepEqual(element.children, []);
  });

  it('creates a text element', () => {

    // given
    const description = {
      element: 'div',
      text: 'Text',
    };

    // when
    const element = createElement(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.name, 'div');
    assert.deepEqual(element.attrs, {});
    assert.deepEqual(element.listeners, {});
    assert.equal(element.text, 'Text');
    assert.deepEqual(element.children, []);
  });

  it('creates a text element with attributes and listeners', () => {

    // given
    const onClickListener = () => {};
    const description = {
      element: 'a',
      props: {
        href: 'http://www.example.com/',
        target: '_blank',
        title: 'Example',
        onClick: onClickListener,
      },
      text: 'Example',
    };

    // when
    const element = createElement(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.name, 'a');
    assert.deepEqual(element.attrs, {
      'href': 'http://www.example.com/',
      'target': '_blank',
      'title': 'Example',
    });
    assert.deepEqual(element.listeners, {
      onClick: onClickListener,
    });
    assert.equal(element.text, 'Example');
    assert.deepEqual(element.children, []);
  });

  it('ignores null and undefined attribute values', () => {

    // given
    const description = {
      element: 'a',
      props: {
        href: null,
        target: undefined,
        title: 'Test',
      },
      text: 'Text',
    };

    // when
    const element = createElement(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.name, 'a');
    assert.deepEqual(element.attrs, {
      'title': 'Test',
    });
    assert.equal(element.text, 'Text');
    assert.deepEqual(element.children, []);
  });

  it('ignores listeners not being functions', () => {

    // given
    const onClick = () => {};
    const description = {
      element: 'a',
      props: {
        onClick: onClick,
        onChange: 1,
        onSubmit: false,
        onCopy: 'copy',
        onPaste: null,
        onCut: undefined,
      },
      text: 'Link',
    };

    // when
    const element = createElement(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.name, 'a');
    assert.deepEqual(element.attrs, {});
    assert.deepEqual(element.listeners, {
      onClick,
    });
    assert.equal(element.text, 'Link');
    assert.deepEqual(element.children, []);
  });

  describe('supports adding attributes', () => {

    it('adds string attributes', () => {

      // given
      const description = {
        element: 'div',
        props: {
          title: 'Title',
          value: 'Value',
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {
        title: 'Title',
        value: 'Value',
      });
    });

    it('adds number attributes', () => {

      // given
      const description = {
        element: 'span',
        props: {
          height: 0,
          width: 200,
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.name, 'span');
      assert.deepEqual(element.attrs, {
        height: '0',
        width: '200',
      });
    });

    it('adds boolean attributes', () => {

      // given
      const description = {
        element: 'input',
        props: {
          checked: true,
          selected: true,
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.name, 'input');
      assert.deepEqual(element.attrs, {
        checked: 'true',
        selected: 'true',
      });
    });

    it('ignores null, undefined and function values', () => {

      // given
      const description = {
        element: 'section',
        props: {
          title: undefined,
          type: null,
          value: () => {},
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.name, 'section');
      assert.deepEqual(element.attrs, {});
    });

    describe('add "class" attribute', () => {

      const createElementWithClasses =
          (element, classNames) => {
            const description = {element, props: {class: classNames}};
            return createElement(description);
          }

      it('supports strings', () => {

        // given
        const classNames = 'foo bar';

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.className, 'foo bar');
      });

      it('supports arrays', () => {

        // given
        const classNames = ['foo', null, 'bar', undefined];

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.className, 'foo bar');
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
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.className, 'foo bar');
      });

      it('supports nesting', () => {

        // given
        const classNames = [
          null,
          'foo',
          [
            {
              bar: true,
            },
          ],
        ];

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.className, 'foo bar');
      });

      it('keeps redundant classes', () => {

        // given
        const classNames = ['foo', 'bar', 'bar'];

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.className, 'foo bar bar');
      });
    });

    describe('add "style" attribute', () => {

      const createElementWithStyle =
          (element, style) => {
            const description = {
              element,
              props: {
                style,
              },
            };
            return createElement(description);
          }

      it('supports plain values', () => {

        // given
        const style = {
          display: 'inherit',
          height: 60,
          width: 80,
        };

        // when
        const element = createElementWithStyle('div', style);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.style, style);
      });

      it('supports array values', () => {

        // given
        const style = {
          height: [10, 'em'],
          width: [100, 'px'],
        };

        // when
        const element = createElementWithStyle('div', style);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'div');
        assert.deepEqual(element.style, {
          height: '10em',
          width: '100px',
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
        const element = createElementWithStyle('section', style);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.name, 'section');
        assert.deepEqual(element.style, {});
      });

      describe('add "filter"', () => {

        const createElementWithFilter =
            (element, filter) => {
              const description = {
                element,
                props: {
                  style: {
                    filter,
                  },
                }
              };
              return createElement(description);
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
          const element = createElementWithFilter('section', filter);

          // then
          assert(element instanceof VirtualElement);
          assert.equal(element.name, 'section');
          assert.equal(element.style.filter, 'blur(5px) saturate(2)');
        });
      });

      describe('add "transform"', () => {

        const createElementWithTransform =
            (element, transform) => {
              const description = {
                element,
                props: {
                  style: {
                    transform,
                  },
                }
              };
              return createElement(description);
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
          const element = createElementWithTransform('section', filter);

          // then
          assert(element instanceof VirtualElement);
          assert.equal(element.name, 'section');
          assert.equal(
              element.style.transform,
              'translate3d(0, 0, 0) scale(2) rotate(90deg)');
        });
      });
    });
  });
});
