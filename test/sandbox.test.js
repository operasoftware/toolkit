describe('Sandbox', () => {

  const Sandbox = opr.Toolkit.Sandbox;

  describe('create context', () => {

    it('returns a context containing own methods', () => {

      // given
      const SomeComponent = class extends opr.Toolkit.Component {
        a() {
          return this;
        }
        b() {
          return 'b';
        }
      }
      const instance = new SomeComponent();

      // when
      const context = Sandbox.create(instance);

      // then
      assert.equal(typeof context, 'object');
      assert.equal(context.a, context.a);
      assert.equal(context.a(), context);
      assert.equal(context.b(), 'b');
    })

    it('returns a context containing inherited methods', () => {

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
      const instance = new SomeComponent();

      // when
      const context = Sandbox.create(instance);

      // then
      assert.equal(typeof context, 'object');
      assert.equal(context.a, context.a);
      assert.equal(context.a(), context);
      assert.equal(context.b, context.b);
      assert.equal(context.b(), 666);
      assert.equal(context.c(), 'c');
      assert.equal(context.id.length, 36);
    })

    it('does not return built-in component properties', () => {

      // given
      const instance = new opr.Toolkit.Component();

      // when
      const context = Sandbox.create(instance);

      // then
      assert.equal(context.constructor, opr.Toolkit.Component);
      assert.equal(context.appendChild, undefined);
      assert.equal(context.nodeType, undefined);
      assert.equal(context.onUpdated, undefined);
      assert.equal(context.unknown, undefined);
    })

    it('allows to set and get rendering-related properties', () => {

      // given
      const instance = new opr.Toolkit.Component();
      const props = {};
      const children = [];
      const container = document.createElement('div');

      // when
      const context = Sandbox.create(instance);
      context.props = props;
      context.children = children;

      // then
      assert.equal(context.props, props);
      assert.equal(context.children, children);
    })

    it('allows to set and get root-specific properties', () => {

      // given
      const instance = new opr.Toolkit.Root();
      const dispatch = () => {};

      // when
      const context = Sandbox.create(instance);
      context.dispatch = dispatch;

      // then
      assert.equal(context.dispatch, dispatch);
    });

    it('ignores unknown properties', () => {

      // given
      const instance = new opr.Toolkit.Component();

      // when
      const context = Sandbox.create(instance);
      context.unknown = 'unknown';

      // then
      assert.equal(context.unknown, undefined);
    });

  });
});
