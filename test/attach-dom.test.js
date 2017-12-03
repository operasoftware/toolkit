describe('Virtual Element => Attach DOM', () => {

  const {
    Template,
    VirtualDOM,
    VirtualElement,
    VirtualNode,
  } = opr.Toolkit;

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

  const getComponentClass = symbol => {
    if (typeof symbol === 'string') {
      symbol = Symbol.for(symbol);
    }
    switch (symbol) {
      case Component:
        return ComponentClass;
      case Subcomponent:
        return SubcomponentClass;
    }
  };

  const createElement =
      (name, props = {}, content = []) => {
        const details = {
          type: 'element',
          name,
          children: Array.isArray(content) ? content : undefined,
          text: typeof content === 'string' ? content : null,
          props,
        };
        const description = Template.normalize(details);
        return VirtualDOM.createFromDescription(description, null, null);
      }

  describe('=> DOM operations', () => {

    it('sets text content', () => {

      // given
      const element = createElement('div');

      // when
      element.setTextContent('text content');

      // then
      assert.equal(element.text, 'text content');
      assert.equal(element.ref.textContent, 'text content');
    });

    it('adds an event listener', () => {

      // given
      const listener = () => {};
      const element = createElement('div');

      // when
      element.addListener('onClick', listener);

      // then
      assert.equal(element.listeners.onClick, listener);
      !(global.window) && assert.deepEqual(element.ref.eventListeners_, {
        click: [listener],
      });
    });

    it('removes an event listener', () => {

      // given
      const listener = () => {};
      const element = createElement('div', {
        onChange: listener,
      });

      assert.equal(element.listeners.onChange, listener);
      !(global.window) && assert.deepEqual(element.ref.eventListeners_, {
        change: [listener],
      });

      // when
      element.removeListener('onChange', listener);

      // then
      assert.equal(element.listeners.onChange, undefined);
      !(global.window) && assert.deepEqual(element.ref.eventListeners_, {
        change: [],
      });
    });

    it('sets a lowercase attribute', () => {

      // given
      const element = createElement('div');

      // when
      element.setAttribute('tabIndex', 10);

      // then
      assert.equal(element.attrs.tabIndex, 10);
      assert.equal(element.ref.getAttribute('tabindex'), '10');
      assert.equal(element.ref.attributes.length, 1);
    });

    it('sets a dash-separated attribute', () => {

      // given
      const element = createElement('div');

      // when
      element.setAttribute('acceptCharset', 'UTF8');

      // then
      assert.equal(element.attrs.acceptCharset, 'UTF8');
      assert.equal(element.ref.getAttribute('accept-charset'), 'UTF8');
      assert.equal(element.ref.attributes.length, 1);
    });

    it('removes an attribute', () => {

      // given
      const value = 'anything';
      const element = createElement('span', {
        value,
      });

      assert.equal(element.attrs.value, value);
      assert.equal(element.ref.attributes.length, 1);
      assert.equal(element.ref.getAttribute('value'), value);

      // when
      element.removeAttribute('value');

      // then
      assert.equal(element.attrs.value, undefined);
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
      assert.equal(element.dataset.targetUrl, url);
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

      assert.equal(element.dataset.someUrl, someUrl);
      assert.equal(element.ref.dataset.someUrl, someUrl);
      assert.equal(element.ref.getAttribute('data-some-url'), someUrl);
      assert.equal(element.ref.attributes.length, 1);

      // when
      element.removeDataAttribute('someUrl');

      // then
      assert.equal(element.dataset.someUrl, undefined);
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
      assert.deepEqual(element.className, 'some-name');
      assert.deepEqual([...element.ref.classList], ['some-name']);
    });

    it('removes a class name', () => {

      // given
      const element = createElement('section', {
        class: ['to-be-removed'],
      });

      assert.equal(element.className, 'to-be-removed');
      assert.deepEqual([...element.ref.classList], ['to-be-removed']);

      // when
      element.setClassName('');

      // then
      assert.deepEqual(element.className, '');
      assert.deepEqual([...element.ref.classList], []);
    });

    it('sets a style property', () => {

      // given
      const element = createElement('span');

      // when
      element.setStyleProperty('backgroundColor', 'red');

      // then
      assert.equal(element.style.backgroundColor, 'red');
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

      assert.equal(element.style.color, 'green');
      assert.equal(element.ref.style.color, 'green');

      // when
      element.removeStyleProperty('color');

      // then
      assert.equal(element.style.color, undefined);
      assert.equal(element.ref.style.color, '');
    });

    it('sets metadata', () => {

      // given
      const element = createElement('div');

      // when
      element.setMetadata('key', 'value');

      // then
      assert.equal(element.metadata.key, 'value');
      assert.equal(element.ref.key, 'value');
    });

    it('removes metadata', () => {

      // given
      const element = createElement('div', {
        metadata: {
          key: 'some-key',
        },
      });

      assert.equal(element.metadata.key, 'some-key');
      assert.equal(element.ref.key, 'some-key');

      // when
      element.removeMetadata('key');

      // then
      assert.equal(element.metadata.key, undefined);
      assert.equal(element.ref.key, undefined);
    });
  });

  describe('=> create element', () => {

    it('supports empty elements', () => {

      // when
      const element = createElement('span');

      // then
      assert.equal(element.name, 'span')
      assert(element.ref instanceof Element);
      assert.equal(element.ref.tagName, 'SPAN')
      assert(!element.ref.textContent);
    });

    it('supports text elements', () => {

      // when
      const element = createElement('span', {}, 'Text');

      // then
      assert.equal(element.name, 'span')
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
      !(global.window) && assert.deepEqual(element.ref.eventListeners_, {
        click: [onClick],
        change: [onChange],
      });
    });
  });

  describe('=> create element', () => {

    beforeEach(() => {
      sinon.stub(VirtualDOM, 'getComponentClass', getComponentClass);
    });

    afterEach(() => {
      VirtualDOM.getComponentClass.restore();
    });

    it('creates a single element', () => {

      // given
      const element = createElement('div');

      // then
      assert.equal(element.name, 'div');
      assert.deepEqual(element.children, []);
      assert.equal(element.ref.tagName, 'DIV');
      assert.deepEqual(element.ref.children, []);
    });

    it('creates two nested elements', () => {

      // when
      const element = utils.createFromTemplate([
        'div',
        [
          'span',
        ],
      ]);

      // then
      assert.equal(element.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      assert.equal(element.children[0].name, 'span');
      assert.equal(element.ref.children[0].tagName, 'SPAN');
    });

    it('creates three nested elements', () => {

      // when
      const element = utils.createFromTemplate([
        'div',
        [
          'span',
          [
            'a',
          ],
        ],
      ]);

      // then
      assert.equal(element.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const span = element.children[0];
      assert.equal(element.ref.children[0], span.ref);
      assert.equal(span.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');

      const link = span.children[0];
      assert.equal(span.ref.children[0], link.ref);
      assert.equal(link.name, 'a');
      assert.equal(link.ref.tagName, 'A');
    });

    it('supports component present within the tree', () => {

      // when
      const element = utils.createFromTemplate([
        'div',
        [
          Component,
          [
            'span',
          ],
        ],
      ]);

      // then
      assert.equal(element.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, ComponentClass);

      const span = component.child;
      assert.equal(span.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');
    });

    it('supports nested components present within the tree', () => {

      // when
      const element = utils.createFromTemplate([
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
      assert.equal(element.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, ComponentClass);
      assert(component instanceof opr.Toolkit.Component);

      const subcomponent = component.child;
      assert.equal(subcomponent.constructor, SubcomponentClass);

      const span = subcomponent.child;
      assert.equal(span.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');
    });

    it('supports component with no children', () => {

      // when
      const element = utils.createFromTemplate([
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
      assert.equal(element.name, 'div');
      assert.equal(element.ref.tagName, 'DIV');

      const component = element.children[0];
      assert.equal(component.constructor, ComponentClass);
      assert(component.isComponent());

      const span = component.child;
      assert.equal(span.name, 'span');
      assert.equal(span.ref.tagName, 'SPAN');

      const subcompoennt = span.children[0];
      assert.equal(subcompoennt.constructor, SubcomponentClass);
      assert.equal(subcompoennt.child, null);
    });

    it('creates metadata', () => {

      // when
      const element = utils.createFromTemplate([
        'video',
        {
          metadata: {
            muted: true,
          },
        },
      ]);

      // then
      assert.equal(element.name, 'video');
      assert.equal(element.ref.tagName, 'VIDEO');

      assert.equal(element.ref.muted, true);
    });

    describe('creates a comment node', () => {

      it('for a component with no child', () => {

        // when
        const component = utils.createFromTemplate([
          Component,
        ]);

        // then
        assert(component.placeholder);
        assert(component.placeholder.text.includes('ComponentClass'));
      });

      it('for nested components with no child element', () => {

        // given
        const component = utils.createFromTemplate([
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
        assert(component.placeholder.text.includes('SubcomponentClass'));
      });
    });
  });
});
