describe('Virtual Element => Attach DOM', () => {

  const {
    Template,
    VirtualDOM,
    VirtualElement,
    VirtualNode,
  } = opr.Toolkit;

  class Root extends opr.Toolkit.Root {
    render() {
      return null;
    }
  }

  class Component extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  };
  class Subcomponent extends opr.Toolkit.Component {
    render() {
      return this.children[0] || null;
    }
  };

  const createElement = (name, props = {}, content = []) => {
    const template = typeof content === 'string' ? [name, props, content] : [name, props, ...content];
    const description = Template.describe(template);
    const root = VirtualDOM.createRoot(Root);
    const element = VirtualDOM.createFromDescription(description, root);
    root.appendChild(element);
    return element;
  };

  describe('=> DOM operations', () => {

    it('sets text content', () => {

      // given
      const element = createElement('div');

      // when
      element.setTextContent('text content');

      // then
      assert.equal(element.description.text, 'text content');
      assert.equal(element.ref.textContent, 'text content');
    });

    it('adds an event listener', () => {

      // given
      const listener = () => {};
      const element = createElement('div');

      // when
      element.addListener('onClick', listener);

      // then
      assert.equal(element.description.listeners.onClick, listener);
      typeof window !== 'object' && assert.deepEqual(element.ref.eventListeners_, {
        click: [listener],
      });
    });

    it('removes an event listener', () => {

      // given
      const listener = () => {};
      const element = createElement('div', {
        onChange: listener,
      });

      assert.equal(element.description.listeners.onChange, listener);
      typeof window !== 'object' && assert.deepEqual(element.ref.eventListeners_, {
        change: [listener],
      });

      // when
      element.removeListener('onChange', listener);

      // then
      assert.equal(element.description.listeners, undefined);
      typeof window !== 'object' && assert.deepEqual(element.ref.eventListeners_, {
        change: [],
      });
    });

    it('sets a lowercase attribute', () => {

      // given
      const element = createElement('div');

      // when
      element.setAttribute('tabIndex', 10);

      // then
      assert.equal(element.description.attrs.tabIndex, 10);
      assert.equal(element.ref.getAttribute('tabindex'), '10');
      assert.equal(element.ref.attributes.length, 1);
    });

    it('sets a dash-separated attribute', () => {

      // given
      const element = createElement('div');

      // when
      element.setAttribute('acceptCharset', 'UTF8');

      // then
      assert.equal(element.description.attrs.acceptCharset, 'UTF8');
      assert.equal(element.ref.getAttribute('accept-charset'), 'UTF8');
      assert.equal(element.ref.attributes.length, 1);
    });

    it('removes an attribute', () => {

      // given
      const value = 'anything';
      const element = createElement('span', {
        value,
      });

      assert.equal(element.description.attrs.value, value);
      assert.equal(element.ref.attributes.length, 1);
      assert.equal(element.ref.getAttribute('value'), value);

      // when
      element.removeAttribute('value');

      // then
      assert.equal(element.description.attrs, undefined);
      assert.equal(element.ref.attributes.length, 0);
      assert.equal(element.ref.getAttribute('value'), null);
    });

    it('sets a data attribute', () => {

      // given
      const url = 'http://www.example.com';
      const element = createElement('a');

      // when
      element.setDataAttribute('targetUrl', url);

      // then
      assert.equal(element.description.dataset.targetUrl, url);
      assert.equal(element.ref.dataset.targetUrl, url);
      assert.equal(element.ref.getAttribute('data-target-url'), url);
      assert.equal(element.ref.attributes.length, 1);
    });

    it('removes a data attribute', () => {

      // given
      const someUrl = 'http://www.example.com';
      const element = createElement('a', {
        dataset: {
          someUrl,
        },
      });

      assert.equal(element.description.dataset.someUrl, someUrl);
      assert.equal(element.ref.dataset.someUrl, someUrl);
      assert.equal(element.ref.getAttribute('data-some-url'), someUrl);
      assert.equal(element.ref.attributes.length, 1);

      // when
      element.removeDataAttribute('someUrl');

      // then
      assert.equal(element.description.dataset, undefined);
      assert.equal(element.ref.dataset.someUrl, null);
      assert.equal(element.ref.getAttribute('data-some-url'), undefined);
      assert.equal(element.ref.attributes.length, 0);
    });

    it('sets a class name', () => {

      // given
      const element = createElement('section');

      // when
      element.setClassName('some-name');

      // then
      assert.equal(element.description.class, 'some-name');
      assert.deepEqual([...element.ref.classList], ['some-name']);
    });

    it('removes a class name', () => {

      // given
      const element = createElement('section', {
        class: ['to-be-removed'],
      });

      assert.equal(element.description.class, 'to-be-removed');
      assert.deepEqual([...element.ref.classList], ['to-be-removed']);

      // when
      element.setClassName('');

      // then
      assert.deepEqual(element.description.class, '');
      assert.deepEqual([...element.ref.classList], []);
    });

    it('sets a style property', () => {

      // given
      const element = createElement('span');

      // when
      element.setStyleProperty('backgroundColor', 'red');

      // then
      assert.equal(element.description.style.backgroundColor, 'red');
      assert.equal(element.ref.style.backgroundColor, 'red');
      assert.equal(element.ref.style['background-color'], 'red');
    });

    it('removes a style property', () => {

      // given
      const color = 'green';
      const element = createElement('span', {
        style: {
          color,
        },
      });

      assert.equal(element.description.style.color, 'green');
      assert.equal(element.ref.style.color, 'green');

      // when
      element.removeStyleProperty('color');

      // then
      assert.equal(element.description.style, undefined);
      assert.equal(element.ref.style.color, '');
    });

    it('sets property', () => {

      // given
      const element = createElement('div');

      // when
      element.setProperty('key', 'value');

      // then
      assert.equal(element.description.properties.key, 'value');
      assert.equal(element.ref.key, 'value');
    });

    it('deletes property', () => {

      // given
      const element = createElement('div', {
        properties: {
          key: 'some-key',
        },
      });

      assert.equal(element.description.properties.key, 'some-key');
      assert.equal(element.ref.key, 'some-key');

      // when
      element.deleteProperty('key');

      // then
      assert.equal(element.description.properties, undefined);
      assert.equal(element.ref.key, undefined);
    });
  });

  describe('=> create element', () => {

    it('supports empty elements', () => {

      // when
      const element = createElement('span');

      // then
      assert.equal(element.description.name, 'span')
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert(!element.ref.textContent);
    });

    it('supports text elements', () => {

      // when
      const element = createElement('span', {}, 'Text');

      // then
      assert.equal(element.description.name, 'span')
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert.equal(element.ref.textContent, 'Text');
    });

    it('supports style attribute', () => {

      // when
      const element = createElement('span', {
        style: {
          color: 'red',
        },
      });

      // then
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert.equal(element.ref.style.length, 1);
      assert.deepEqual(element.ref.style.color, 'red');
    });

    it('supports adding event listeners', () => {

      // given
      const onClick = () => {};
      const onChange = () => {};

      // when
      const element = createElement('span', {onClick, onChange}, 'Text');

      // then
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert.equal(element.ref.textContent, 'Text');
      typeof window !== 'object' && assert.deepEqual(element.ref.eventListeners_, {
        click: [onClick],
        change: [onChange],
      });
    });
  });

  describe('=> create element', () => {

    const createFromTemplate = template => {
      const root = VirtualDOM.createRoot(Root);
      const node =
          VirtualDOM.createFromDescription(Template.describe(template), root);
      root.appendChild(node);
      return node;
    };

    it('creates a single element', () => {

      // given
      const element = createElement('div');

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.children, undefined);
      assert.equal(element.ref.tagName, 'DIV');
      assert.deepEqual(element.ref.children, []);
    });

    it('creates two nested elements', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          'span',
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      assert.equal(element.children[0].description.name, 'span');
      assert.equal(element.ref.children[0].tagName, 'SPAN');
    });

    it('creates three nested elements', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          'span',
          [
            'a',
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const span = element.children[0];
      assert.equal(element.ref.children[0], span.ref);
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');

      const link = span.children[0];
      assert.equal(span.ref.children[0], link.ref);
      assert.equal(link.description.name, 'a');
      assert.equal(link.ref.tagName, 'A');
    });

    it('supports component present within the tree', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          Component,
          [
            'span',
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, Component);

      const span = component.child;
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');
    });

    it('supports nested components present within the tree', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          Component,
          [
            Subcomponent,
            [
              'span',
            ],
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, Component);
      assert(component instanceof opr.Toolkit.Component);

      const subcomponent = component.child;
      assert.equal(subcomponent.constructor, Subcomponent);

      const span = subcomponent.child;
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');
    });

    it('supports component with no children', () => {

      // when
      const element = createFromTemplate([
        'div',
        [
          Component,
          [
            'span',
            [
              Subcomponent,
            ],
          ],
        ],
      ]);

      // then
      assert.equal(element.description.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, Component);
      assert(component.isComponent());

      const span = component.child;
      assert.equal(span.description.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');

      const subcompoennt = span.children[0];
      assert.equal(subcompoennt.constructor, Subcomponent);
      assert.equal(subcompoennt.child, null);
    });

    it('creates properties', () => {

      // when
      const element = createFromTemplate([
        'video',
        {
          properties: {
            muted: true,
          },
        },
      ]);

      // then
      assert.equal(element.description.name, 'video');
      assert.equal(element.ref.tagName, 'VIDEO');

      assert.equal(element.ref.muted, true);
    });

    describe('creates a comment node', () => {

      it('for a component with no child', () => {

        // when
        const component = createFromTemplate([
          Component,
        ]);

        // then
        assert(component.placeholder);
        assert(component.placeholder.text.includes('Component'));
      });

      it('for nested components with no child element', () => {

        // given
        const component = createFromTemplate([
          Component,
          [
            Component,
            [
              Subcomponent,
            ],
          ],
        ]);

        // then
        assert(component.placeholder);
        assert(component.placeholder.text.includes('Subcomponent'));
      });
    });
  });
});
