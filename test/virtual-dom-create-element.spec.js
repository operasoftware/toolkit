describe('Virtual DOM => create element', () => {

  const {
    VirtualElement,
    VirtualDOM,
    Template,
  } = opr.Toolkit;

  describe('=> create from template', () => {

    it('supports nested markup', () => {

      // given
      const template = [
        'div',
        [
          'span',
          [
            'a',
            {
              href: 'http://www.example.com',
            },
            'Text',
          ],
        ],
      ];

      // when
      const div = createFromTemplate(template);

      // then
      assert(div.isElement())
      assert.equal(div.description.name, 'div');
      assert.equal(div.description.children.length, 1);
      assert.equal(div.children.length, 1);

      const span = div.children[0];
      assert(span.isElement());
      assert.equal(span.description.name, 'span');
      assert.equal(span.description.children.length, 1);
      assert.equal(span.children.length, 1);

      const link = span.children[0];
      assert(link.isElement());
      assert.equal(link.description.name, 'a');
      assert.equal(link.description.text, 'Text');
    });
  });

  it('creates an empty element', () => {

    // given
    const description = Template.describe(['span']);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.description.name, 'span');

    assert.equal(element.description.children, undefined);
    assert.equal(element.children, undefined);

    assert.equal(element.text, undefined);
  });

  it('creates an empty with key', () => {

    // given
    const key = 'unique';
    const description = Template.describe(['span', {
      key,
    }]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.description.name, 'span');

    assert.equal(element.description.key, key);
    assert.equal(element.key, key);
  });

  it('creates an empty element with attributes and listeners', () => {

    // given
    const onChange = () => {};
    const props = {
      type: 'text',
      tabIndex: 1,
      autoFocus: true,
      onChange,
    };
    const description = Template.describe([
      'input',
      props,
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.description.name, 'input');
    assert.deepEqual(element.description.attrs, {
      type: 'text',
      tabIndex: '1',
      autoFocus: '',
    });
    assert.deepEqual(element.description.listeners, {
      onChange,
    });
    assert(element.text === undefined);
    assert(element.description.children === undefined);
    assert(element.children === undefined);
  });

  it('creates a text element', () => {

    // given
    const description = Template.describe([
      'div',
      'Text',
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.description.name, 'div');
    assert(element.description.attrs === undefined);
    assert(element.description.listeners === undefined);
    assert.equal(element.description.text, 'Text');
    assert(element.children === undefined);
  });

  it('creates element with attributes', () => {

    // given
    const description = Template.describe([
      'input',
      {
        value: 'value',
        id: 'some-id',
      },
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element);
    assert(element.isElement());
    assert.equal(element.description.name, 'input');
    assert.deepEqual(element.description.attrs, {
      value: 'value',
      id: 'some-id',
    });
    assert(element.ref);
  });

  it('creates element with data attributes', () => {

    // given
    const description = Template.describe([
      'input',
      {
        dataset: {
          custom: true,
          another: 17,
        },
      },
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element);
    assert(element.isElement());
    assert.equal(element.description.name, 'input');
    assert.deepEqual(element.description.dataset, {
      custom: '',
      another: '17',
    });
    assert.equal(element.key, undefined);
    assert(element.ref);
  });

  it('creates element with class names', () => {

    // given
    const description = Template.describe([
      'div',
      {
        class: [
          'foo',
          {
            bar: true,
          },
          [
            [
              [
                'nested',
              ],
            ],
          ],
        ],
      },
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element);
    assert(element.isElement());
    assert.equal(element.description.name, 'div');
    assert.equal(element.description.class, 'foo bar nested');
    assert.equal(element.key, undefined);
    assert(element.ref);
  });

  it('creates a text element with attributes and listeners', () => {

    // given
    const onClickListener = () => {};
    const props = {
      href: 'http://www.example.com/',
      target: '_blank',
      title: 'Example',
      onClick: onClickListener,
    };
    const description = Template.describe([
      'a',
      props,
      'Example',
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.description.name, 'a');
    assert.deepEqual(element.description.attrs, {
      'href': 'http://www.example.com/',
      'target': '_blank',
      'title': 'Example',
    });
    assert.deepEqual(element.description.listeners, {
      onClick: onClickListener,
    });
    assert.equal(element.description.text, 'Example');
    assert(element.children === undefined);
  });

  it('ignores null and undefined attribute values', () => {

    // given
    const props = {
      href: null,
      target: undefined,
      title: 'Test',
    };
    const description = Template.describe([
      'a',
      props,
      'Text',
    ]);

    // when
    const element = VirtualDOM.createFromDescription(description);

    // then
    assert(element instanceof VirtualElement);
    assert.equal(element.description.name, 'a');
    assert.deepEqual(element.description.attrs, {
      'title': 'Test',
    });
    assert.equal(element.description.text, 'Text');
    assert(element.children === undefined);
  });

  describe('supports adding attributes', () => {

    it('adds string attributes', () => {

      // given
      const props = {
        title: 'Title',
        value: 'Value',
      };
      const description = Template.describe([
        'div',
        props,
      ]);

      // when
      const element = VirtualDOM.createFromDescription(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.description.name, 'div');
      assert.deepEqual(element.description.attrs, {
        title: 'Title',
        value: 'Value',
      });
    });

    it('adds number attributes', () => {

      // given
      const props = {
        height: 0,
        width: 200,
      };
      const description = Template.describe([
        'span',
        props,
      ]);

      // when
      const element = VirtualDOM.createFromDescription(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.description.name, 'span');
      assert.deepEqual(element.description.attrs, {
        height: '0',
        width: '200',
      });
    });

    it('adds boolean attributes', () => {

      // given
      const props = {
        checked: 'true',
        selected: true,
      };
      const description = Template.describe([
        'input',
        props,
      ]);

      // when
      const element = VirtualDOM.createFromDescription(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.description.name, 'input');
      assert.deepEqual(element.description.attrs, {
        checked: 'true',
        selected: '',
      });
    });

    it('ignores null and undefined values', () => {

      // given
      const props = {
        title: undefined,
        type: null,
      };
      const description = Template.describe([
        'section',
        props,
      ]);

      // when
      const element = VirtualDOM.createFromDescription(description);

      // then
      assert(element instanceof VirtualElement);
      assert.equal(element.description.name, 'section');
      assert(element.attrs === undefined);
    });

    describe('add "class" attribute', () => {

      const createElementWithClasses = (element, classNames) => {
        const description = Template.describe([
          element,
          {
            class: classNames,
          },
        ]);
        return VirtualDOM.createFromDescription(description);
      };

      it('supports strings', () => {

        // given
        const classNames = 'foo bar';

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.class, 'foo bar');
      });

      it('supports arrays', () => {

        // given
        const classNames = ['foo', null, 'bar', undefined];

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.class, 'foo bar');
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
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.class, 'foo bar');
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
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.class, 'foo bar');
      });

      it('keeps redundant classes', () => {

        // given
        const classNames = ['foo', 'bar', 'bar'];

        // when
        const element = createElementWithClasses('div', classNames);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.class, 'foo bar bar');
      });
    });

    describe('add "style" attribute', () => {

      const createElementWithStyle = (element, style) => {
        const description = Template.describe([
          element,
          {
            style,
          },
        ]);
        return VirtualDOM.createFromDescription(description);
      };

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
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.style, style);
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
        assert.equal(element.description.name, 'div');
        assert.deepEqual(element.description.style, {
          height: '10em',
          width: '100px',
        });
      });

      it('ignores null and undefined values', () => {

        // given
        const style = {
          width: null,
          size: undefined,
        };

        // when
        const element = createElementWithStyle('section', style);

        // then
        assert(element instanceof VirtualElement);
        assert.equal(element.description.name, 'section');
        assert(element.style === undefined);
      });

      describe('add "filter"', () => {

        const createElementWithFilter = (element, filter) => {
          const description = Template.describe([
            element,
            {
              style: {
                filter,
              },
            },
          ]);
          return VirtualDOM.createFromDescription(description);
        };

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
          assert.equal(element.description.name, 'section');
          assert.equal(
              element.description.style.filter, 'blur(5px) saturate(2)');
        });
      });

      describe('add "transform"', () => {

        const createElementWithTransform = (element, transform) => {
          const description = Template.describe([
            element,
            {
              style: {
                transform,
              },
            },
          ]);
          return VirtualDOM.createFromDescription(description);
        };

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
          assert.equal(element.description.name, 'section');
          assert.equal(
              element.description.style.transform,
              'translate3d(0, 0, 0) scale(2) rotate(90deg)');
        });
      });
    });
  });
});
