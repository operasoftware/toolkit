describe('Virtual DOM', () => {

  const {Template, VirtualDOM} = opr.Toolkit;

  const createElement = details =>
      VirtualDOM.createFromDescription(Template.normalize(details), null, null);

  suppressConsoleErrors();

  describe('=> create element', () => {

    it('creates empty element', () => {

      // given
      const description = {
        element: 'div',
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.equal(element.text, null);
      assert.equal(element.key, undefined);
      assert(element.ref);
    });

    it('creates element with a key', () => {

      // given
      const description = {
        element: 'span',
        props: {
          key: 'key',
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'span');
      assert.equal(element.text, null);
      assert.equal(element.key, 'key');
      assert(element.ref);
    });

    it('creates element with text content', () => {

      // given
      const description = {
        element: 'span',
        text: 'Text',
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'span');
      assert.equal(element.text, 'Text');
      assert.equal(element.key, null);
      assert(element.ref);
    });

    it('creates element with attributes', () => {

      // given
      const description = {
        element: 'input',
        props: {
          value: 'value',
          id: 'some-id',
          unknown: true,
        },
      };

      // when
      const element = createElement(description, new opr.Toolkit.Component());

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'input');
      assert.deepEqual(element.attrs, {
        value: 'value',
        id: 'some-id',
      });
      assert.deepEqual(element.dataset, {});
      assert.equal(element.text, null);
      assert.equal(element.key, undefined);
      assert(element.ref);
    });

    it('creates element with data attributes', () => {

      // given
      const description = {
        element: 'input',
        props: {
          dataset: {
            custom: true,
            another: 17,
          },
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'input');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {
        custom: 'true',
        another: '17',
      });
      assert.equal(element.text, null);
      assert.equal(element.key, undefined);
      assert(element.ref);
    });

    it('creates element with class names', () => {

      // given
      const description = {
        element: 'div',
        props: {
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
              [
                [() => {}],
              ],
            ],
          ],
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {});
      assert.deepEqual(element.classNames, ['bar', 'foo', 'nested']);
      assert.equal(element.text, null);
      assert.equal(element.key, undefined);
      assert(element.ref);
    });

    it('creates element with style', () => {

      // given
      const description = {
        element: 'div',
        props: {
          style: {
            color: 'red',
            backgroundColor: 'black',
            unknown: 'green',
          },
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {});
      assert.deepEqual(element.style, {
        color: 'red',
        backgroundColor: 'black',
      });
      assert.equal(element.text, null);
      assert.equal(element.key, undefined);
      assert(element.ref);
    });

    it('creates element with listeners', () => {

      // given
      const onClick = () => {};
      const onChange = () => {};
      const description = {
        element: 'div',
        props: {
          onClick,
          onChange,
        },
      };

      // when
      const element = createElement(description);

      // then
      assert(element);
      assert(element.isElement());
      assert.equal(element.name, 'div');
      assert.deepEqual(element.attrs, {});
      assert.deepEqual(element.dataset, {});
      assert.deepEqual(element.listeners, {
        onClick,
        onChange,
      });
      assert.equal(element.text, null);
      assert.equal(element.key, null);
      assert(element.ref);
    });

  });

  describe('=> create child tree', () => {

    const App = class extends opr.Toolkit.Root {
      render() {
        return [
          'div',
        ];
      }
    };
  });

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
      const divElement = utils.createFromTemplate(template);

      // then
      assert(divElement.isElement())
      assert.equal(divElement.name, 'div');
      assert.equal(divElement.children.length, 1);

      const spanElement = divElement.children[0];
      assert(spanElement.isElement());
      assert.equal(spanElement.name, 'span');
      assert.equal(spanElement.children.length, 1);

      const linkElement = spanElement.children[0];
      assert(linkElement.isElement());
      assert.equal(linkElement.name, 'a');
      assert.equal(linkElement.text, 'Text');
    });

    it('returns null for template === null', () => {
      assert.equal(utils.createFromTemplate(null), null);
    });

    it('returns null for template === false', () => {
      assert.equal(utils.createFromTemplate(false), null);
    });

    it('throws an error for template === []', () => {
      assert.throws(() => utils.createFromTemplate([]));
    });

    it('throws when template === undefined', () => {
      assert.throws(
          utils.createFromTemplate, Error, 'Invalid undefined template!');
    });
  });

  describe('=> normalize props', () => {

    const createComponentClass = defaultProps => {
      return class Component {
        static get defaultProps() {
          return defaultProps;
        }
      }
    };

    it('overrides undefined values', () => {

      // given
      const props = {
        foo: undefined,
      };

      const ComponentClass = createComponentClass({
        foo: [],
      });

      // when
      const normalizedProps = VirtualDOM.normalizeProps(ComponentClass, props);

      // then
      assert.deepEqual(normalizedProps, {
        foo: [],
      });
    });

    it('does not override falsy values', () => {

      // given
      const props = {
        foo: null,
        bar: 0,
        boolean: false,
      };

      const ComponentClass = createComponentClass({
        foo: [],
        bar: 10,
        boolean: true,
      });

      // when
      const normalizedProps = VirtualDOM.normalizeProps(ComponentClass, props);

      // then
      assert.deepEqual(normalizedProps, props);
    });

    it('does not override truthy values', () => {

      // given
      const props = {
        foo: {},
        bar: 10,
        other: [],
      };

      const ComponentClass = createComponentClass({
        foo: {a: 1},
        bar: 20,
        other: [1, 2, 3],
      });

      // when
      const normalizedProps = VirtualDOM.normalizeProps(ComponentClass, props);

      // then
      assert.deepEqual(normalizedProps, props);
    });
  });
});
