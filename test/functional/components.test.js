describe('Components', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('section');
    document.body.appendChild(container);
  });

  afterEach(() => { container.remove(); })

  it('creates a simple Component', async () => {

  });

  // drive
  it('creates a synchronous Web Component', async () => {

    // given
    class AnimationComponent extends opr.Toolkit.WebComponent {
      
      getInitialState(props) {
        return {
          ...props,
          animation: 'fade-in',
        };
      }

      getUpdatedState(props, state) {
        return {
          ...state,
          ...props,
          animation: 'shake',
        }
      }

      onAttached() {
        this
      }

      render() {
        return [
          'section',
          [
            'span', this.props.firstName,
          ],
          [
            'span', this.props.lastName,
          ],
        ];
      }
    }
  });

  it('creates a pure Web Component', async () => {

    // component purely driven by its attributes
    class PureComponent extends opr.Toolkit.WebComponent {

      static elementName = 'pure-component';

      onAttrsChange(attrs) {
        
      }

    }

  });


  it('creates an asynchronous Web Component', async () => {

  });
    
//     const render = (ComponentClass, template) => {

//     };

//     class PlainComponent extends opr.Toolkit.Component {

//       render() {
//         return [
//           'main',
//         ];
//       }
//     }

//     const updateTemplateTo = await renderTemplate(
//         [
//           'main',
//         ],
//         CustomElement);

//     const element = container.querySelector('*');
//     assert.equal(customElement.ref, element);
//     assert.equal('yes', element.getAttribute('converted-to-lowecase'));
//  });
});