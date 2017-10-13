describe('Utils', () => {

  const {
    throttle,
    lowerDash,
    getAttributeName,
    getEventName,
    addDataPrefix,
    createUUID,
    createCommandsDispatcher,
  } = opr.Toolkit.utils;

  describe('throttle', () => {

    it('throttles using specified wait time', async () => {

      // given
      const wait = 50;
      const timestamps = [];
      const fn = () => timestamps.push(Date.now());
      const waitTimes =
          new Array(1000).fill(0).map(() => Math.floor(Math.random() * 200));

      // when
      const throttled = throttle(fn, wait);

      await Promise.all(
          waitTimes.map(waitTime => new Promise(resolve => setTimeout(() => {
                                                  throttled();
                                                  resolve();
                                                }, waitTime))));

      // then
      assert.equal(timestamps.length, 4);
      for (let i = 1; i < timestamps.length; i++) {
        assert(timestamps[i] + 1 >= timestamps[i - 1] + wait);
      }
    });

    it('does not throttle infrequent events', async () => {

      // given
      const wait = 20;
      const timestamps = [];
      const fn = () => timestamps.push(Date.now());
      const waitTimes = [0, 30, 62, 94, 124];

      // when
      const throttled = throttle(fn, wait);

      await Promise.all(
          waitTimes.map(waitTime => new Promise(resolve => setTimeout(() => {
                                                  throttled();
                                                  resolve();
                                                }, waitTime))));

      // then
      assert.equal(timestamps.length, 5);
      for (let i = 1; i < timestamps.length; i++) {
        assert(timestamps[i] + 1 >= timestamps[i - 1] + wait);
      }
    });
  });

  describe('core reducer', () => {

    it('returns the state provided by the INIT command', () => {

      // given
      const state = {
        foo: 'bar',
      };
      const reducer = opr.Toolkit.utils.combineReducers();
      const command = reducer.commands.init(state);

      // when
      const nextState = reducer({}, command);

      // then
      assert.deepEqual(nextState, state);
    });

  });

  describe('combine reducers', () => {

    // given
    const DOUBLE = Symbol('double');
    const TRIPLE = Symbol('triple');

    const doubleReducer = (state, command) => {
      switch (command.type) {
        case DOUBLE:
          return {
            value: state.value * 2,
          };
        default:
          return state;
      }
    };

    doubleReducer.commands = {
      double: value => ({
        type: DOUBLE,
      })
    };

    const tripleReducer = (state, command) => {
      switch (command.type) {
        case TRIPLE:
          return {
            value: state.value * 3,
          };
        default:
          return state;
      }
    };

    tripleReducer.commands = {
      triple: value => ({
        type: TRIPLE,
      }),
    };

    it('chains reducers and merges commands', () => {

      // given
      const reducer =
          opr.Toolkit.utils.combineReducers(doubleReducer, tripleReducer);

      // when
      const initCommand = reducer.commands.init({
        value: 1,
      });
      let state = reducer({}, initCommand);

      // then
      assert.deepEqual(state, {
        value: 1,
      });

      // when
      const doubleCommand = reducer.commands.double();
      state = reducer(state, doubleCommand);

      // then
      assert.deepEqual(state, {
        value: 2,
      });

      // when
      const tripleCommand = reducer.commands.triple();
      state = reducer(state, tripleCommand);

      // then
      assert.deepEqual(state, {
        value: 6,
      });
    });
  });

  describe('create commands dispatcher', () => {

    it('creates a dispatcher', () => {

      // given
      const dispatch = sinon.spy();
      const reducer = () => {};
      reducer.commands = {
        someCommand: (key, value) => ({
          key,
          value,
        }),
      };
      const commands = createCommandsDispatcher(reducer, dispatch);

      // when
      commands.someCommand(commands.someCommand('foo', 'bar'));

      // then
      assert(dispatch.called);
      assert(dispatch.calledWith({
        key: 'foo',
        value: 'bar',
      }));
    });
  });

  describe('lower dash', () => {

    const convertions = [
      ['attributeName', 'attribute-name'],
      ['TestString', 'test-string'],
      ['SomeLongAttributeName', 'some-long-attribute-name'],
    ];

    convertions.forEach(([from, to]) => {
      it(`converts "${from}" to "${to}"`, () => {
        assert.equal(lowerDash(from), to);
      });
    });
  });

  describe('get attribute name', () => {

    const convertions = [
      ['tabIndex', 'tabindex'],
      ['autoPlay', 'autoplay'],
      ['acceptCharset', 'accept-charset'],
      ['noValidate', 'novalidate'],
    ];

    convertions.forEach(([from, to]) => {
      it(`converts "${from}" to "${to}"`, () => {
        assert.equal(getAttributeName(from), to);
      });
    });
  });
  describe('get event name', () => {

    const convertions = [
      ['onClick', 'click'],
      ['onDoubleClick', 'dblclick'],
      ['onContextMenu', 'contextmenu'],
      ['onCanPlayThrough', 'canplaythrough'],
    ];

    convertions.forEach(([from, to]) => {
      it(`converts "${from}" to "${to}"`, () => {
        assert.equal(getEventName(from), to);
      });
    });
  });

  describe('add data prefix', () => {

    const convertions = [
      ['reactorId', 'dataReactorId'],
      ['someCustomAttribute', 'dataSomeCustomAttribute'],
      ['name', 'dataName'],
    ]

    convertions.forEach(([from, to]) => {
      it(`converts "${from}" to "${to}"`, () => {
        assert.equal(addDataPrefix(from), to);
      });
    });
  });

  describe('create UUID', () => {

    it('creates valid UUID', () => {
      const uuid = createUUID();
      assert.equal(/........\-....\-....\-............/.test(uuid), true);
    });
  })
});
