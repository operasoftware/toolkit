describe('Virtual Element => amend', () => {

  const VirtualElement = opr.Toolkit.VirtualElement;

  describe('add class name', () => {

    it('adds new class', () => {

      // given
      const div = new VirtualElement('div');

      // when
      div.addClassName('class');

      // then
      assert.deepEqual(div.classNames, ['class']);
    });

    it('adds already-existing class', () => {

      // given
      const div = new VirtualElement('div');
      div.classNames = ['class'];

      // when
      div.addClassName('class');

      // then
      assert.deepEqual(div.classNames, ['class', 'class']);
    });
  });

  describe('remove class name', () => {

    it('removes duplicated class names', () => {

      // given
      const div = new VirtualElement('div');
      div.classNames = ['class', 'another', 'class'];

      // when
      div.removeClassName('class');

      // then
      assert.deepEqual(div.classNames, ['another']);
    });

  });
});
