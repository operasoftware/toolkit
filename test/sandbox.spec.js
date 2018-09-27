describe('Sandbox', () => {

  const Sandbox = opr.Toolkit.Sandbox;

  class Root extends opr.Toolkit.Root {
    constructor() {
      super(null, {}, opr.Toolkit);
    }
  }

  class Component extends opr.Toolkit.Component {
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
      }
      const component = new SomeComponent();

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
        a() {
          return this;
        }
        b() {
          return 666;
        }
      }

      const SomeComponent = class extends ParentComponent {
        c() {
          return 'c';
        }
      };
      const component = new SomeComponent();

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
      const component = new Component();

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
      const component = new Component();
      const children = [];

      // when
      const sandbox = Sandbox.create(component);
      sandbox.children = children;

      // then
      assert.deepEqual(sandbox.children, children);
    })

    it('allows to get root state as props', () => {

      // given
      const root = new Root();
      root.state = {
        foo: 'bar',
      };

      // when
      const sandbox = Sandbox.create(root);

      // then
      assert.equal(sandbox.props, root.state);
    })

    it('allows to get component props', () => {

      // given
      const component = new Component();
      component.props = {
        foo: 'bar',
      };

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.props, component.props);
    })

    it('allows to get root-specific properties', () => {

      // given
      const dispatch = () => {};
      const component = new Root();
      component.dispatch = dispatch;

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.dispatch, dispatch);
    });

    it('allows to register services', () => {

      // given
      const component = new Component();

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(typeof sandbox.connectTo, 'function');
    });

    it('ignores unknown properties', () => {

      // given
      const component = new Component();

      // when
      const sandbox = Sandbox.create(component);
      sandbox.unknown = 'unknown';

      // then
      assert.equal(sandbox.unknown, undefined);
    });

    it('returns a reference to the component', () => {

      // given
      const component = new Component();

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
      }
      const component = new ComponentWithProperty();

      // when
      const sandbox = Sandbox.create(component);

      // then
      assert.equal(sandbox.property, 'value');
    });
  });
});
