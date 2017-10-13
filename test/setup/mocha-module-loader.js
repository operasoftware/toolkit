{
  const prefixes = new Map();

  window.global = window;
  global.module = {};

  const cache = {};

  const getScriptPath = path => {
    for (let [name, prefix] of prefixes) {
      if (path.startsWith(name)) {
        return `${prefix}${path}.js`;
      }
    }
    return `${path}.js`;
  };

  const getKey = id => typeof id === 'symbol' ? String(id).slice(7, -1) : id;

  window.loader = class MochaModuleLoader {

    static get(id) {
      return cache[getKey(id)];
    }

    static define(id, module) {
      cache[id] = module;
    }

    static async foreload(id) {
    }

    static async require(id) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = getScriptPath(id);
        script.onload = () => {
          cache[id] = module.exports;
          resolve(module.exports);
        };
        script.onerror = error => {
          console.error(
              `Error loading module "${id}" from "${script.src}"!`);
          reject(error);
        };
        document.head.appendChild(script);
      });
    }

    static prefix(name, prefix) {
      prefixes.set(name, prefix);
      return this;
    }

    static get cache() {
      return cache;
    }
  };
}
