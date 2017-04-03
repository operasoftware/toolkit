describe('Document', () => {

  const VirtualNode = opr.Toolkit.VirtualNode;
  const ComponentTree = opr.Toolkit.ComponentTree;
  const Document = opr.Toolkit.Document;

  const Component = Symbol.for('Component');
  const Subcomponent = Symbol.for('Subcomponent');

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

  const createDummyInstance = def => {
    switch (def) {
      case Component:
        return new ComponentClass();
      case Subcomponent:
        return new SubcomponentClass();
    }
  };

  describe('=> DOM operations', () => {

    it('sets an attribute', () => {

      // given
      const element = document.createElement('div');

      // when
      Document.setAttribute(element, 'name', 'value');

      // then
      assert.equal(element.getAttribute('name'), 'value');
      assert.equal(element.attributes.length, 1);
    });

    it('removes an attribute', () => {

      // given
      const element = document.createElement('span');
      const attr = document.createAttribute('value');
      attr.value = 'anything';
      // TODO: element.attributes.value = attr;
      element.attributes.setNamedItem(attr);

      // when
      Document.removeAttribute(element, 'value');

      // then
      assert.equal(element.getAttribute('value'), undefined);
      assert.equal(element.attributes.length, 0);
    });

    it('sets a data attribute', () => {

      // given
      const url = 'http://www.example.com';
      const element = document.createElement('a');

      // when
      Document.setDataAttribute(element, 'targetUrl', url);

      // then
      assert.equal(element.dataset.targetUrl, url);
      assert.equal(element.getAttribute('data-target-url'), url);
      assert.equal(element.attributes.length, 1);
    });

    it('removes a data attribute', () => {

      // given
      const url = 'http://www.example.com';
      const element = document.createElement('a');
      element.dataset.someUrl = url;

      // when
      Document.removeDataAttribute(element, 'someUrl');

      // then
      assert.equal(element.dataset.someUrl, undefined);
      assert.equal(element.getAttribute('data-some-url'), undefined);
      assert.equal(element.attributes.length, 0);
    });

    it('sets a style property', () => {

      // given
      const element = document.createElement('span');

      // when
      Document.setStyleProperty(element, 'backgroundColor', 'red');

      // then
      assert.equal(element.style.backgroundColor, 'red');
    });

    it('removes a style property', () => {

      // given
      const element = document.createElement('span');
      element.style.color = 'green';

      // when
      Document.removeStyleProperty(element, 'color');

      // then
      assert.equal(element.style.color, '');
    });

    it('adds a class name', () => {

      // given
      const element = document.createElement('section');

      // when
      Document.addClassName(element, 'some-name');

      // then
      assert.deepEqual(Array.from(element.classList), ['some-name']);
    });

    it('removes a class name', () => {

      // given
      const element = document.createElement('section');
      Document.addClassName(element, 'to-be-removed');

      // when
      Document.removeClassName(element, 'to-be-removed');

      // then
      assert.deepEqual(Array.from(element.classList), []);
    });

    it('adds an event listener', () => {

      // given
      const listener = () => {};
      const element = document.createElement('div');

      // when
      Document.addEventListener(element, 'click', listener);

      // then
      !(global.window) && assert.deepEqual(element.eventListeners_, {
        click: [listener],
      });
    });

    it('removes an event listener', () => {

      // given
      const listener = () => {};
      const element = document.createElement('div');
      Document.addEventListener(element, 'change', listener);

      // when
      Document.removeEventListener(element, 'change', listener);

      // then
      !(global.window) && assert.deepEqual(element.eventListeners_, {
        change: [],
      });
    });
  });

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
      // TODO: assert.equal(element.textContent, '');
      assert(!element.textContent);
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

    it('supports style attribute', () => {

      // given
      const node = ComponentTree.createFromTemplate([
        'span', {
          style: {
            color: 'red',
          }
        }
      ]);

      // when
      const element = Document.createElement(node);

      // then
      assert(element instanceof Element);
      assert.equal(element.tagName, 'SPAN')
      assert.equal(element.style.length, 1);
      assert.deepEqual(element.style.color, 'red');
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
      !(global.window) && assert.deepEqual(element.eventListeners_, {
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
      assert(componentNode instanceof opr.Toolkit.Component);

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
