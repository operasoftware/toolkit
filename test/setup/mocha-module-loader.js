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

    static async get(id) {
      throw new Error('Mock loader.get(id) method before the test!');
    }

    static async require(id) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = getScriptPath(id);
        script.onload = () => {
          resolve(module.exports);
        };
        script.onerror = error => {
          console.error(
              `Error loading module "${path}" from "${resourcePath}"!`);
          reject(error);
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
