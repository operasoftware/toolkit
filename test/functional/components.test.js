describe.only('Components', () => {

  let container;

  beforeEach(() => {
    container = document.createElement('section');
    document.body.appendChild(container);
  });

  afterEach(() => { container.remove(); })

  describe('=> Web Component', () => {

    it('renders custom element', async() => {

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
      const customElement = await opr.Toolkit.render(CustomElement, container);

      // then
      assert.equal(customElement.ref.tagName, 'CUSTOM-ELEMENT');
    })
  });
});
