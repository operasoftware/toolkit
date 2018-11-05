describe('Patch component => apply', () => {

  const {
    Description,
    Patch,
    Template,
    VirtualDOM,
  } = opr.Toolkit;

  let container;

  class Root extends opr.Toolkit.Root {
    render() {
      return this.children[0] || null;
    }
  }
  const Component = class extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  };
  const Subcomponent = class extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  };

  const createRootWith = template => {
    const root = VirtualDOM.createRoot(Root);
    container = document.createElement('main');
    root.container = container;
    Patch.initRootComponent(root).apply();
    let node = null;
    if (template) {
      node = createFromTemplate(template, root);
      Patch.replaceChild(root.child, node, root).apply();
    }
    return [root, node];
  };

  const createComment = component => {
    const description = new Description.CommentDescription(
        component.constructor.name);
    return VirtualDOM.createFromDescription(description, component);
  };

  it('creates root component', () => {

    // given
    const root = VirtualDOM.createRoot(Root);
    const container = document.createElement('section');
    root.container = container;

    // when
    Patch.initRootComponent(root).apply();

    // then
    assert.equal(root.ref.nodeType, Node.COMMENT_NODE);
  });

  it('updates component', () => {

    // given
    const props = {
      foo: 'bar',
    };
    const component = createFromTemplate([
      Component,
      props,
    ]);

    // when
    const description = Template.describe([
      Component,
      {
        foo: 'foo',
      },
    ]);

    Patch.updateNode(component, description).apply();

    // then
    assert.deepEqual(component.description.props, description.props);
  });

  describe('add component', () => {

    it('adds empty component to a root', () => {

      // given
      const [root] = createRootWith(null);

      const component = createFromTemplate([Component], root);

      // when
      Patch.replaceChild(root.child, component, root).apply();

      // then
      assert.equal(root.container, container);
      assert.equal(root.child, component);

      assert(component.placeholder);
      assert(component.placeholder.isComment());
      assert(component.placeholder.description.text.includes(Component.name));

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes(Component.name));

      assert(container.hasChildNodes());
      assert.equal(container.firstChild, comment);
    });

    it('adds empty component to emptied root', () => {

      // given
      const [root] = createRootWith([Subcomponent]);
      const commentNode = createComment(root);
      Patch.replaceChild(root.child, commentNode, root).apply();
      const component = createFromTemplate([Component], root);

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes(Root.name));

      assert.equal(container.firstChild, root.placeholder.ref);

      // when
      Patch.replaceChild(root.child, component, root).apply();

      // then
      assert.equal(root.container, container);
      assert.equal(root.child, component);
      assert(component.placeholder);
      assert(component.placeholder.isComment());
      assert(component.placeholder.description.text.includes('Component'));

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes('Component'));
      assert.equal(comment.parentNode, container);

      assert(container.hasChildNodes());
      assert.equal(container.firstChild, comment);
    });

    it('adds empty component to a component', () => {

      // given
      const [, divElement] = createRootWith([
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
      assert(placeholder.textContent.includes(Component.name));

      const subcomponent = createFromTemplate([Subcomponent], component);

      // when
      Patch.replaceChild(component.child, subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert.equal(subcomponent.parentNode, component);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder, subcomponent.placeholder);
      assert(
          component.placeholder.description.text.includes(Subcomponent.name));

      const comment = component.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes(Subcomponent.name));
      assert.equal(comment.parentNode, divElement.ref);

      assert.equal(divElement.ref.childNodes[1], comment);
    });

    it('adds empty component to a subcomponent', () => {

      // given
      const [, divElement] = createRootWith([
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
      assert(placeholder.textContent.includes(Subcomponent.name));

      const component = createFromTemplate([Component], parentComponent);

      // when
      Patch.replaceChild(parentComponent.child, component, parentComponent)
          .apply();

      // then
      assert.equal(parentComponent.child, component);
      assert.equal(component.parentNode, parentComponent);

      assert(parentComponent.placeholder);
      assert(parentComponent.placeholder.isComment());

      assert.equal(parentComponent.placeholder, component.placeholder);
      assert(parentComponent.placeholder.description.text.includes(
          Component.name));

      const comment = parentComponent.placeholder.ref;

      assert(comment);
      assert(comment instanceof Comment);
      assert(comment.textContent.includes(Component.name));
      assert.equal(comment.parentNode, divElement.ref);

      assert.equal(divElement.ref.childNodes[1], comment);
    });

    it('adds component with a child element to a root', () => {

      // given
      const [root] = createRootWith();
      const component = createFromTemplate([
        Component,
        [
          'span',
        ],
      ], root);

      // when
      Patch.replaceChild(root.child, component, root).apply();

      // then
      assert.equal(root.container, container);
      assert.equal(root.child, component);
      assert(component.child);
      assert(component.child.isElement());
      assert.equal(component.child.description.name, 'span'); // Mr. Minimum
      assert(component.child.ref);
      assert.equal(component.child.ref.tagName, 'SPAN');

      assert.equal(container.childNodes[0], component.child.ref);
    });

    it('adds component with a child element to a component', () => {

      // given
      const [, divElement] = createRootWith([
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
      assert(placeholder.textContent.includes('Component'));

      const subcomponent = createFromTemplate([
        Subcomponent,
        [
          'a',
        ],
      ], component);

      // when
      Patch.replaceChild(component.child, subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert.equal(subcomponent.parentNode, component);

      assert.equal(component.placeholder, null);

      assert.equal(component.childElement, subcomponent.child);
      assert.equal(subcomponent.child.description.name, 'a');
      assert.equal(subcomponent.child.parentElement, divElement);

      assert.equal(component.childElement.ref.tagName, 'A');
      assert.equal(component.childElement.ref.parentNode, divElement.ref);
      assert.equal(divElement.ref.childNodes[1], subcomponent.child.ref);
    });

    it('adds component with a child element to a subcomponent', () => {

      // given
      const [, divElement] = createRootWith([
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
      assert(placeholder.textContent.includes('Subcomponent'));

      const component = createFromTemplate([
        Component,
        [
          'p',
        ],
      ], parentComponent);

      // when
      Patch.replaceChild(
          parentComponent.placeholder, component, parentComponent).apply();

      // then
      assert.equal(parentComponent.child, component);
      assert.equal(component.parentNode, parentComponent);

      assert.equal(parentComponent.placeholder, null);

      assert.equal(parentComponent.childElement, component.child);
      assert.equal(component.child.description.name, 'p');
      assert.equal(component.child.parentElement, divElement);

      assert.equal(parentComponent.childElement.ref.tagName, 'P');
      assert.equal(parentComponent.childElement.ref.parentNode, divElement.ref);
      assert.equal(divElement.ref.childNodes[1], component.child.ref);
    });
  });

  describe('add element', () => {

    it('adds element to the root ', () => {

      // given
      const [root] = createRootWith();
      const element = createFromTemplate([
        'div',
        [
          'span',
        ],
      ], root);

      // when
      Patch.replaceChild(root.child, element, root).apply();

      // then
      assert.equal(root.container, container);
      assert.equal(element.container, container);

      assert.equal(root.child, element);
      assert.equal(root.childElement, element);
      assert.equal(element.parentNode, root);
      assert.equal(root.childElement.ref.tagName, 'DIV');
    });

    it('adds element to a component ', () => {

      // given
      const [root, component] = createRootWith([Component]);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, container);

      assert(component.placeholder.ref);
      assert(component.placeholder.ref.textContent.includes('Component'));

      const element = createFromTemplate([
        'div',
        [
          'span',
        ],
      ], component);

      // when
      Patch.replaceChild(component.child, element, component).apply();

      // then
      assert.equal(root.child, component);
      assert.equal(root.childElement, element);
      assert.equal(component.child, element);
      assert.equal(component.childElement, element);
      assert.equal(element.parentNode, component);
      assert.equal(component.childElement.ref.tagName, 'DIV');
    });

    it('adds element to a subcomponent', () => {

      // given
      const [root, component] = createRootWith([Component, [Subcomponent]]);

      assert(component.placeholder);
      assert(component.placeholder.isComment());

      assert.equal(component.placeholder.ref.parentNode, container);

      const subcomponent = component.child;

      assert(component.placeholder.ref);
      assert(
          component.placeholder.ref.textContent.includes('Subcomponent'));

      const element = createFromTemplate([
        'div',
        [
          'span',
        ],
      ], subcomponent);

      // when
      Patch.replaceChild(subcomponent.child, element, subcomponent).apply();

      // then
      assert.equal(element.container, container);

      assert.equal(root.child, component);
      assert.equal(root.childElement, element);
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
      const [root, element] = createRootWith([
        'div',
      ]);

      // then
      assert.equal(element.container, container);

      const domElement = element.ref;
      assert.equal(domElement.parentElement, container);
      assert.equal(container.firstChild, domElement);

      // when
      const placeholder = createComment(root);
      Patch.replaceChild(element, placeholder, root).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes(Root.name));

      assert.equal(root.child, placeholder);

      assert.equal(element.parentNode, null);
      assert.equal(element.ref.parentNode, null);
      assert.equal(element.parentElement, null);
      assert.equal(element.ref.parentElement, null);
    });

    it('removes element from component', () => {

      // given
      const [root, component] = createRootWith([
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
      const placeholder = createComment(component);
      Patch.replaceChild(element, placeholder, component).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes('Component'));

      assert.equal(component.child, placeholder);

      assert.equal(element.parentNode, null);
      assert.equal(element.ref.parentNode, null);
      assert.equal(element.parentElement, null);
      assert.equal(element.ref.parentElement, null);
    });

    it('removes element from subcomponent', () => {

      // given
      const [root, component] = createRootWith([
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
      const placeholder = createComment(subcomponent);
      Patch.replaceChild(element, placeholder, subcomponent).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes('Subcomponent'));

      assert.equal(subcomponent.child, placeholder);

      assert.equal(element.parentNode, null);
      assert.equal(element.ref.parentNode, null);
      assert.equal(element.parentElement, null);
      assert.equal(element.ref.parentElement, null);
    });
  });

  describe('remove component', () => {

    it('removes empty component from root', () => {

      // given
      const [root, component] = createRootWith([Component]);

      // then
      assert.equal(component.container, container);
      assert.equal(container.firstChild, root.placeholder.ref);
      assert(root.placeholder.description.text.includes(Component.name));

      // when
      const placeholder = createComment(root);
      Patch.replaceChild(component, placeholder, root).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes(Root.name));

      assert.equal(root.placeholder, placeholder);
      assert.equal(root.child, placeholder);
      assert.equal(component.parentNode, null);

      assert(root.placeholder.ref);
    });

    it('removes component with child element from root', () => {

      // given
      const [root, component] = createRootWith([
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
      const placeholder = createComment(root);
      Patch.replaceChild(component, placeholder, root).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes(Root.name));

      assert.equal(root.placeholder, placeholder);
      assert.equal(root.child, placeholder);
      assert.equal(component.parentNode, null);

      assert(root.placeholder.ref);
    });

    it('removes empty component from parent component', () => {

      // given
      const [root, component] = createRootWith([Component, [Subcomponent]]);
      const subcomponent = component.child;

      // then
      assert.equal(component.container, container);
      assert.equal(container.firstChild, root.placeholder.ref);
      assert(root.placeholder.description.text.includes('Subcomponent'));

      // when
      const placeholder = createComment(component);
      Patch.replaceChild(subcomponent, placeholder, component).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes('Component'));

      assert.equal(component.placeholder, placeholder);
      assert.equal(component.child, placeholder);
      assert.equal(subcomponent.parentNode, null);

      assert(root.placeholder.ref);
    });

    it('removes component with child element from component', () => {

      // given
      const [root, component] = createRootWith([
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
      const placeholder = createComment(component);
      Patch.replaceChild(subcomponent, placeholder, component).apply();

      // then
      assert(root.placeholder);
      assert(root.placeholder.isComment());
      assert(root.placeholder.description.text.includes('Component'));

      assert.equal(component.placeholder, placeholder);
      assert.equal(component.child, placeholder);
      assert.equal(subcomponent.parentNode, null);

      assert(root.placeholder.ref);
    });
  });

  describe('replace child', () => {

    it('replaces element with component', () => {

      // given
      const component = createFromTemplate([
        Component,
        [
          'p',
        ],
      ]);

      const subcomponent = createFromTemplate([
        Subcomponent,
      ], component);

      // when
      Patch.replaceChild(component.child, subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert(component.child.ref.textContent.includes('Subcomponent'));
    });

    it('replaces element with element', () => {

      // given
      const component = createFromTemplate([
        Component,
        [
          'p',
        ],
      ]);

      const span = createFromTemplate([
        'span',
      ], component);

      // when
      Patch.replaceChild(component.child, span, component).apply();

      // then
      assert.equal(component.child, span);
      assert.equal(component.child.ref.tagName, 'SPAN');
    });

    it('replaces component with component', () => {

      // given
      const component = createFromTemplate([
        Component,
        [
          Component,
        ],
      ]);

      const subcomponent = createFromTemplate([
        Subcomponent,
      ], component);

      // when
      Patch.replaceChild(component.child, subcomponent, component).apply();

      // then
      assert.equal(component.child, subcomponent);
      assert(component.child.ref.textContent.includes('Subcomponent'));
    });

    it('replaces component with element', () => {

      // given
      const component = createFromTemplate([
        Component,
        [
          Component,
        ],
      ]);

      const div = createFromTemplate([
        'div',
      ], component);

      // when
      Patch.replaceChild(component.child, div, component).apply();

      // then
      assert.equal(component.child, div);
      assert.equal(component.child.ref.tagName, 'DIV');
    });
  });
});
