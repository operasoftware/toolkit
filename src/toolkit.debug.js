(async () => {

  loader.prefix('core', '/src/');

  let initialized = false;
  let readyPromise = Promise.resolve();

  const init = async () => {
    if (initialized) {
      return;
    }
    const toolkit = await loader.require('core/toolkit');
    const modules = await toolkit.init();
    Object.assign(opr.Toolkit, modules);
    Object.freeze(opr.Toolkit);
    initialized = true;
  };

  window.opr = window.opr || {};
  window.opr.Toolkit = {
    ready: async () => {
      if (!initialized) {
        readyPromise = readyPromise.then(() => init());
      }
      await readyPromise;
    }
  };

  opr.Toolkit.isDebug = () => true;

})();
