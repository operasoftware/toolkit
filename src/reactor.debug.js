(async () => {

  require.prefix('core', 'src/');

  let initialized = false;
  let readyPromise = Promise.resolve();

  const init = async () => {
    if (initialized) {
      return;
    }
    const reactor = await require('core/reactor');
    const modules = await reactor.init();
    Object.assign(Reactor, modules);
    Object.freeze(Reactor);
    initialized = true;
  };

  window.Reactor = {
    ready: async () => {
      if (!initialized) {
        readyPromise = readyPromise.then(() => init());
      }
      await readyPromise;
    }
  };

})();
