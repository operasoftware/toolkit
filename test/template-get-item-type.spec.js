describe('Template => get item type', () => {

  const {
    Template,
  } = opr.Toolkit;

  it('returns "string" for a string', () => {
    assert.equal(Template.getItemType('foo'), 'string');
  });

  it('returns "number" for a number', () => {
    assert.equal(Template.getItemType(666), 'number');
  });

  it('returns "boolean" for a boolean', () => {
    assert.equal(Template.getItemType(false), 'boolean');
    assert.equal(Template.getItemType(true), 'boolean');
  });

  it('returns "symbol" for a symbol', () => {
    assert.equal(Template.getItemType(Symbol.for('some/path')), 'symbol');
  });

  it('returns "null" for null', () => {
    assert.equal(Template.getItemType(null), 'null');
  });

  it('returns "undefined" for undefined', () => {
    assert.equal(Template.getItemType(undefined), 'undefined');
  });

  it('returns "node" for an array', () => {
    assert.equal(Template.getItemType([]), 'node');
  });

  it('returns "props" for an object', () => {
    assert.equal(Template.getItemType({}), 'props');
  });

  it('returns "function" for a function', () => {
    assert.equal(Template.getItemType(props => null), 'function');
  });

  it('returns "unknown" for a component', () => {
    class Component extends opr.Toolkit.Component {
      render() {
        return null;
      }
    }
    const component = createFromTemplate([Component]);
    assert.equal(Template.getItemType(component), 'unknown');
  });
});
