describe('Dispatcher', () => {

  describe('=> Executes commands', () => {

    class Root extends opr.Toolkit.Root {}

    it('calls "set-state" upon initialization', async () => {

      // given
      const container = document.createElement('main');
      const root = createRootInstance(Root);

      sinon.spy(root.commands, 'setState');

      // when
      await root.init(container);

      // then
      assert(root.commands.setState.called);
    });

    it('calls "set-state" on direct request', async () => {

      // given
      const root = await createWebComponent(Root);
      const state = {foo: 'bar'};

      // when
      sinon.spy(root.commands, 'setState');
      root.commands.setState(state);

      // then
      assert(root.commands.setState.called);
      assert(root.commands.setState.calledWith(state));
    });

    it('calls "update" on direct request', async () => {

      // given
      const root = await createWebComponent(Root);
      const state = {foo: 'bar'};

      // when
      sinon.spy(root.commands, 'update');
      root.commands.update(state);

      // then
      assert(root.commands.update.called);
      assert(root.commands.update.calledWith(state));
    });
  });

  describe('Queues commands', () => {

    it('queues "update" from lifecycle method', async () => {

      // given
      class Root extends opr.Toolkit.Root {

        onCreated() {
          this.commands.update({
            number: 19,
          });
        }
      }
      const container = document.createElement('main');
      const root = createRootInstance(Root);
      sinon.spy(root.commands, 'update');

      // when
      const initPromise = root.init(container);

      // then
      assert(!root.commands.update.called);

      // when
      await initPromise;

      // then
      assert(root.commands.update.called);
      assert(root.commands.update.calledWith({
        number: 19,
      }));
    });
  });
});
