const utils = require('../src/core/utils.js');
const lowerDash = utils.utils.lowerDash;
const getEventName = utils.utils.getEventName;
const addDataPrefix = utils.utils.addDataPrefix;

describe('Utils', () => {

  describe('core reducer', () => {

    it('returns the state provided by the INIT command', () => {

      // given
      const state = {
        foo: 'bar'
      };
      const reducer = utils.combineReducers();
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
    }

    tripleReducer.commands = {
      triple: value => ({
        type: TRIPLE,
      })
    };

    it('chains reducers and merges commands', () => {

      // given
      const reducer = utils.combineReducers(doubleReducer, tripleReducer);

      // when
      const initCommand = reducer.commands.init({
        value: 1,
      });
      let state = reducer({}, initCommand);

      // then
      assert.deepEqual(state, {
        value: 1
      });

      // when
      const doubleCommand = reducer.commands.double();
      state = reducer(state, doubleCommand);

      // then
      assert.deepEqual(state, {
        value: 2
      });

      // when
      const tripleCommand = reducer.commands.triple();
      state = reducer(state, tripleCommand);

      // then
      assert.deepEqual(state, {
        value: 6
      });
    });
  });

  describe('lower dash', () => {

    const convertions = [
      ['attributeName', 'attribute-name'],
      ['TestString', 'test-string'],
      ['SomeLongAttributeName', 'some-long-attribute-name'],
    ]

    convertions.forEach(([from, to]) => {
      it(`converts "${from}" to "${to}"`, () => {
        assert.equal(lowerDash(from), to);
      });
    });
  });

  describe('get event name', () => {

    const convertions = [
      ['onClick', 'click'],
      ['onContextMenu', 'contextmenu'],
      ['onCanPlayThrough', 'canplaythrough'],
    ]

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
});
