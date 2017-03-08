{
  const prefixes = new Map();

  window.global = window;
  global.module = {};

  const getScriptPath = path => {
    for (let [name, prefix] of prefixes) {
      if (path.startsWith(name)) {
        return `/${prefix}${path}.js`;
      }
    }
    return `/${path}.js`;
  }

  window.require = componentPath => {

    const loadPromise = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = getScriptPath(componentPath);
      script.onload = () => {
        resolve(module.exports);
      };
      document.head.appendChild(script);
    });
    return loadPromise;
  };

  require.prefix = (name, prefix) => {
    prefixes.set(name, prefix);
  };
}