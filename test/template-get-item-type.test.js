const Template = require('../src/core/template.js');
const ItemType = Template.ItemType;

describe('Template => get item type', () => {

  it('returns "string" for a string', () => {

    // when
    const type = Template.getItemType('string');

    // then
    assert.equal(type, ItemType.STRING);
  });

  it('returns "number" for a number', () => {

    // when
    const type = Template.getItemType(13);

    // then
    assert.equal(type, ItemType.NUMBER);
  });

  it('returns "boolean" for a boolean', () => {

    // when
    const type = Template.getItemType(true);

    // then
    assert.equal(type, ItemType.BOOLEAN);
  });

  it('returns "component" for a symbol', () => {

    // when
    const type = Template.getItemType(Symbol.for('component'));

    // then
    assert.equal(type, ItemType.COMPONENT);
  });

  it('returns "null" for null', () => {

    // when
    const type = Template.getItemType(null);

    // then
    assert.equal(type, ItemType.NULL);
  });

  it('returns "undefined" for undefined', () => {

    // when
    const type = Template.getItemType(undefined);

    // then
    assert.equal(type, ItemType.UNDEFINED);
  });

  it('returns "element" for an array', () => {

    // when
    const type = Template.getItemType([]);

    // then
    assert.equal(type, ItemType.ELEMENT);
  });

  it('returns "props" for an object', () => {

    // when
    const type = Template.getItemType({});

    // then
    assert.equal(type, ItemType.PROPS);
  });
});
