{
  const logLevels = ['debug', 'info', 'warn', 'error'];

  class Toolkit {

    constructor() {
      this.plugins = new Map();
      this.readyPromise = new Promise(resolve => {
        this.init = resolve;
      });
    }

    async ready() {
      await this.readyPromise;
    }

    configure(options) {
      const settings = {};
      settings.plugins = options.plugins || [];
      settings.level =
          logLevels.includes(options.level) ? options.level : 'info';
      settings.debug = options.debug || false;
      settings.preload = options.preload || false;
      settings.bundles = options.bundles || [];
      settings.bundleRootPath = options.bundleRootPath || '';
      Object.freeze(settings);
      this.settings = settings;
      this.init();
    }

    isDebug() {
      return Boolean(this.settings) && this.settings.debug;
    }

    assert(condition, ...messages) {
      if (this.isDebug()) {
        console.assert(condition, ...messages);
      }
    }

    warn(...messages) {
      console.warn(...messages);
    }

    getBundleName(root) {
      if (typeof root === 'symbol') {
        root = String(this.symbol).slice(7, -1);
      }
      for (const bundle of this.settings.bundles) {
        if (bundle.root === root) {
          return bundle.name;
        }
      }
      return null;
    }

    async preload(symbol) {
      if (this.settings.debug) {
        if (this.settings.preload) {
          await loader.foreload(symbol);
        }
      } else {
        const bundle = this.getBundleName(symbol);
        if (bundle) {
          await loader.require(`${this.settings.bundleRootPath}/${bundle}`);
        }
      }
    }

    async getRootClass(component, props) {
      const type = typeof component;
      switch (type) {
        case 'string':
        case 'symbol':
          await this.preload(component);
          const module = loader.get(component);
          this.assert(
              module.prototype instanceof opr.Toolkit.Root,
              'Module has to be an instance of opr.Toolkit.Root');
          return module;
        case 'function':
          if (component.prototype instanceof opr.Toolkit.Root) {
            return component;
          }
          return class RootClass extends opr.Toolkit.Root {
            render() {
              return component(props);
            }
          };
        default:
          throw new Error(`Invalid component type: ${type}`);
      }
    }

    renderStatic(templateProvider, container, props = {}) {
      const parent = new opr.Toolkit.Root();
      parent.container = container;
      const template = templateProvider(props);
      if (template) {
        const element = this.VirtualDOM.createFromTemplate(template);
        this.Patch.addElement(element, parent).apply();
      }
      return props => {
        const template = templateProvider(props);
        let element;
        if (template) {
          element = this.VirtualDOM.createFromTemplate(template);
        }
        const patches = this.Diff.calculate(parent.child, element, parent);
        for (const patch of patches) {
          patch.apply();
        }
      };
    }

    async render(component, container, props = {}) {

      await this.ready();

      const RootClass = await this.getRootClass(component, props);

      const root = this.VirtualDOM.createComponentInstance(RootClass, props);

      let destroy;
      const init = async container => {
        root.renderer = new this.Renderer(root, container, this.settings);
        root.container = container;
        destroy = () => {
          this.Lifecycle.onComponentDestroyed(root);
          this.Lifecycle.onComponentDetached(root);
        };
        const initialState =
            await root.getInitialState.call(root.sandbox, props);

        // TODO: investigate why dispatch and this.reducer are needed
        root.dispatch(root.reducer.commands.init(initialState));
      };

      if (RootClass.elementName) {
        RootClass.register();
        const customElement = document.createElement(RootClass.elementName);
        customElement.props = {
          onLoad: container => init(container),
          onUnload: () => destroy(),
          styles: RootClass.styles,
        };
        container.appendChild(customElement);
      } else {
        const observer = new MutationObserver(mutations => {
          const isContainerRemoved = mutations.find(
              mutation => [...mutation.removedNodes].find(
                  node => node === container));
          if (isContainerRemoved) {
            destroy();
          }
        });
        if (container.parentElement) {
          observer.observe(container.parentElement, {
            childList: true,
          });
        }
        await init(container);
      }

      return root;
    }
  }

  module.exports = Toolkit;
}
