describe('Template', () => {

  const Template = opr.Toolkit.Template;

  describe('get class name', () => {

    it('supports strings', () => {

      // given
      const value = 'foo bar';
      const emptyString = '';

      // then
      assert.equal(Template.getClassName(value), value);
      assert.equal(Template.getClassName(emptyString), emptyString);
    });

    it('supports objects', () => {

      // given
      const value = {
        'used': true,
        'not-used': false,
        'ignored': null,
        'disregarded': undefined,
      };

      // when
      const className = Template.getClassName(value);

      // then
      assert.equal(className, 'used');
    });

    it('supports arrays', () => {

      // given
      const value = [
        'nobody',
        null,
        'expects',
        undefined,
        'spanish',
        false,
        'inquisition',
      ];

      // when
      const className = Template.getClassName(value);

      // then
      assert.equal(className, 'nobody expects spanish inquisition');
    });

    it('supports array / array nesting', () => {

      // given
      const value = ['first', ['second', ['third']], 'fourth'];

      // when
      const className = Template.getClassName(value);

      // then
      assert.equal(className, 'first second third fourth');
    });

    it('supports array / object nesting', () => {

      // given
      const value = ['first', {'second': true}, 'third'];

      // when
      const className = Template.getClassName(value);

      // then
      assert.equal(className, 'first second third');
    });

    it('ignores null', () => {
      assert.equal(Template.getClassName(null), '');
    });

    it('ignores undefined', () => {
      assert.equal(Template.getClassName(undefined), '');
    });

    it('rejects symbols', () => {
      assert.throws(() => Template.getClassName(Symbol.for('invalid')));
    });

    it('rejects functions', () => {
      assert.throws(() => Template.getClassName(() => {}));
    });
  });

  describe('get style', () => {

    it('supports strings', () => {

      // given
      const value = {
        color: 'black',
        display: 'inherit',
      };

      // when
      const style = Template.getStyle(value);

      // then
      assert.deepEqual(style, value);
    });

    it('supports an empty string', () => {

      // given
      const value = {
        content: '',
      };

      // when
      const style = Template.getStyle(value);

      // then
      assert.deepEqual(style, {
        content: '\'\'',
      });
    });

    it('supports numbers', () => {

      // given
      const value = {
        gridColumn: 2,
        gridRow: 3,
      };

      // when
      const style = Template.getStyle(value);

      // then
      assert.deepEqual(style, {
        gridColumn: '2',
        gridRow: '3',
      });
    });

    it('supports arrays', () => {

      // given
      const value = {
        width: [100, '%'],
        height: [50, 'vh'],
      };

      // when
      const style = Template.getStyle(value);

      // then
      assert.deepEqual(style, {
        width: '100%',
        height: '50vh',
      });
    });

    it('rejects functions', () => {
      assert.throws(() => Template.getStyle({color: () => {}}));
    });

    it('rejects symbols', () => {
      assert.throws(() => Template.getStyle({height: Symbol.for('100px')}));
    });

    it('ignores null', () => {
      assert.equal(Template.getStyle({width: null}), null);
    });

    it('ignores false', () => {
      assert.equal(Template.getStyle({display: false}), null);
    });

    it('ignores undefined', () => {
      assert.deepEqual(Template.getStyle({
        margin: 'auto',
        color: undefined,
      }), {
        margin: 'auto',
      });
    });

    it('warns on unknown properties', () => {

      sinon.stub(console, 'warn');
      try {
        // given
        const value = {
          unknown: true,
          time: 420,
        };

        // when
        const style = Template.getStyle(value);

        // then
        assert.equal(style, null);
        assert(console.warn.calledTwice);

      } finally {
        console.warn.restore();
      }
    });

    it('handles only known style properties', () => {

      sinon.stub(console, 'warn');
      try {
        // given
        const value = {
          color: 'green',
          time: 420,
        };

        // when
        const style = Template.getStyle(value);

        // then
        assert.deepEqual(style, {color: 'green'});
        assert(console.warn.called);

      } finally {
        console.warn.restore();
      }
    });

    it('rejects unknown functions list', () => {

      // given
      const style = {
        background: {},
      };

      // then
      assert.throws(() => Template.getStyle(style));
    });

    it('handles only valid transform functions', () => {

      // given
      const transform = {
        translate: [10, 'px'],
        rotate: undefined,
        skew: null,
        scale: false,
      };

      // when
      const value = Template.getStyle({transform});

      // then
      assert.deepEqual(value, {transform: 'translate(10px)'});
    });

    it('handles only valid filter functions', () => {

      // given
      const filter = {
        contrast: [10],
        hueRotate: '',
        opacity: undefined,
        sepia: null,
        blur: '4px',
        unknown: 666,
      };

      // when
      const value = Template.getStyle({filter});

      // then
      assert.deepEqual(value, {filter: 'contrast(10) blur(4px)'});
    });
  });

  describe('get listeners', () => {

    it('handles known events', () => {

      // given
      const onClick = () => {};
      const onDoubleClick = () => {};
      const onChange = () => {};

      const listeners = {
        onClick,
        onDoubleClick,
        onChange,
      };

      // when
      const props = Template.getElementProps(listeners);

      // then
      assert.deepEqual(props, {listeners});
    });

    it('warns on unknown events', () => {

      sinon.stub(console, 'warn');
      try {

        // given
        const onMyEvent = () => {};
        const unknownListeners = {
          onMyEvent,
        };

        // when
        const props = Template.getElementProps(unknownListeners);

        // then
        assert.equal(props, null);
        assert(console.warn.calledOnce);

      } finally {
        console.warn.restore();
      }

    });

    it('supports functions', () => {

      // given
      const value = () => {};

      // when
      const listener = Template.getListener(value);

      // then
      assert.equal(listener, value);
    });

    it('ignores null', () => {

      // given
      const value = null;

      // when
      const listener = Template.getListener(value);

      // then
      assert.equal(listener, null);
    });

    it('ignores false', () => {

      // given
      const value = false;

      // when
      const listener = Template.getListener(value);

      // then
      assert.equal(listener, null);
    });

    it('ignores undefined', () => {

      // given
      const value = undefined;

      // when
      const listener = Template.getListener(value);

      // then
      assert.equal(listener, null);
    });

    it('rejects anything else', () => {
      assert.throws(() => Template.getListener(Symbol.for('invalid')));
      assert.throws(() => Template.getListener(5));
      assert.throws(() => Template.getListener(true));
      assert.throws(() => Template.getListener([]));
      assert.throws(() => Template.getListener({}));
    });
  });

  describe('get attribute value', () => {

    it('supports strings', () => {
      assert.equal(Template.getAttributeValue('inherit'), 'inherit');
      assert.equal(Template.getAttributeValue('none'), 'none');
    });

    it('supports an empty string', () => {
      assert.equal(Template.getAttributeValue(''), '');
    });

    it('handles true as an empty string', () => {
      assert.equal(Template.getAttributeValue(true), '');
    });

    it('supports numbers', () => {
      assert.equal(Template.getAttributeValue(10), '10');
    });

    it('supports arrays', () => {
      assert.equal(Template.getAttributeValue([100, 'px']), '100px');
      assert.equal(Template.getAttributeValue([2, 'rem']), '2rem');
      assert.equal(Template.getAttributeValue([90, 'deg']), '90deg');
      assert.equal(Template.getAttributeValue([]), '');
    });

    it('ignores null', () => {
      assert.equal(Template.getAttributeValue(null), null);
    });

    it('ignores false', () => {
      assert.equal(Template.getAttributeValue(false), null);
    });

    it('ignores undefined', () => {
      assert.equal(Template.getAttributeValue(undefined), null);
    });
  });

  describe('get dataset', () => {

    it('supports strings', () => {

      // given
      const props = {
        value: 'test',
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.deepEqual(dataset, props);
    });

    it('supports an empty string', () => {

      // given
      const props = {
        value: '',
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.deepEqual(dataset, props);
    });

    it('handles true as an empty string', () => {

      // given
      const props = {
        value: true,
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.deepEqual(dataset, {
        value: '',
      });
    });

    it('supports numbers', () => {

      // given
      const props = {
        width: 800,
        height: 600,
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.deepEqual(dataset, {
        width: '800',
        height: '600',
      });
    });

    it('supports arrays', () => {

      // given
      const props = {
        value: [90, 'deg'],
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.deepEqual(dataset, {
        value: '90deg',
      });
    });

    it('ignores false', () => {

      // given
      const props = {
        value: false,
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.equal(dataset, null);
    });

    it('ignores null', () => {

      // given
      const props = {
        value: null,
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.equal(dataset, null);
    });

    it('ignores undefined', () => {

      // given
      const props = {
        value: undefined,
      };

      // when
      const dataset = Template.getDataset(props);

      // then
      assert.equal(dataset, null);
    });

    it('rejects symbols', () => {

      // given
      const props = {
        value: Symbol('value'),
      };

      // then
      assert.throws(() => Template.getDataset(props));
    });

    it('rejects functions', () => {

      // given
      const props = {
        value: () => {},
      };

      // then
      assert.throws(() => Template.getDataset(props));
    });

    it('rejects objects', () => {

      // given
      const props = {
        value: {},
      };

      // then
      assert.throws(() => Template.getDataset(props));
    });
  });

  describe('get properties', () => {

    it('supports strings', () => {

      // given
      const props = {
        value: 'value',
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });

    it('supports objects', () => {

      // given
      const props = {
        value: {
          foo: 'bar',
        },
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });

    it('supports arrays', () => {

      // given
      const props = {
        value: [1, 2, 3],
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });

    it('supports booleans', () => {

      // given
      const props = {
        foo: true,
        bar: false,
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });

    it('supports symbols', () => {

      // given
      const props = {
        value: Symbol('value'),
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });

    it('supports null', () => {

      // given
      const props = {
        value: null,
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });

    it('supports undefined', () => {

      // given
      const props = {
        value: undefined,
      };

      // when
      const properties = Template.getProperties(props);

      // then
      assert.deepEqual(properties, props);
    });
  });

  describe('get custom listeners', () => {

    it('supports functions', () => {

      // given
      const myListener = () => {};
      const otherListener = () => {};
      const value = {
        on: {
          'my-event': myListener,
          'other-listener': otherListener,
        },
      };

      // when
      const props = Template.getElementProps(value);

      // then
      assert.deepEqual(props, {
        custom: {
          listeners: value.on,
        },
      });
    });

    it('ignores null', () => {

      // given
      const value = {
        on: {
          'my-event': null,
        },
      };

      // when
      const props = Template.getElementProps(value);

      // then
      assert.equal(props, null);
    });

    it('ignores false', () => {

      // given
      const value = {
        on: {
          'some-event': false,
        },
      };

      // when
      const props = Template.getElementProps(value);

      // then
      assert.equal(props, null);
    });

    it('ignores undefined', () => {

      // given
      const value = {
        on: {
          'another-event': undefined,
        },
      };

      // when
      const props = Template.getElementProps(value);

      // then
      assert.equal(props, null);
    });

    it('rejects anything else', () => {

      // given
      const createCustomListener = value => Template.getElementProps({
        on: {
          'another-event': value,
        },
      });

      // then
      assert.throws(() => createCustomListener(666));
      assert.throws(() => createCustomListener(Symbol('')));
      assert.throws(() => createCustomListener('xxx'));
      assert.throws(() => createCustomListener(true));
    });
  });

  describe('get custom attributes', () => {

    it('supports strings', () => {

      // given
      const props = {
        value: 'test',
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.deepEqual(dataset, props);
    });

    it('supports an empty string', () => {

      // given
      const props = {
        value: '',
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.deepEqual(dataset, props);
    });

    it('handles true as an empty string', () => {

      // given
      const props = {
        value: true,
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.deepEqual(dataset, {
        value: '',
      });
    });

    it('supports numbers', () => {

      // given
      const props = {
        width: 800,
        height: 600,
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.deepEqual(dataset, {
        width: '800',
        height: '600',
      });
    });

    it('supports arrays', () => {

      // given
      const props = {
        value: [90, 'deg'],
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.deepEqual(dataset, {
        value: '90deg',
      });
    });

    it('ignores false', () => {

      // given
      const props = {
        value: false,
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.equal(dataset, null);
    });

    it('ignores null', () => {

      // given
      const props = {
        value: null,
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.equal(dataset, null);
    });

    it('ignores undefined', () => {

      // given
      const props = {
        value: undefined,
      };

      // when
      const dataset = Template.getCustomAttributes(props);

      // then
      assert.equal(dataset, null);
    });

    it('rejects symbols', () => {

      // given
      const props = {
        value: Symbol('symbol'),
      };

      // then
      assert.throws(() => Template.getCustomAttributes(props));
    });

    it('rejects functions', () => {

      // given
      const props = {
        value: () => {},
      };

      // then
      assert.throws(() => Template.getCustomAttributes(props));
    });

    it('rejects objects', () => {

      // given
      const props = {
        value: {
          foo: 'bar',
        },
      };

      // then
      assert.throws(() => Template.getCustomAttributes(props));
    });
  });
});
