describe('App', () => {

  describe('preload', () => {
    it.skip('preloads all components in the tree');
  });

  describe('render', () => {
    it.skip('creates and initialises new app');
  });

  describe('create component tree', () => {
    it.skip('synchronously creates the tree for preloaded components');
    it.skip('resolves dependencies and asynchronously creates the tree');
  });

  describe('calculate patches', () => {
    it.skip(`includes 'create root component' patch for new app`);
    it.skip(`includes 'update component' patch when state is updated`);
  });

  describe('update DOM', () => {
    it.skip('calculates and applies patches');
    it.skip('invokes component lifecycle methods');
  });
});