describe('Performance', () => {

  const Template = opr.Toolkit.Template;

  const runs = 500000;

  describe('=> Template.describe(template)', () => {

    it('describes elements', () => {

      const onClick = () => {};

      const describeElements = i => {

        const empty = [
          'main',
        ];
        Template.describe(empty);

        const nested = [
          'section', [
            'paragraph',
          ],
        ];
        Template.describe(nested);

        const withAttributes = [
          'div', {
            class: 'foo bar',
            id: `element-${i}`,
          },
        ];
        Template.describe(withAttributes);

        const withListeners = [
          'input', {
            onClick,
          },
        ];
        Template.describe(withListeners);
      };
      for (let i = 0; i < runs; i++) {
        describeElements(i);
      }
    });

    it('describes components', () => {

      class Component extends opr.Toolkit.Component {}
      class Subcomponent extends opr.Toolkit.Component {}

      const describeComponents = i => {

        const component = [
          Component,
        ];
        Template.describe(component);

        const nested = [
          Component, [
            Subcomponent,
          ],
        ];
        Template.describe(nested);

        const withProps = [
          Component, {
            foo: 'bar',
            id: `component-${i}`,
          },
        ];
        Template.describe(withProps);
      };
      for (let i = 0; i < runs; i++) {
        describeComponents(i);
      }
    });
  });
});
