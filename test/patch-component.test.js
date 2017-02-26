global.Reactor = createCore();
const Patch = Reactor.Patch;
const Document = Reactor.Document;
const ComponentTree = Reactor.ComponentTree;

describe('Patch component => apply', () => {

  let container;

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');

  const App = class extends Reactor.Root {
    constructor() {
      super(container);
    }
  };
  const ComponentClass = class extends Reactor.Component {
    render() {
      return this.children[0] || null;
    }
  };
  const SubcomponentClass = class extends Reactor.Component {
    render() {
      return this.children[0] || null;
    }
  };

  beforeEach(() => {
    container = document.createElement('app');
    ComponentTree.createComponentInstance = def => {
      switch (def) {
        case Component:
          return new ComponentClass();
        case Subcomponent:
          return new SubcomponentClass();
        default:
          throw new Error('Unknown definition: ' + def);
      }
    };
  });

  const createApp = template => {
    const app = new App();
    let node = null;
    if (template) {
      node = ComponentTree.createFromTemplate(template);
      Document.attachElementTree(node, domNode => {
        container.appendChild(domNode);
      });
      app.appendChild(node);
    }
    return [app, node];
  };

  it('updates component', () => {

    // given
    const component = new ComponentClass();
    const props = {
      foo: 'bar'
    };

    // when
    Patch.updateComponent(component, props).apply();

    // then
    assert.equal(component.props, props);
  });

  describe('add component', () => {

    it('adds empty component to a root', () => {

      // given
      const app = new App();

      const component = ComponentTree.createFromTemplate([
        Component
      ]);

      // when
      Patch.addComponent(component, app).apply();

      // then
      assert.equal(app.parentElement.ref, container);
      assert.equal(app.child, component);

      assert(component.placeholder);
      assert(component.placeholder.isComment());
      assert.equal(component.placeholder.text, 'ComponentClass');
      assert.equal(component.placeholder, component.comment);

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert.equal(comment.textContent, 'ComponentClass');
      assert.equal(comment.parentNode, container);

      assert(container.hasChildNodes());
      assert.equal(container.childNodes[0], comment);
    });

    it('adds empty component to a component', () => {

      // given
      const [app, divElement] = createApp([
        'div', [
          'span'
        ],
        [
          Component
        ],
        [
          'span'
        ]
      ]);

      assert(divElement.ref);

      const component = divElement.children[1];
      assert(component.isComponent());

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, divElement.ref);

      const placeholder = component.placeholder.ref;
      assert(placeholder);
      assert.equal(placeholder.textContent, 'ComponentClass');

      const subcomponent = ComponentTree.createFromTemplate([
        Subcomponent
      ]);

      // when
      Patch.addComponent(subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert.equal(subcomponent.parentNode, component);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder, subcomponent.placeholder);
      assert.equal(component.placeholder, subcomponent.comment);

      assert.equal(component.placeholder.text, 'SubcomponentClass');
      assert.equal(component.comment, null);

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert.equal(comment.textContent, 'SubcomponentClass');
      assert.equal(comment.parentNode, divElement.ref);

      assert.equal(divElement.ref.childNodes[1], comment);
    });

    it('adds empty component to a subcomponent', () => {

      // given
      const [app, divElement] = createApp([
        'div', [
          'span'
        ],
        [
          Component, [
            Subcomponent
          ]
        ],
        [
          'span'
        ]
      ]);

      assert(divElement.ref);

      const parentComponent = divElement.children[1].child;
      assert(parentComponent.isComponent());

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      const placeholder = parentComponent.placeholder.ref;
      assert(placeholder);
      assert.equal(placeholder.textContent, 'SubcomponentClass');

      const component = ComponentTree.createFromTemplate([
        Component
      ]);

      // when
      Patch.addComponent(component, parentComponent).apply();

      // then
      assert.equal(parentComponent.child, component);
      assert.equal(component.parentNode, parentComponent);

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      assert.equal(parentComponent.placeholder, component.placeholder);
      assert.equal(parentComponent.placeholder, component.comment);

      assert.equal(parentComponent.placeholder.text, 'ComponentClass');
      assert.equal(parentComponent.comment, null);

      const comment = parentComponent.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert.equal(comment.textContent, 'ComponentClass');
      assert.equal(comment.parentNode, divElement.ref);

      assert.equal(divElement.ref.childNodes[1], comment);
    });

    it('adds component with a child element to a root', () => {

      // given
      const app = new App();
      const component = ComponentTree.createFromTemplate([
        Component, [
          'span'
        ]
      ]);

      // when
      Patch.addComponent(component, app).apply();

      // then
      assert.equal(app.parentElement.ref, container);
      assert.equal(app.child, component);

      assert(component.child);
      assert(component.child.isElement());
      assert.equal(component.child.name, 'span');
      assert(component.child.ref);
      assert.equal(component.child.ref.tagName, 'SPAN');

      assert.equal(container.childNodes[0], component.child.ref);
    });

    it('adds component with a child element to a component', () => {

      // given
      const [app, divElement] = createApp([
        'div', [
          'span'
        ],
        [
          Component
        ],
        [
          'span'
        ]
      ]);

      assert(divElement.ref);

      const component = divElement.children[1];
      assert(component.isComponent());

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, divElement.ref);

      const placeholder = component.placeholder.ref;
      assert(placeholder);
      assert.equal(placeholder.textContent, 'ComponentClass');

      const subcomponent = ComponentTree.createFromTemplate([
        Subcomponent, [
          'a'
        ]
      ]);

      // when
      Patch.addComponent(subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert.equal(subcomponent.parentNode, component);

      assert.equal(component.placeholder, null);

      assert.equal(component.childElement, subcomponent.child);
      assert.equal(subcomponent.child.name, 'a');
      assert.equal(subcomponent.child.parentElement, divElement);

      assert.equal(component.childElement.ref.tagName, 'A');
      assert.equal(component.childElement.ref.parentNode, divElement.ref);
      assert.equal(divElement.ref.childNodes[1], subcomponent.child.ref);
    });

    it('adds component with a child element to a subcomponent', () => {

      // given
      const [app, divElement] = createApp([
        'div', [
          'span'
        ],
        [
          Component, [
            Subcomponent
          ]
        ],
        [
          'span'
        ]
      ]);

      assert(divElement.ref);

      const parentComponent = divElement.children[1].child;
      assert(parentComponent.isComponent());

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      const placeholder = parentComponent.placeholder.ref;
      assert(placeholder);
      assert.equal(placeholder.textContent, 'SubcomponentClass');

      const component = ComponentTree.createFromTemplate([
        Component, [
          'p'
        ]
      ]);

      // when
      Patch.addComponent(component, parentComponent).apply();

      // then
      assert.equal(parentComponent.child, component);
      assert.equal(component.parentNode, parentComponent);

      assert.equal(parentComponent.placeholder, null);

      assert.equal(parentComponent.childElement, component.child);
      assert.equal(component.child.name, 'p');
      assert.equal(component.child.parentElement, divElement);

      assert.equal(parentComponent.childElement.ref.tagName, 'P');
      assert.equal(parentComponent.childElement.ref.parentNode, divElement.ref);
      assert.equal(divElement.ref.childNodes[1], component.child.ref);
    });
  });

  describe('add element', () => {

    it('adds element to a root ', () => {

      // given
      const app = new App();
      const element = ComponentTree.createFromTemplate([
        'div', [
          'span'
        ]
      ]);

      // when
      Patch.addElement(element, app).apply();

      // then
      assert(app.parentElement);
      assert.equal(app.parentElement.ref, container);
      assert.equal(element.parentElement.ref, container);

      assert.equal(app.child, element);
      assert.equal(app.childElement, element);
      assert.equal(element.parentNode, app);
      assert.equal(app.childElement.ref.tagName, 'DIV');
    });

    it('adds element to a component ', () => {

      // given
      const [app, component] = createApp([
        Component
      ]);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert(component.parentElement);

      assert.equal(component.placeholder.ref.parentNode, container);

      assert(component.placeholder.ref);
      assert.equal(component.placeholder.ref.textContent, 'ComponentClass');

      const element = ComponentTree.createFromTemplate([
        'div', [
          'span'
        ]
      ]);

      // when
      Patch.addElement(element, component).apply();

      // then
      assert.equal(element.parentElement.ref, container);

      assert.equal(app.child, component);
      assert.equal(app.childElement, element);
      assert.equal(component.child, element);
      assert.equal(component.childElement, element);
      assert.equal(element.parentNode, component);
      assert.equal(component.childElement.ref.tagName, 'DIV');
    });

    it.skip('adds element to a subcomponent');

  });

  it('removes element', () => {

    // given
    const [parent, element] = createApp([
      'div', [
        'span'
      ]
    ]);

    // when
    Patch.removeElement(element, parent).apply();

    // then
    assert.equal(parent.parentElement.ref, container);
    assert.equal(parent.child, null);
    assert.equal(element.ref.parentNode, null);
  });

  it('removes component', () => {

    // given
    const [parent, component] = createApp([
      Component, [
        'span'
      ]
    ]);

    // when
    Patch.removeComponent(component, parent).apply();

    // then
    assert.equal(parent.parentElement.ref, container);
    assert.equal(parent.child, null);
    assert.equal(component.parentNode, null);
  });
});