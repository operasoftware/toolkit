const VirtualDOM = require('../../src/core/virtual-dom.js');
const ItemType = VirtualDOM.ItemType;

describe('Virtual DOM => get item type', () => {

  it('returns "string" for a string', () => {

    // when
    const type = VirtualDOM.getItemType('string');

    // then
    assert.equal(type, ItemType.STRING);
  });

  it('returns "number" for a number', () => {

    // when
    const type = VirtualDOM.getItemType(13);

    // then
    assert.equal(type, ItemType.NUMBER);
  });

  it('returns "boolean" for a boolean', () => {

    // when
    const type = VirtualDOM.getItemType(true);

    // then
    assert.equal(type, ItemType.BOOLEAN);
  });

  it('returns "component" for a symbol', () => {

    // when
    const type = VirtualDOM.getItemType(Symbol.for('component'));

    // then
    assert.equal(type, ItemType.COMPONENT);
  });

  it('returns "null" for null', () => {

    // when
    const type = VirtualDOM.getItemType(null);

    // then
    assert.equal(type, ItemType.NULL);
  });

  it('returns "undefined" for undefined', () => {

    // when
    const type = VirtualDOM.getItemType(undefined);

    // then
    assert.equal(type, ItemType.UNDEFINED);
  });

  it('returns "element" for an array', () => {

    // when
    const type = VirtualDOM.getItemType([]);

    // then
    assert.equal(type, ItemType.ELEMENT);
  });

  it('returns "props" for an object', () => {

    // when
    const type = VirtualDOM.getItemType({});

    // then
    assert.equal(type, ItemType.PROPS);
  });
});
