{
  const prefixes = new Map();

  window.global = window;
  global.loader
  global.module = {};

  const getScriptPath = path => {
    for (let [name, prefix] of prefixes) {
      if (path.startsWith(name)) {
        return `${prefix}${path}.js`;
      }
    }
    return `${path}.js`;
  }

  window.loader = class MochaModuleLoader {

    static async require(path) {
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = getScriptPath(path);
        script.onload = () => {
          resolve(module.exports);
        };
        document.head.appendChild(script);
      });
    }

    static prefix(name, prefix) {
      prefixes.set(name, prefix);
      return this;
    }
  };
}
