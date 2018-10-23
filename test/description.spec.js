describe('Description', () => {

  const Template = opr.Toolkit.Template;
  const {
    ComponentDescription,
    ElementDescription,
  } = opr.Toolkit.Description;

  describe('is compatible', () => {

    it('returns false for different types', () => {

      // given
      const componentDescription = new ComponentDescription({
        subtype: 'function',
        function: props => null,
      });
      const elementDescription = new ElementDescription('main');

      // assert
      assert(!componentDescription.isCompatible(elementDescription));
      assert(!elementDescription.isCompatible(componentDescription));
    });

    it('returns true for elements with the same name', () => {

      // given
      const firstDivDescription = new ElementDescription('div');
      firstDivDescription.text = 'bar';

      const secondDivDescription = new ElementDescription('div');
      secondDivDescription.text = 'bar';

      // assert
      assert(firstDivDescription.isCompatible(secondDivDescription));
      assert(secondDivDescription.isCompatible(firstDivDescription));
    });

    it('returns false for elements with different name', () => {

      // given
      const divDescription = new ElementDescription({
        name: 'div',
      });
      const spanDescription = new ElementDescription({
        name: 'span',
      });

      // assert
      assert(!divDescription.isCompatible(spanDescription));
      assert(!spanDescription.isCompatible(divDescription));
    });

    it('returns true for components with the same constructor', () => {

      // given
      class Component extends opr.Toolkit.Component {}

      const firstDescription = new ComponentDescription(Component);
      firstDescription.props = {
        key: 'value',
      };
      const secondDescription = new ComponentDescription(Component);

      // assert
      assert(firstDescription.isCompatible(secondDescription));
      assert(secondDescription.isCompatible(firstDescription));
    });

    it('returns false for components with different constructors', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      class OtherComponent extends opr.Toolkit.Component {}

      const componentDescription = new ComponentDescription(Component);
      componentDescription.props = {
        key: 'value',
      };
      const otherComponentDescription =
          new ComponentDescription(OtherComponent);

      // assert
      assert(!componentDescription.isCompatible(otherComponentDescription));
      assert(!otherComponentDescription.isCompatible(componentDescription));
    });
  });

  describe('as template', () => {

    class Component extends opr.Toolkit.Component {}

    it('returns template of Component', () => {

      // given
      const description = new ComponentDescription(Component);

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, [Component]);
    });

    it('returns template of Component with properties', () => {

      // given
      const props = {
        foo: 'bar',
      };
      const description = new ComponentDescription(Component);
      description.props = props;

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, [Component, props]);
    });

    it('returns template of Component with children', () => {

      // given
      const divDescription = new ElementDescription('div');
      const spanDescription = new ElementDescription('span');
      const description = new ComponentDescription(Component);
      description.children = [
        divDescription,
        spanDescription,
      ];

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, [
        Component,
        [
          'div',
        ],
        [
          'span',
        ],
      ]);
    });

    it('returns template of Component with properties and children', () => {

      // given
      const props = {
        foo: 'bar',
      };
      const divDescription = new ElementDescription('div');
      const spanDescription = new ElementDescription('span');
      const description = new ComponentDescription(Component);
      description.props = props;
      description.children = [
        divDescription,
        spanDescription,
      ];

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, [
        Component,
        props,
        [
          'div',
        ],
        [
          'span',
        ],
      ]);
    });

    it('returns template of empty Element', () => {

      // given
      const description = new ElementDescription('section');

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, ['section']);
    });

    it('returns template of text Element', () => {

      // given
      const text = 'text';
      const description = new ElementDescription('section');
      description.text = text;

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, ['section', text]);
    });

    it('returns template of Element with children', () => {

      // given
      const componentDescription = new ComponentDescription(Component);
      const description = new ElementDescription('section');
      description.children = [componentDescription];

      // when
      const template = description.asTemplate;

      // then
      assert.deepEqual(template, [
        'section',
        [
          Component,
        ],
      ]);
    });

    describe('returns template of Element', () => {

      it('=> with key', () => {

        // given
        const key = 'key';
        const description = Template.describe([
          'section',
          {
            key,
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'section',
          {
            key,
          },
        ]);
      });

      it('=> with class', () => {

        // given
        const classes = ['one', 'two', 'three'];
        const description = Template.describe([
          'section',
          {
            class: classes,
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'section',
          {
            class: 'one two three',
          },
        ]);
      });

      it('=> with style', () => {

        // given
        const description = Template.describe([
          'section',
          {
            style: {
              color: 'red',
              backgroundColor: null,
            },
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'section',
          {
            style: {
              color: 'red',
            },
          },
        ]);
      });

      it('=> with attributes', () => {

        // given
        const description = Template.describe([
          'section',
          {
            tabIndex: 10,
            title: 'Title',
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'section',
          {
            tabIndex: '10',
            title: 'Title',
          },
        ]);
      });

      it('=> with dataset', () => {

        // given
        const description = Template.describe([
          'section',
          {
            dataset: {
              test: 'test',
              boolean: true,
            },
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'section',
          {
            dataset: {
              test: 'test',
              boolean: '',
            },
          },
        ]);
      });

      it('=> with listeners', () => {

        // given
        const onChange = () => {};
        const onClick = () => {};
        const description = Template.describe([
          'section',
          {
            onChange,
            onClick,
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'section',
          {
            onChange,
            onClick,
          },
        ]);
      });

      it('=> with properties', () => {

        // given
        const description = Template.describe([
          'video',
          {
            properties: {
              paused: true,
            },
          },
        ]);

        // when
        const template = description.asTemplate;

        // then
        assert.deepEqual(template, [
          'video',
          {
            properties: {
              paused: true,
            },
          },
        ]);
      });

    });
  });
});
