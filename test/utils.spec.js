describe('Utils', () => {

  beforeEach(() => {
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    console.error.restore();
  });

  const {
    throttle,
    lowerDash,
    getAttributeName,
    getEventName,
    addDataPrefix,
    createUUID,
    isSupportedAttribute,
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
      assert([3, 4].includes(timestamps.length));
      const margin = 3;
      for (let i = 1; i < timestamps.length; i++) {
        assert(timestamps[i] + margin >= timestamps[i - 1] + wait);
      }
    });

    it('delays first event', async () => {

      // given
      const wait = 50;
      const timestamps = [];
      const startTimestamp = Date.now();
      const fn = () => timestamps.push(Date.now());
      const waitTimes =
          new Array(1000).fill(0).map(() => Math.floor(Math.random() * 200));

      // when
      const throttled = throttle(fn, wait, true);

      await Promise.all(
          waitTimes.map(waitTime => new Promise(resolve => setTimeout(() => {
                                                  throttled();
                                                  resolve();
                                                }, waitTime))));

      // then
      assert(timestamps[0] >= startTimestamp + wait);
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

    it('allows to use setState command from the core reducer', () => {

      // given
      const reducer = opr.Toolkit.utils.combineReducers();
      const state = {};
      const newState = {
        foo: 'bar',
      };

      // when
      const command = reducer.commands.setState(newState);
      const result = reducer(state, command);

      // then
      assert.equal(result, newState);
    });

    it('allows to use update command from the core reducer', () => {

      // given
      const reducer = opr.Toolkit.utils.combineReducers();
      const state = {
        some: 'value',
      };
      const newState = {
        foo: 'bar',
      };

      // when
      const command = reducer.commands.update(newState);
      const result = reducer(state, command);

      // then
      assert.equal(result.some, state.some);
      assert.equal(result.foo, newState.foo);
    });

    it('detects name conflicts', () => {

      // given
      const conflictingReducer = (state, command) => state;
      conflictingReducer.commands = {
        update: () => ({
          type: Symbol('update'),
        }),
      };

      // when
      assert.throws(
          () => opr.Toolkit.utils.combineReducers(conflictingReducer));
    });

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
      ['accessKey', 'accesskey'],
      ['tabIndex', 'tabindex'],
      ['autoPlay', 'autoplay'],
      ['acceptCharset', 'accept-charset'],
      ['noValidate', 'novalidate'],
      ['ariaActiveDescendant', 'aria-activedescendant'],
      ['ariaMultiSelectable', 'aria-multiselectable'],
      ['ariaSetSize', 'aria-setsize'],
      ['ariaRequired', 'aria-required'],
      ['ariaAutoComplete', 'aria-autocomplete'],
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

  describe('is supported attribute', () => {

    it('returns true for standard attributes', () => {
      assert(isSupportedAttribute('name'));
      assert(isSupportedAttribute('id'));
      assert(isSupportedAttribute('tabIndex'));
    });

    it('returns true for key attribute', () => {
      assert.equal(isSupportedAttribute('key'), true);
    });

    it('returns true for class attribute', () => {
      assert.equal(isSupportedAttribute('class'), true);
    });

    it('returns true for style attribute', () => {
      assert.equal(isSupportedAttribute('style'), true);
    });

    it('returns true for dataset attribute', () => {
      assert.equal(isSupportedAttribute('dataset'), true);
    });

    it('returns true for metadata attribute', () => {
      assert.equal(isSupportedAttribute('metadata'), true);
    });

    it('returns false for invalid attribute', () => {
      assert.equal(isSupportedAttribute('invalid'), false);
    });
  })
});
