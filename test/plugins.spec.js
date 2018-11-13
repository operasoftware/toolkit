describe('Plugins', () => {

  const plugin = {
    name: 'plugin',
    install: sinon.stub().returns(opr.Toolkit.noop),
  };

  describe('=> Install', () => {

    it('installs plugin on the root component', async () => {

      // given
      opr.Toolkit.reset();
      await opr.Toolkit.configure({
        debug: true,
        plugins: [plugin],
      });

      class SomeRoot extends opr.Toolkit.Root {
        render() {
          return ['main'];
        }
      }

      // when
      await opr.Toolkit.render(SomeRoot, document.body);

      // then
      assert(plugin.install.calledOnce);
    });
  });
});
