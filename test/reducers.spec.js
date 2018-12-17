describe('Reducers', () => {

  describe('core reducer', () => {

    it('returns the state provided by the set state command', () => {

      // given
      const state = {
        foo: 'bar',
      };
      const reducers = opr.Toolkit.Reducers.create(createRoot());
      const command = reducers.reducer.commands.setState(state);

      // when
      const nextState = reducers.reducer({}, command);

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
      }),
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
      const reducer = opr.Toolkit.Reducers.create(createRoot()).reducer;
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
      const reducer = opr.Toolkit.Reducers.create(createRoot()).reducer;
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

      sinon.stub(console, 'error');

      // given
      const conflictingReducer = (state, command) => state;
      conflictingReducer.commands = {
        update: () => ({
          type: Symbol('update'),
        }),
      };

      class ConflictingRoot extends opr.Toolkit.Root {
        getReducers() {
          return [conflictingReducer];
        }
      }

      // when
      try {
        assert.throws(() => opr.Toolkit.VirtualDOM.createRoot(ConflictingRoot));
      } finally {
        console.error.restore();
      }
    });

    it('chains reducers and merges commands', () => {

      // given
      class SomeRoot extends opr.Toolkit.Root {
        getReducers() {
          return [doubleReducer, tripleReducer];
        }
      }
      const root = createRootInstance(SomeRoot);
      const reducer = opr.Toolkit.Reducers.create(root).reducer;

      // when
      const initCommand = reducer.commands.setState({
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
});
