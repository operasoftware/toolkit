describe('Commands API', () => {

  let container;

  let counter = 0;

  beforeEach(() => {
    container = document.createElement('section');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const createWebComponent = async commands => {

    class CommandsComponent extends opr.Toolkit.WebComponent {

      static get elementName() {
        return `commands-component-${counter++}`;
      }

      static getCommands() {
        return typeof commands === 'function' ? commands() : commands;
      }
    }

    return await opr.Toolkit.render(CommandsComponent, container);

  };

  it('uses static getCommands() method', async () => {

    // given
    const getCommands = sinon.fake.returns({
      doNothing: () => state => state,
    });

    // when
    const component = await createWebComponent(getCommands);

    // then
    assert(getCommands.called);
  });

  it('creates default commands object', async () => {

    // when
    const component = await createWebComponent({});

    // then
    assert.equal(typeof component.commands, 'object');
    assert.equal(typeof component.commands.setState, 'function');
    assert.equal(typeof component.commands.update, 'function');
  });

  it('creates custom commands object', async () => {

    // when
    const component = await createWebComponent({
      doNothing: () => state => state,
    });

    // then
    assert.equal(typeof component.commands, 'object');
    assert.equal(typeof component.commands.setState, 'function');
    assert.equal(typeof component.commands.update, 'function');
    assert.equal(typeof component.commands.doNothing, 'function');
  });

  it('detects a conflict with core commands', async () => {

    // given
    let exception = null;

    // when
    try {
      await createWebComponent({
        update: () => state => state,
      });
    } catch (e) {
      exception = e;
    }

    // then
    assert(exception);
    assert.equal(exception.message, 'The "update" command is already defined!');
  });

  it('detects a conflict between custom commands', async () => {

    // given
    let exception = null;

    // when
    try {
      await createWebComponent([
        {
          doNothing: () => state => state,
        },
        {
          doNothing: () => state => state,
        },
      ]);
    } catch (e) {
      exception = e;
    }

    // then
    assert(exception);
    assert.equal(
        exception.message, 'The "doNothing" command is already defined!');
  });
});
