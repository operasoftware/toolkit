describe('Virtual Element => amend', () => {

  const VirtualElement = opr.Toolkit.VirtualElement;

  const createElement = name => new VirtualElement({element: name});

  describe('set class name', () => {

    it('adds new class', () => {

      // given
      const div = createElement('div');

      // when
      div.setClassName('class');

      // then
      assert.equal(div.className, 'class');
    });

    it('replaces class', () => {

      // given
      const div = createElement('div');
      div.className = 'class';

      // when
      div.setClassName('another-class');

      // then
      assert.equal(div.className, 'another-class');
    });

    it('removes class', () => {

      // given
      const div = createElement('div');
      div.className = 'class';

      // when
      div.setClassName('');

      // then
      assert.equal(div.className, '');
    });
  });
});
