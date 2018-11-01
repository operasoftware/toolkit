describe('Template => describe', () => {

  const Template = opr.Toolkit.Template;

  beforeEach(() => {
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    console.error.restore();
  });

  describe('Component', () => {

    it('detects component symbol', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const id = 'test/component';
      const symbol = Symbol.for(id);
      const template = [symbol];

      // when
      loader.define(id, Component);
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);
    });

    it('detects component symbol with properties', () => {

      // given
      class ComponentWithProps extends opr.Toolkit.Component {}
      const id = 'test/component-with-properties';
      const symbol = Symbol.for(id);
      const props = {
        prop: 'prop',
      };
      const template = [symbol, props];

      // when
      loader.define(id, ComponentWithProps);
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, ComponentWithProps);
    });

    it('detects component symbol with child nodes', () => {

      // given
      class ComponentWithChildren extends opr.Toolkit.Component {}
      const id = 'test/component-with-children';
      const symbol = Symbol.for(id);
      const children = [
        ['div'],
        ['span'],
      ];
      const template = [symbol, ...children];

      // when
      loader.define(id, ComponentWithChildren);
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, ComponentWithChildren);
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].type, 'element');
      assert.equal(description.children[0].name, 'div');
      assert.equal(description.children[1].type, 'element');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects component symbol with filtered child nodes', () => {

      // given
      class ComponentWithChildren extends opr.Toolkit.Component {}
      const id = 'test/component-with-filtered-children';
      const symbol = Symbol.for(id);
      const children = [
        null,
        false,
        ['div'],
        ['span'],
      ];
      const template = [symbol, ...children];

      // when
      loader.define(id, ComponentWithChildren);
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, ComponentWithChildren);
      assert.equal(description.children.length, 2);
      assert(description.children[0].type, 'element');
      assert.equal(description.children[0].name, 'div');
      assert(description.children[1].type, 'element');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects component symbol with properties and child nodes', () => {

      // given
      class ComponentWithPropsAndChildren extends opr.Toolkit.Component {}
      const id = 'test/component-with-props-and-children';
      const symbol = Symbol.for(id);
      const props = {
        prop: 'prop',
      };
      const children = [
        ['div'],
        ['span'],
      ];
      const template = [symbol, props, ...children];

      // when
      loader.define(id, ComponentWithPropsAndChildren);
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, ComponentWithPropsAndChildren);
      assert.deepEqual(description.props, props);
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].name, 'div');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects component symbol with properties and filtered child nodes',
       () => {

         // given
         class ComponentWithPropsAndChildren extends opr.Toolkit.Component {}
         const id = 'test/component-with-props-and-some-children';
         const symbol = Symbol.for(id);
         const props = {
           prop: 'prop',
         };
         const children = [
           false,
           ['div'],
           null,
           ['span'],
           null,
         ];
         const template = [symbol, props, ...children];

         // when
         loader.define(id, ComponentWithPropsAndChildren);
         const description = Template.describe(template);

         // then
         assert.equal(description.type, 'component');
         assert.equal(description.component, ComponentWithPropsAndChildren);
         assert.deepEqual(description.props, props);
         assert.equal(description.children.length, 2);
         assert.equal(description.children[0].name, 'div');
         assert.equal(description.children[1].name, 'span');
       });

    it('detects component', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const template = [Component];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);
    });

    it('detects component with properties', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const props = {
        foo: 'bar',
      };
      const template = [Component, props];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);
      assert.deepEqual(description.props, props);
    });

    it('detects component with children', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const template = [
        Component,
        [
          'main',
        ],
        [
          'span',
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);
      assert(description.children);
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].name, 'main');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects component with properties and children', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const props = {
        listener: () => null,
      };
      const template = [
        Component,
        props,
        [
          'div',
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);
      assert.deepEqual(description.props, props);
      assert(description.children);
      assert.equal(description.children.length, 1);
      assert.equal(description.children[0].name, 'div');
    });

    it('detects pure component', () => {

      // given
      const renderFunction = props => ['section'];
      const template = [renderFunction];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component.name, 'PureComponent');
    });
  });

  describe('Element', () => {

    it('detects empty element', () => {

      // given
      const template = ['div'];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.equal(description.text, null);
      assert.equal(description.children, undefined);
    });

    it('detects empty element when all children are null and false', () => {

      // given
      const template = ['div', null, false, null];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.equal(description.text, null);
      assert.equal(description.children, undefined);
    });

    it('detects empty element with properties', () => {

      // given
      const props = {
        id: 'first-name',
        disabled: true,
      };
      const template = [
        'input',
        props,
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'input');
      assert.deepEqual(description.attrs, {
        id: 'first-name',
        disabled: '',
      });
    });

    it('detects text element', () => {

      // given
      const name = 'div';
      const text = 'text';
      const template = [name, text];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.equal(description.children[0].text, 'text');
    });

    it('allows text element with number value as content ', () => {

      // given
      const name = 'div';
      const number = 10;
      const template = [name, number];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.equal(description.children[0].text, '10');
    });

    it('allows text element with boolean true value as content', () => {

      // given
      const name = 'span';
      const template = [name, true];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'span');
      assert.equal(description.children[0].text, 'true');
    });

    it('detects text element with properties', () => {

      // given
      const name = 'div';
      const text = 'text';
      const props = {name: 'name'};
      const template = [name, props, text];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.deepEqual(description.attrs, props);
      assert.equal(description.children[0].text, 'text');
    });

    it('detects element with custom attributes', () => {

      // given
      const name = 'section';
      const props = {
        attrs: {
          custom: true,
        },
      };
      const template = [name, props];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'section');
      assert.deepEqual(description.custom.attrs, {
        custom: '',
      });
    });

    it('detects element with custom listeners', () => {

      // given
      const name = 'section';
      const myListener = () => {};
      const props = {
        on: {
          'my-event': myListener,
        },
      };
      const template = [name, props];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'section');
      assert.deepEqual(description.custom.listeners, props.on);
    });

    it('detects element with child nodes', () => {

      // given
      const name = 'div';
      const children = [
        ['div'],
        ['span'],
      ];
      const template = [name, ...children];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].name, 'div');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects element with filtered child nodes', () => {

      // given
      const name = 'div';
      const children = [
        ['div'],
        null,
        ['span'],
        null,
      ];
      const template = [name, ...children];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].name, 'div');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects element with properties and child nodes', () => {

      // given
      const name = 'div';
      const onClick = () => {};
      const props = {
        tabIndex: 10,
        onClick,
      };
      const children = [
        ['div'],
        ['span'],
      ];
      const template = [name, props, ...children];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.deepEqual(description.attrs, {
        tabIndex: '10',
      });
      assert.deepEqual(description.listeners, {
        onClick,
      });
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].name, 'div');
      assert.equal(description.children[1].name, 'span');
    });

    it('detects element with properties and filtered child nodes', () => {

      // given
      const name = 'div';
      const props = {
        id: 'id',
      };
      const children = [
        false,
        null,
        ['div'],
        ['span'],
        null,
      ];
      const template = [name, props, ...children];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'div');
      assert.deepEqual(description.attrs, props);
      assert.equal(description.children.length, 2);
      assert.equal(description.children[0].name, 'div');
      assert.equal(description.children[1].name, 'span');
    });
  });

  describe('=> nested', () => {

    class Component extends opr.Toolkit.Component {}
    class Subcomponent extends opr.Toolkit.Component {}

    it('accepts two-level Component / Component nesting', () => {

      // given
      const props = {
        key: 'value',
      };
      const template = [
        Component,
        props,
        [
          Subcomponent,
          props,
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);

      assert(description.children);
      assert.equal(description.children.length, 1);

      const subcomponentDescription = description.children[0];
      assert.equal(subcomponentDescription.type, 'component');
      assert.equal(subcomponentDescription.component, Subcomponent);

      assert(!subcomponentDescription.children);
    });

    it('accepts two-level Component / Element nesting', () => {

      // given
      const props = {
        tabIndex: '1',
      };
      const template = [
        Component,
        [
          'section',
          props,
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);

      assert(description.children);
      assert.equal(description.children.length, 1);

      const elementDescription = description.children[0];
      assert.equal(elementDescription.name, 'section');
      assert(!elementDescription.children);
    });

    it('accepts two-level Element / Component nesting', () => {

      // given
      const props = {
        foo: 'bar',
      };
      const template = [
        'main',
        [
          Component,
          props,
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'main');

      assert(description.children);
      assert.equal(description.children.length, 1);

      const componentDescription = description.children[0];
      assert.equal(componentDescription.component, Component);
      assert(!componentDescription.children);
    });

    it('accepts two-level Element / Element nesting', () => {

      // given
      const template = [
        'main',
        false,
        [
          'section',
          null,
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'element');
      assert.equal(description.name, 'main');

      assert(description.children);
      assert.equal(description.children.length, 1);

      const elementDescription = description.children[0];
      assert.equal(elementDescription.type, 'element');
      assert.equal(elementDescription.name, 'section');
      assert(!elementDescription.children);
    });

    it('accepts three-level Component / Element / Component nesting', () => {

      // given
      const props = {
        tabIndex: '1',
      };
      const template = [
        Component,
        [
          'section',
          props,
          [
            Subcomponent,
          ],
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.type, 'component');
      assert.equal(description.component, Component);

      assert(description.children);
      assert.equal(description.children.length, 1);

      const elementDescription = description.children[0];
      assert.equal(elementDescription.name, 'section');

      assert(elementDescription.children);
      assert.equal(elementDescription.children.length, 1);

      const subcomponentDescription = elementDescription.children[0];
      assert.equal(subcomponentDescription.component, Subcomponent);

      assert(!subcomponentDescription.children);
    });

    it('rejects invalid items on second-level template', () => {

      // given
      const props = {
        tabIndex: '1',
      };
      const element = [
        'section',
        props,
        undefined,
      ];
      const template = [
        Component,
        element,
      ];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid item', undefined, 'at index: 2, template:', element));
    });

    it('rejects invalid items on third-level template', () => {

      // given
      const node = [
        null,
      ];
      const template = [
        Component,
        [
          'div',
          node,
        ],
      ];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid node type:', null, '(null) at index: 0, template:', node));
    });
  });

  describe('=> valid', () => {

    it('accepts null as a template', () => {
      assert.equal(Template.describe(null), null);
      assert(!console.error.called);
    });

    it('accepts false as a template', () => {
      assert.equal(Template.describe(false), null);
      assert(!console.error.called);
    });
  });

  describe('=> invalid', () => {

    it('rejects empty array as a template', () => {
      assert.throws(() => Template.describe([]));
      assert(console.error.called);
    });

    it('rejects true as a template', () => {
      assert.throws(() => Template.describe(true));
      assert(console.error.called);
    });

    it('rejects undefined template', () => {
      assert.throws(() => Template.describe(undefined));
    });

    it('allows child nodes and text content', () => {

      // given
      const template = [
        'div',
        'Text',
        [
          'span',
          '1',
        ],
      ];

      // when
      const description = Template.describe(template);

      // then
      assert(description.children);
      assert.equal(description.children.length, 2);

      assert.equal(description.children[0].type, 'text');
      assert.equal(description.children[1].type, 'element');
    });

    it('allows child nodes and text content', () => {

      // given
      const template = [
        'div',
        {},
        ['span', '1'],
        'Text',
      ];

      // when
      const description = Template.describe(template);

      // then
      assert.equal(description.children[0].type, 'element');
      assert.equal(description.children[1].type, 'text');
    });

    it('allows component with text content', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const template = [
        Component,
        'valid',
      ];

      // when
      const description = Template.describe(template);

      // then
      assert(description.children);
      assert.equal(description.children.length, 1);
      assert.equal(description.children[0].type, 'text');
    });

    it('allows component with properties and text content', () => {

      // given
      class Component extends opr.Toolkit.Component {}
      const props = {
        prop: 'prop',
      };
      const template = [
        Component,
        props,
        'fine',
      ];

      // when
      const description = Template.describe(template);

      // then
      assert(description.children);
      assert.equal(description.children.length, 1);
      assert.equal(description.children[0].type, 'text');
    });

    it('rejects object as type', () => {

      // given
      const object = {};
      const template = [object];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid node type:', object,
          '(props) at index: 0, template:', template));
    });

    it('rejects number as type', () => {

      // given
      const number = 10;
      const template = [number];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid node type:', number,
          '(number) at index: 0, template:', template));
    });

    it('rejects null as type', () => {

      // given
      const template = [null];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid node type:', null,
          '(null) at index: 0, template:', template));
    });

    it('rejects boolean as type', () => {

      // given
      const template = [true];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid node type:', true,
          '(boolean) at index: 0, template:', template));
    });

    it('rejects undefined as type', () => {

      // given
      const template = [undefined];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid node type:', undefined,
          '(undefined) at index: 0, template:', template));
    });

    it('rejects function as item', () => {

      // given
      const fn = props => null;
      const template = ['span', fn];

      // when
      assert.throws(() => Template.describe(template));

      // then
      assert(console.error.called);
      assert(console.error.calledWith(
          'Invalid item', fn, 'at index: 1, template:', template));
    });
  });
});
