describe('Sandbox', () => {

  const Sandbox = opr.Toolkit.Sandbox;

  class Component extends opr.Toolkit.Component {
    render() {
      return null;
    }
  }

  describe('create sandbox', () => {

    it('returns a sandbox containing own methods', () => {

      // given
      const SomeComponent = class extends opr.Toolkit.Component {
        a() {
          return this;
        }
        b() {
          return 'b';
        }
        render() {
          return null;
        }
      }
      const component = createFromTemplate([SomeComponent]);

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(typeof sandbox, 'object');
      assert.equal(sandbox.a, sandbox.a);
      assert.equal(sandbox.a(), sandbox);
      assert.equal(sandbox.b(), 'b');
    })

    it('returns a sandbox containing inherited methods', () => {

      // given
      const ParentComponent = class extends opr.Toolkit.Component {
        render() {
          return null;
        }
        a() {
          return this;
        }
        b() {
          return 666;
        }
      }

      class SomeComponent extends ParentComponent {
        c() {
          return 'c';
        }
      }
      const component = createFromTemplate([SomeComponent]);

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(typeof sandbox, 'object');
      assert.equal(sandbox.a, sandbox.a);
      assert.equal(sandbox.a(), sandbox);
      assert.equal(sandbox.b, sandbox.b);
      assert.equal(sandbox.b(), 666);
      assert.equal(sandbox.c(), 'c');
    })

    it('does not return built-in component properties', () => {

      // given
      const component = createFromTemplate([Component]);

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.constructor, Component);
      assert.equal(sandbox.appendChild, undefined);
      assert.equal(sandbox.nodeType, undefined);
      assert.equal(sandbox.onUpdated, undefined);
      assert.equal(sandbox.unknown, undefined);
    })

    it('allows to get component children', () => {

      // given
      const component = createFromTemplate([Component]);
      const children = [];

      // when
      const sandbox = Sandbox.create(component);
      sandbox.children = children;

      // then
      assert.deepEqual(sandbox.children, children);
    })

    it('allows to get root state as props', () => {

      const initialState = {
        counter: 0,
      };

      // given
      const root = createRoot();
      root.state = initialState;

      // when
      const sandbox = Sandbox.create(root);

      // then
      assert.equal(sandbox.props, initialState);

      // when
      const updatedState = {
        counter: 1,
      };
      sandbox.props = updatedState;

      // then
      assert.equal(sandbox.props, updatedState);
    });

    it('allows to get component props', () => {

      // given
      const component = createComponent();
      const props = {
        foo: 'bar',
      };

      // when
      const sandbox = Sandbox.create(component);
      sandbox.props = props;

      // then
      assert.equal(sandbox.props, props);
    })

    it('allows to get root-specific properties', () => {

      // given
      const dispatch = () => {};
      const component = createRoot();
      component.dispatch = dispatch;

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.dispatch, dispatch);
    });

    it('allows to register services', () => {

      // given
      const component = createComponent();

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(typeof sandbox.connectTo, 'function');
    });

    it('ignores unknown properties', () => {

      // given
      const component = createComponent();

      // when
      const sandbox = Sandbox.create(component);
      sandbox.unknown = 'unknown';

      // then
      assert.equal(sandbox.unknown, undefined);
    });

    it('returns a reference to the component', () => {

      // given
      const component = createComponent();

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.$component, component);
    });

    it('returns component property', () => {

      // given
      class ComponentWithProperty extends opr.Toolkit.Component {
        get property() {
          return 'value';
        }
        render() {
          return null;
        }
      }
      const component = createFromTemplate([ComponentWithProperty]);

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.property, 'value');
    });
  });
});
