describe('Template => normalize props', () => {

  const {
    Template,
  } = opr.Toolkit;

  const createComponentClass = defaultProps =>
      (class Component extends opr.Toolkit.Component {
        static get defaultProps() {
          return defaultProps;
        }
      });

  it('returns original props when no default defined', () => {

    // given
    const props = {
      foo: 'bar',
    };

    const ComponentClass = createComponentClass();

    // when
    const normalizedProps =
        Template.normalizeComponentProps(props, ComponentClass);

    // then
    assert.deepEqual(normalizedProps, props);
  });

  it('returns an empty object when no empty props defined', () => {

    // given
    const ComponentClass = createComponentClass();

    // when
    const normalizedProps =
        Template.normalizeComponentProps(undefined, ComponentClass);

    // then
    assert.deepEqual(normalizedProps, {});
  });

  it('overrides undefined values', () => {

    // given
    const props = {
      foo: undefined,
    };

    const ComponentClass = createComponentClass({
      foo: [],
    });

    // when
    const normalizedProps =
        Template.normalizeComponentProps(props, ComponentClass);

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
    const normalizedProps =
        Template.normalizeComponentProps(props, ComponentClass);

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
    const normalizedProps =
        Template.normalizeComponentProps(props, ComponentClass);

    // then
    assert.deepEqual(normalizedProps, props);
  });
});
