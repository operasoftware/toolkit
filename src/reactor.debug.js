(async () => {

  require.prefix('core', 'src/');
  let initialized = false;

  window.Reactor = {
    ready: async () => {
      if (!initialized) {
        const reactor = await require('core/reactor');
        const modules = await reactor.init();
        Object.assign(Reactor, modules);
        initialized = true;
      }
    }
  };

})();