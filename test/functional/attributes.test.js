describe('Attributes', () => {

  let container;

  beforeEach(() => {
    container = document.createElement('section');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  })

  it('sets custom attribute for WebComponent', async () => {

    const elementName = 'custom-element';

    class CustomElement extends opr.Toolkit.WebComponent {

      static get elementName() {
        return elementName;
      }

      render() {
        return [
          'main',
        ];
      }
    }

    const customElement = await opr.Toolkit.render(CustomElement, container, {
      attrs: {
        convertedToLowecase: 'yes',
      },
    });

    const element = container.querySelector('*');
    assert.equal(customElement.ref, element);
    assert.equal('yes', element.getAttribute('converted-to-lowecase'));
  });

});
