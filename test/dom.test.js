describe('DOM stub', () => {

  describe('document', () => {

    describe('=> createElement()', () => {

      it('creates an element', () => {

        // when
        const div = document.createElement('div');

        // then
        assert(div instanceof Element);
        assert.equal(div.tagName, 'DIV');
        assert.deepEqual(div.dataset, {});
        assert.deepEqual(div.style, {});
        assert.deepEqual(div.childNodes, []);
      });
    });

    describe('=> createComment()', () => {

      it('creates a comment', () => {

        // when
        const comment = document.createComment('comment');

        // then
        assert(comment instanceof Comment);
        assert.deepEqual(comment.textContent, 'comment');
      });
    });
  });

  describe('Element', () => {

    describe('dataset', () => {

      it('adds a data attribute', () => {

        // given
        const element = document.createElement('span');

        // when
        element.dataset.someName = 666;

        // then
        assert.equal(element.dataset['someName'], '666')
        assert.equal(element.attributes['data-some-name'], '666');
      });

      it('replaces a data attribute', () => {

        // given
        const element = document.createElement('span');
        element.dataset.reactorId = 'id';

        assert.equal(element.dataset['reactorId'], 'id')
        assert.equal(element.attributes['data-reactor-id'], 'id');

        // when
        element.dataset.reactorId = true;

        // then
        assert.equal(element.dataset['reactorId'], 'true')
        assert.equal(element.attributes['data-reactor-id'], 'true');
      });

      it('removes a data attribute', () => {

        // given
        const element = document.createElement('span');
        element.dataset.attr = 'value';

        assert.equal(element.dataset['attr'], 'value')
        assert.equal(element.attributes['data-attr'], 'value');

        // when
        delete element.dataset.attr;

        // then
        assert.equal(element.dataset['attr'], undefined)
        assert.equal(element.attributes['data-attr'], undefined);
      });
    });

    describe('=> setAttribute()', () => {

      it('adds an attribute', () => {

        // given
        const element = document.createElement('span');

        // when
        element.setAttribute('name', null);

        // then
        assert.equal(element.attributes.name, 'null')
        assert.equal(element.getAttribute('name'), 'null');
      });

      it('replaces an attribute', () => {

        // given
        const element = document.createElement('span');
        element.setAttribute('name', undefined);

        assert.equal(element.attributes.name, 'undefined')

        // when
        element.setAttribute('name', true);

        // then
        assert.equal(element.attributes.name, 'true')
        assert.equal(element.getAttribute('name'), 'true');
      });
    });

    describe('=> removeAttribute()', () => {

      it('removes an attribute', () => {

        // given
        const element = document.createElement('span');
        element.setAttribute('id', 'valid-id');

        assert.equal(element.attributes.id, 'valid-id')

        // when
        element.removeAttribute('id');

        // then
        assert.equal(element.attributes.id, undefined);
        assert.equal(element.getAttribute('id'), undefined);
      });
    });

    describe('=> addEventListener()', () => {

      it('adds a single event listener', () => {

        // given
        const element = document.createElement('a');
        const listener = () => {};

        // when
        element.addEventListener('click', listener);

        // then
        assert.deepEqual(element.eventListeners, {
          click: [listener],
        });
      });

      it('adds multiple event listeners', () => {

        // given
        const element = document.createElement('a');
        const firstListener = () => {};
        const secondListener = () => {};

        // when
        element.addEventListener('change', firstListener);
        element.addEventListener('change', secondListener);

        // then
        assert.deepEqual(element.eventListeners, {
          change: [firstListener, secondListener],
        });
      });
    });

    describe('=> removeEventListener()', () => {

      it('removes a single event listener', () => {

        // given
        const element = document.createElement('a');
        const listener = () => {};
        element.eventListeners = {
          drag: [listener],
        };

        // when
        element.removeEventListener('drag', listener);

        // then
        assert.deepEqual(element.eventListeners, {
          drag: [],
        });
      });

      it('removes multiple event listeners', () => {

        // given
        const element = document.createElement('a');
        const firstListener = () => {};
        const secondListener = () => {};
        element.eventListeners = {
          drop: [firstListener, secondListener],
        };

        // when
        element.removeEventListener('drop', firstListener);
        element.removeEventListener('drop', secondListener);

        // then
        assert.deepEqual(element.eventListeners, {
          drop: []
        })
      });
    });

    describe('=> appendChild()', () => {

      it('inserts an element', () => {

        // given
        const parent = document.createElement('div');
        const element = document.createElement('span');

        // when
        parent.appendChild(element);

        // then
        assert.deepEqual(parent.childNodes, [
          element
        ]);
        assert.equal(element.parentNode, parent);
      });

      it('inserts a comment', () => {

        // given
        const parent = document.createElement('div');
        const comment = document.createComment('comment');

        // when
        parent.appendChild(comment);

        // then
        assert.deepEqual(parent.childNodes, [
          comment
        ]);
        assert.equal(comment.parentNode, parent);
      });

    });

    describe('=> insertBefore()', () => {

      it('inserts an element before node', () => {

        // given
        const parent = document.createElement('div');
        const comment = document.createComment('comment');
        parent.appendChild(comment);

        const element = document.createElement('span');

        // when
        parent.insertBefore(element, comment);

        // then
        assert.equal(parent.childNodes[0], element);
        assert.equal(parent.childNodes[1], comment);
        assert.equal(element.parentNode, parent);
      });

      it('inserts a comment before node', () => {

        // given
        const parent = document.createElement('div');
        const span = document.createElement('span');
        const link = document.createElement('a');
        parent.appendChild(span);
        parent.appendChild(link);

        const comment = document.createComment('comment');

        // when
        parent.insertBefore(comment, link);

        // then
        assert.equal(parent.childNodes[0], span);
        assert.equal(parent.childNodes[1], comment);
        assert.equal(parent.childNodes[2], link);
        assert.equal(comment.parentNode, parent);
      });

      it('inserts an element at the end', () => {

        // given
        const parent = document.createElement('div');
        const comment = document.createComment('comment');

        const element = document.createElement('span');

        // when
        parent.insertBefore(element, comment);

        // then
        assert.equal(parent.childNodes[0], element);
        assert.equal(element.parentNode, parent);
      });

      it('inserts a comment at the end', () => {

        // given
        const parent = document.createElement('div');
        const span = document.createElement('span');
        parent.appendChild(span);

        const comment = document.createComment('comment');

        // when
        parent.insertBefore(comment, null);

        // then
        assert.equal(parent.childNodes[0], span);
        assert.equal(parent.childNodes[1], comment);
        assert.equal(comment.parentNode, parent);
      });
    });

    describe('=> remove()', () => {

      it('removes an element', () => {

        // given
        const parent = document.createElement('div');
        const element = document.createElement('span');
        parent.appendChild(element);

        // when
        element.remove();

        // then
        assert.deepEqual(parent.childNodes, []);
        assert.equal(element.parentNode, null);
      });

      it('removes a comment', () => {


        // given
        const parent = document.createElement('div');
        const element = document.createElement('span');
        const comment = document.createComment('comment');
        parent.appendChild(element);
        parent.appendChild(comment);

        // when
        comment.remove();

        // then
        assert.deepEqual(parent.childNodes, [element]);
        assert.equal(comment.parentNode, null);
      });
    });
  });
})