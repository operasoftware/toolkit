describe('Patch component => apply', () => {

  const Patch = opr.Toolkit.Patch;
  const Document = opr.Toolkit.Document;
  const VirtualDOM = opr.Toolkit.VirtualDOM;

  let container;

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');

  const App = class extends opr.Toolkit.Root {
    constructor() {
      super(null, {}, {});
      this.container = container;
    }
  };
  const ComponentClass = class extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  };
  const SubcomponentClass = class extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  };

  beforeEach(() => {
    container = document.createElement('app');
    sinon.stub(VirtualDOM, 'getComponentClass').callsFake(symbol => {
      if (typeof symbol === 'string') {
        symbol = Symbol.for(symbol);
      }
      switch (symbol) {
        case Component:
          return ComponentClass;
        case Subcomponent:
          return SubcomponentClass;
        default:
          throw new Error('Unknown definition: ' + symbol);
      }
    });
  });

  afterEach(() => {
    VirtualDOM.getComponentClass.restore();
  });

  const createApp = template => {
    const app = new App();
    Patch.initRootComponent(app).apply();
    let node = null;
    if (template) {
      node = utils.createFromTemplate(template);
      if (node.isElement()) {
        Patch.addElement(node, app).apply();
      }
      if (node.isComponent()) {
        Patch.addComponent(node, app).apply();
      }
    }
    return [app, node];
  };

  it('creates root component', () => {

    // given
    const component = new App();

    // when
    Patch.initRootComponent(component).apply();

    // then
    assert.deepEqual(component.props, {});
    assert.equal(component.ref.nodeType, Node.COMMENT_NODE);
  });

  it('updates component', () => {

    // given
    const props = {
      foo: 'bar',
    };
    const component = new ComponentClass();
    component.props = props;

    // when
    const patch = Patch.updateComponent(component, props);
    patch.apply();

    // then
    assert.deepEqual(patch.prevProps, props);
  });

  describe('add component', () => {

    it('adds empty component to a root', () => {

      // given
      const [app] = createApp();

      const component = utils.createFromTemplate([Component]);

      // when
      Patch.addComponent(component, app).apply();

      // then
      assert.equal(app.container, container);
      assert.equal(app.child, component);

      assert(component.placeholder);
      assert(component.placeholder.isComment());
      assert(component.placeholder.text.includes('ComponentClass'));
      assert.equal(component.placeholder, component.comment);

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes('ComponentClass'));

      assert(container.hasChildNodes());
      assert.equal(container.firstChild, comment);
    });

    it('adds empty component to emptied root', () => {

      // given
      const [app, subcomponent] = createApp([Subcomponent]);
      Patch.removeComponent(subcomponent, app).apply();
      const component = utils.createFromTemplate([Component]);

      // then
      assert(app.comment);
      assert(app.comment.isComment());
      assert.equal(app.placeholder, app.comment);
      assert(app.placeholder.text.includes('App'));

      assert.equal(container.firstChild, app.comment.ref);

      // when
      Patch.addComponent(component, app).apply();

      // then
      assert.equal(app.container, container);
      assert.equal(app.child, component);
      assert(component.placeholder);
      assert(component.placeholder.isComment());
      assert(component.placeholder.text.includes('ComponentClass'));
      assert.equal(component.placeholder, component.comment);

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes('ComponentClass'));
      assert.equal(comment.parentNode, container);

      assert(container.hasChildNodes());
      assert.equal(container.firstChild, comment);
    });

    it('adds empty component to a component', () => {

      // given
      const [app, divElement] = createApp([
        'div',
        [
          'span',
        ],
        [
          Component,
        ],
        [
          'span',
        ],
      ]);

      // then
      assert(divElement.ref);

      const component = divElement.children[1];
      assert(component.isComponent());

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, divElement.ref);

      const placeholder = component.placeholder.ref;
      assert(placeholder);
      assert(placeholder.textContent.includes('ComponentClass'));

      const subcomponent = utils.createFromTemplate([Subcomponent]);

      // when
      Patch.addComponent(subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert.equal(subcomponent.parentNode, component);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder, subcomponent.placeholder);
      assert.equal(component.placeholder, subcomponent.comment);

      assert(component.placeholder.text.includes('SubcomponentClass'));
      assert.equal(component.comment, null);

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes('SubcomponentClass'));
      assert.equal(comment.parentNode, divElement.ref);

      assert.equal(divElement.ref.childNodes[1], comment);
    });

    it('adds empty component to a subcomponent', () => {

      // given
      const [app, divElement] = createApp([
        'div',
        [
          'span',
        ],
        [
          Component,
          [
            Subcomponent,
          ],
        ],
        [
          'span',
        ],
      ]);

      assert(divElement.ref);

      const parentComponent = divElement.children[1].child;
      assert(parentComponent.isComponent());

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      const placeholder = parentComponent.placeholder.ref;
      assert(placeholder);
      assert(placeholder.textContent.includes('SubcomponentClass'));

      const component = utils.createFromTemplate([Component]);

      // when
      Patch.addComponent(component, parentComponent).apply();

      // then
      assert.equal(parentComponent.child, component);
      assert.equal(component.parentNode, parentComponent);

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      assert.equal(parentComponent.placeholder, component.placeholder);
      assert.equal(parentComponent.placeholder, component.comment);

      assert(parentComponent.placeholder.text.includes('ComponentClass'));
      assert.equal(parentComponent.comment, null);

      const comment = parentComponent.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes('ComponentClass'));
      assert.equal(comment.parentNode, divElement.ref);

      assert.equal(divElement.ref.childNodes[1], comment);
    });

    it('adds component with a child element to a root', () => {

      // given
      const [app] = createApp();
      const component = utils.createFromTemplate([
        Component,
        [
          'span',
        ],
      ]);

      // when
      Patch.addComponent(component, app).apply();

      // then
      assert.equal(app.container, container);
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
        'div',
        [
          'span',
        ],
        [
          Component,
        ],
        [
          'span',
        ],
      ]);

      assert(divElement.ref);

      const component = divElement.children[1];
      assert(component.isComponent());

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, divElement.ref);

      const placeholder = component.placeholder.ref;
      assert(placeholder);
      assert(placeholder.textContent.includes('ComponentClass'));

      const subcomponent = utils.createFromTemplate([
        Subcomponent,
        [
          'a',
        ],
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
        'div',
        [
          'span',
        ],
        [
          Component,
          [
            Subcomponent,
          ],
        ],
        [
          'span',
        ],
      ]);

      assert(divElement.ref);

      const parentComponent = divElement.children[1].child;
      assert(parentComponent.isComponent());

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      const placeholder = parentComponent.placeholder.ref;
      assert(placeholder);
      assert(placeholder.textContent.includes('SubcomponentClass'));

      const component = utils.createFromTemplate([
        Component,
        [
          'p',
        ],
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

    it('adds element to the root ', () => {

      // given
      const [app] = createApp();
      const element = utils.createFromTemplate([
        'div',
        [
          'span',
        ],
      ]);

      // when
      Patch.addElement(element, app).apply();

      // then
      assert.equal(app.container, container);
      assert.equal(element.container, container);

      assert.equal(app.child, element);
      assert.equal(app.childElement, element);
      assert.equal(element.parentNode, app);
      assert.equal(app.childElement.ref.tagName, 'DIV');
    });

    it('adds element to a component ', () => {

      // given
      const [app, component] = createApp([Component]);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, container);

      assert(component.placeholder.ref);
      assert(component.placeholder.ref.textContent.includes('ComponentClass'));

      const element = utils.createFromTemplate([
        'div',
        [
          'span',
        ],
      ]);

      // when
      Patch.addElement(element, component).apply();

      // then
      assert.equal(app.child, component);
      assert.equal(app.childElement, element);
      assert.equal(component.child, element);
      assert.equal(component.childElement, element);
      assert.equal(element.parentNode, component);
      assert.equal(component.childElement.ref.tagName, 'DIV');
    });

    it('adds element to a subcomponent', () => {

      // given
      const [app, component] = createApp([Component, [Subcomponent]]);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, container);

      const subcomponent = component.child;

      assert(subcomponent.comment);

      assert(component.placeholder.ref);
      assert(
          component.placeholder.ref.textContent.includes('SubcomponentClass'));

      const element = utils.createFromTemplate([
        'div',
        [
          'span',
        ],
      ]);

      // when
      Patch.addElement(element, subcomponent).apply();

      // then
      assert.equal(element.container, container);

      assert.equal(app.child, component);
      assert.equal(app.childElement, element);
      assert.equal(component.childElement, element);
      assert.equal(subcomponent.child, element);
      assert.equal(subcomponent.childElement, element);
      assert.equal(element.parentNode, subcomponent);
      assert.equal(component.childElement.ref.tagName, 'DIV');
    });
  });

  describe('remove element', () => {

    it('removes element from root', () => {

      // given
      const [app, element] = createApp([
        'div',
      ]);

      // then
      assert.equal(element.container, container);

      const domElement = element.ref;
      assert.equal(domElement.parentElement, container);
      assert.equal(container.firstChild, domElement);

      // when
      Patch.removeElement(element, app).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('App'));

      assert.equal(app.child, null);

      assert.equal(element.parentNode, null);
      assert.equal(element.ref.parentNode, null);
      assert.equal(element.parentElement, null);
      assert.equal(element.ref.parentElement, null);
    });

    it('removes element from component', () => {

      // given
      const [app, component] = createApp([
        Component,
        [
          'div',
        ],
      ]);
      const element = component.child;

      // then
      assert.equal(element.container, container);
      const domElement = element.ref;
      assert.equal(domElement.parentElement, container);
      assert.equal(container.firstChild, domElement);

      // when
      Patch.removeElement(element, component).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('ComponentClass'));

      assert.equal(component.child, null);

      assert.equal(element.parentNode, null);
      assert.equal(element.ref.parentNode, null);
      assert.equal(element.parentElement, null);
      assert.equal(element.ref.parentElement, null);
    });

    it('removes element from subcomponent', () => {

      // given
      const [app, component] = createApp([
        Component,
        [
          Subcomponent,
          [
            'div',
          ],
        ],
      ]);
      const subcomponent = component.child;
      const element = subcomponent.child;

      // then
      assert.equal(element.container, container);
      const domElement = element.ref;
      assert.equal(domElement.parentElement, container);
      assert.equal(container.firstChild, domElement);

      // when
      Patch.removeElement(element, subcomponent).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('SubcomponentClass'));

      assert.equal(subcomponent.child, null);

      assert.equal(element.parentNode, null);
      assert.equal(element.ref.parentNode, null);
      assert.equal(element.parentElement, null);
      assert.equal(element.ref.parentElement, null);
    });
  });

  describe('remove component', () => {

    it('removes empty component from root', () => {

      // given
      const [app, component] = createApp([Component]);

      // then
      assert.equal(component.container, container);
      assert.equal(container.firstChild, app.placeholder.ref);
      assert(app.placeholder.text.includes('ComponentClass'));

      // when
      Patch.removeComponent(component, app).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('App'));

      assert.equal(app.child, null);
      assert.equal(component.parentNode, null);

      assert(app.placeholder.ref);
    });

    it('removes component with child element from root', () => {

      // given
      const [app, component] = createApp([
        Component,
        [
          'div',
        ],
      ]);
      const element = component.child;

      // then
      assert.equal(component.container, container);
      assert.equal(container.firstChild, element.ref);

      // when
      Patch.removeComponent(component, app).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('App'));

      assert.equal(app.child, null);
      assert.equal(component.parentNode, null);

      assert(app.placeholder.ref);
    });

    it('removes empty component from parent component', () => {

      // given
      const [app, component] = createApp([Component, [Subcomponent]]);
      const subcomponent = component.child;

      // then
      assert.equal(component.container, container);
      assert.equal(container.firstChild, app.placeholder.ref);
      assert(app.placeholder.text.includes('SubcomponentClass'));

      // when
      Patch.removeComponent(subcomponent, component).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('ComponentClass'));

      assert.equal(component.child, null);
      assert.equal(subcomponent.parentNode, null);

      assert(app.placeholder.ref);
    });

    it('removes component with child element from component', () => {

      // given
      const [app, component] = createApp([
        Component,
        [
          Subcomponent,
          [
            'div',
          ],
        ],
      ]);
      const subcomponent = component.child;
      const element = subcomponent.child;

      // then
      assert.equal(component.container, container);
      assert.equal(container.firstChild, element.ref);

      // when
      Patch.removeComponent(subcomponent, component).apply();

      // then
      assert(app.placeholder);
      assert(app.placeholder.isComment());
      assert(app.placeholder.text.includes('ComponentClass'));

      assert.equal(component.child, null);
      assert.equal(subcomponent.parentNode, null);

      assert(app.placeholder.ref);
    });
  });

  describe('replace child', () => {

    it('replaces element with component', () => {

      // given
      const component = utils.createFromTemplate([
        Component,
        [
          'p',
        ],
      ]);

      const subcomponent = utils.createFromTemplate([
        Subcomponent,
      ]);

      // when
      Patch.replaceChild(component.child, subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert(component.child.ref.textContent.includes('SubcomponentClass'));
    });

    it('replaces element with element', () => {

      // given
      const component = utils.createFromTemplate([
        Component,
        [
          'p',
        ],
      ]);

      const span = utils.createFromTemplate([
        'span',
      ]);

      // when
      Patch.replaceChild(component.child, span, component).apply();

      // then
      assert.equal(component.child, span);
      assert.equal(component.child.ref.tagName, 'SPAN');
    });

    it('replaces component with component', () => {

      // given
      const component = utils.createFromTemplate([
        Component,
        [
          Component,
        ],
      ]);

      const subcomponent = utils.createFromTemplate([
        Subcomponent,
      ]);

      // when
      Patch.replaceChild(component.child, subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert(component.child.ref.textContent.includes('SubcomponentClass'));
    });

    it('replaces component with element', () => {

      // given
      const component = utils.createFromTemplate([
        Component,
        [
          Component,
        ],
      ]);

      const div = utils.createFromTemplate([
        'div',
      ]);

      // when
      Patch.replaceChild(component.child, div, component).apply();

      // then
      assert.equal(component.child, div);
      assert.equal(component.child.ref.tagName, 'DIV');
    });
  });
});
