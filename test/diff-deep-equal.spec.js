const Diff = opr.Toolkit.Diff;

describe('Diff => deep equal', () => {

  describe('not equal', () => {
    const notEqual = [
      [undefined, null],
      [0, '0'],
      [false, 'false'],
      [true, 'true'],
      [
        parseInt, parseInt.bind(this), '[Function: parseInt]',
        '[Function: parseInt(bound)]'
      ],
      [{}, []],
      [{a: 5}, {a: '5'}],
      [{a: {b: []}}, {a: {b: {}}}],
      [{a: 'a', b: 'b'}, {a: 'a', c: 'c'}],
      [[0, 1, 2], [0, 2, 1]],
      [[5, 1, 2, 7, {}], [5, 1, 2, 7, []]],
      [[0, 0, 0], [0, 0]],
      [[1, 0], [1, 0, null]],
      [[9, 9], [9, 9, undefined], null, '[0,1,undefined]'],
    ];

    notEqual.forEach(([v1, v2, d1, d2]) => {
      it(`${d1 || JSON.stringify(v1)} !== ${d2 || JSON.stringify(v2)}`, () => {
        assert(Diff.deepEqual(v1, v2) === false);
      });
    });
  });

  describe('equal', () => {

    const equal = [
      [undefined, undefined],
      [null, null],
      [5, 5],
      [parseInt, parseInt, '[Function: parseInt]', '[Function: parseInt]'],
      [String, String, 'String', 'String'],
      [
        Symbol.for('test'), Symbol.for('test'), `Symbol.for('test')`,
        `Symbol.for('test')`
      ],
      [[], []],
      [{}, {}],
      [{a: {b: [1, 2, 3]}}, {a: {b: [1, 2, 3]}}],
      [{a: 1}, {a: 1}],
    ];

    equal.forEach(([v1, v2, d1, d2]) => {
      it(`${d1 || JSON.stringify(v1)} === ${d2 || JSON.stringify(v2)}`, () => {
        assert(Diff.deepEqual(v1, v2) === true);
      });
    });
  });

});
