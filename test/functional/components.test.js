describe.only('Components', () => {

  let container;

  beforeEach(() => {
    container = document.createElement('section');
    container.style.opacity = 0;
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('- pure function', () => {

    const Section = props => [
      'section',
      {
        class: 'pure-component',
      },
      props.text || null,
    ];

    let component;

    it('renders content', async () => {

      // given
      const text = 'One Toolkit to rule them all.';

      const props = {
        text,
      };

      // when
      component = await opr.Toolkit.xpRender(Section, container, props);

      // then
      assert(component.ref);
      assert.equal(component.ref.textContent, text);
    });

    it.skip('renders custom element', async () => {

      // given
      class CustomElement extends opr.Toolkit.WebComponent {

        static elementName = 'custom-element';

        render() {
          return [
            'main',
          ];
        }
      }

      // when
      const component = await opr.Toolkit.render(CustomElement, container);

      // then
      assert.equal(component.ref.tagName, 'CUSTOM-ELEMENT');
    });

  });
});
