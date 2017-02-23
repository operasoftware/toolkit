global.Reactor = createCore();
const VirtualNode = Reactor.VirtualNode;
const ComponentTree = Reactor.ComponentTree;
const Document = Reactor.Document;

describe('Document', () => {

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');

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

  const createDummyInstance = def => {
    switch (def) {
      case Component:
        return new ComponentClass();
      case Subcomponent:
        return new SubcomponentClass();
    }
  };

  describe('=> create element', () => {

    it('supports empty elements', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'span'
      ]);

      // when
      const element = Document.createElement(node);

      // then
      assert(element instanceof Element);
      assert.equal(element.tagName, 'SPAN')
      assert.equal(element.textContent, undefined);
    });

    it('supports text elements', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'span', 'Text'
      ]);

      // when
      const element = Document.createElement(node);

      // then
      assert(element instanceof Element);
      assert.equal(element.tagName, 'SPAN')
      assert.equal(element.textContent, 'Text');
    });

    it('supports adding event listeners', () => {

      // given
      const onClick = () => {};
      const onChange = () => {};
      const node = ComponentTree.createFromTemplate([
        'span', {
          onClick,
          onChange
        }, 'Text'
      ]);

      // when
      const element = Document.createElement(node);

      // then
      assert(element instanceof Element);
      assert.equal(element.tagName, 'SPAN')
      assert.equal(element.textContent, 'Text');
      assert.deepEqual(element.eventListeners, {
        click: [onClick],
        change: [onChange],
      });
    });
  });

  describe('=> attach element tree', () => {

    beforeEach(() => {
      ComponentTree.createComponentInstance = createDummyInstance;
    });

    it('creates a single element', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'div'
      ]);

      // when
      const element = Document.attachElementTree(node);

      // then
      assert.equal(node.name, 'div');
      assert.equal(node.ref, element);
      assert.equal(element.tagName, 'DIV');
    });

    it('creates two nested elements', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'div', [
          'span'
        ]
      ]);

      // when
      const element = Document.attachElementTree(node);

      // then
      assert.equal(node.name, 'div');
      assert.equal(node.ref, element);
      assert.equal(element.tagName, 'DIV');

      const spanNode = node.children[0];
      const spanElement = element.childNodes[0];
      assert.equal(spanNode.name, 'span');
      assert.equal(spanNode.ref, spanElement);
      assert.equal(spanElement.tagName, 'SPAN');
    });

    it('creates three nested elements', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'div', [
          'span', [
            'a'
          ]
        ]
      ]);

      // when
      const element = Document.attachElementTree(node);

      // then
      assert.equal(node.name, 'div');
      assert.equal(node.ref, element);
      assert.equal(element.tagName, 'DIV');

      const spanNode = node.children[0];
      const spanElement = element.childNodes[0];
      assert.equal(spanNode.name, 'span');
      assert.equal(spanNode.ref, spanElement);
      assert.equal(spanElement.tagName, 'SPAN');

      const linkNode = spanNode.children[0];
      const linkElement = spanElement.childNodes[0];
      assert.equal(linkNode.name, 'a');
      assert.equal(linkNode.ref, linkElement);
      assert.equal(linkElement.tagName, 'A');
    });

    it('supports component present within the tree', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'div', [
          Component, [
            'span'
          ]
        ]
      ]);

      // when
      const element = Document.attachElementTree(node);

      // then
      assert.equal(node.name, 'div');
      assert.equal(node.ref, element);
      assert.equal(element.tagName, 'DIV');

      const componentNode = node.children[0];
      assert.equal(componentNode.constructor, ComponentClass);

      const spanNode = componentNode.child;
      const spanElement = element.childNodes[0];
      assert.equal(spanNode.name, 'span');
      assert.equal(spanNode.ref, spanElement);
      assert.equal(spanElement.tagName, 'SPAN');
    });

    it('supports nested components present within the tree', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'div', [
          Component, [
            Subcomponent, [
              'span'
            ]
          ]
        ]
      ]);

      // when
      const element = Document.attachElementTree(node);

      // then
      assert.equal(node.name, 'div');
      assert.equal(node.ref, element);
      assert.equal(element.tagName, 'DIV');

      const componentNode = node.children[0];
      assert.equal(componentNode.constructor, ComponentClass);
      assert(componentNode instanceof Reactor.Component);

      const subcomponentNode = componentNode.child;
      assert.equal(subcomponentNode.constructor, SubcomponentClass);

      const spanNode = subcomponentNode.child;
      const spanElement = element.childNodes[0];
      assert.equal(spanNode.name, 'span');
      assert.equal(spanNode.ref, spanElement);
      assert.equal(spanElement.tagName, 'SPAN');
    });

    it('supports component with no children', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'div', [
          Component, [
            'span', [
              Subcomponent
            ]
          ]
        ]
      ]);

      // when
      const element = Document.attachElementTree(node);

      // then
      assert.equal(node.name, 'div');
      assert.equal(node.ref, element);
      assert.equal(element.tagName, 'DIV');

      const componentNode = node.children[0];
      assert.equal(componentNode.constructor, ComponentClass);
      assert(componentNode.isComponent());

      const spanNode = componentNode.child;
      const spanElement = element.childNodes[0];
      assert.equal(spanNode.name, 'span');
      assert.equal(spanNode.ref, spanElement);
      assert.equal(spanElement.tagName, 'SPAN');

      const subcomponentNode = spanNode.children[0];
      assert.equal(subcomponentNode.constructor, SubcomponentClass);

      assert.equal(subcomponentNode.child, null);
    });

    describe('creates a comment node', () => {

      it('for a component with no child', () => {

        // given
        const node = ComponentTree.createFromTemplate([
          Component
        ]);

        // when
        const comment = Document.attachElementTree(node);

        // then
        assert(node.placeholder);
        assert.equal(node.placeholder.text, 'ComponentClass');
        assert.equal(node.placeholder.ref, comment);
      });

      it('for nested components with no child element', () => {

        // given
        const node = ComponentTree.createFromTemplate([
          Component, [
            Component, [
              Subcomponent
            ]
          ]
        ]);

        // when
        const comment = Document.attachElementTree(node);

        // then
        assert(node.placeholder);
        assert.equal(node.placeholder.text, 'SubcomponentClass');
        assert.equal(node.placeholder.ref, comment);
      });
    });
  });
});