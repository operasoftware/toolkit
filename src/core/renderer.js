/*
Copyright 2017-2019 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

{
  const Renderer = {

    /*
     * Calls the component render method and transforms the returned template
     * into the normalised description of the rendered node.
     */
    render(component, props = {}, children = []) {
      component.sandbox.props = props;
      component.sandbox.children = children;
      const template = component.render.call(component.sandbox);
      if (template) {
        return opr.Toolkit.Template.describe(template);
      }
      const text = component.constructor.displayName;
      return new opr.Toolkit.Description.CommentDescription(text);
    },

    /*
     * Updates the Web component and patches the DOM tree
     * to match the new component state.
     */
    update(root, from, to, command) {

      const update = {
        command,
        root,
        state: {
          from,
          to,
        },
      };
      root.state.update(to);

      this.onBeforeUpdate(update, root);

      const diff = new opr.Toolkit.Diff(root, from, to);
      update.patches = diff.apply();

      this.onAfterUpdate(update, root);
    },

    /*
     * Notifies the observers about upcoming update.
     */
    onBeforeUpdate(update, root) {
      root.plugins.notify('before-update', update);
    },

    /*
     * Notifies the observers about completed update.
     */
    onAfterUpdate(update, root) {
      root.plugins.notify('after-update', update);
    },

    /**
     * Creates a new Custom Element instance assigned to specifed Web Component.
     */
    createCustomElement(root) {
      const defineCustomElementClass = RootClass => {
        let ElementClass = customElements.get(RootClass.elementName);
        if (!ElementClass) {
          ElementClass = class RootElement extends ComponentElement {};
          customElements.define(RootClass.elementName, ElementClass);
          RootClass.prototype.elementClass = ElementClass;
        }
        return ElementClass;
      };
      const ElementClass = defineCustomElementClass(root.constructor);
      const customElement = new ElementClass(root);
      addPluginsAPI(customElement);
      return customElement;
    },

    /*
     * Creates a new DOM Element based on the specified description.
     */
    createElement(description) {
      const element = document.createElement(description.name);
      if (description.text) {
        element.textContent = description.text;
      }
      if (description.class) {
        element.className = description.class;
      }
      if (description.style) {
        for (const [prop, value] of Object.entries(description.style)) {
          if (prop.startsWith('--')) {
            element.style.setProperty(prop, ` ${value}`);
          } else {
            element.style[prop] = value;
          }
        }
      }
      if (description.listeners) {
        for (const [name, listener] of Object.entries(description.listeners)) {
          const event = opr.Toolkit.utils.getEventName(name);
          element.addEventListener(event, listener);
        }
      }
      if (description.attrs) {
        for (const [attr, value] of Object.entries(description.attrs)) {
          const name = opr.Toolkit.utils.getAttributeName(attr);
          element.setAttribute(name, value);
        }
      }
      if (description.dataset) {
        for (const [attr, value] of Object.entries(description.dataset)) {
          element.dataset[attr] = value;
        }
      }
      if (description.properties) {
        for (const [prop, value] of Object.entries(description.properties)) {
          element[prop] = value;
        }
      }
      if (description.custom) {
        if (description.custom.attrs) {
          const customAttributes = Object.entries(description.custom.attrs);
          for (const [name, value] of customAttributes) {
            element.setAttribute(name, value);
          }
        }
        if (description.custom.listeners) {
          const customListeners = Object.entries(description.custom.listeners);
          for (const [event, listener] of customListeners) {
            element.addEventListener(event, listener);
          }
        }
      }
      return element;
    },
  };

  const cssImports = paths =>
      paths.map(loader.path).map(path => `@import url(${path});`).join('\n');

  class ComponentElement extends HTMLElement {

    constructor(root) {

      super();
      this.$root = root;

      addPluginsAPI(this);

      root.shadow = this.attachShadow({
        mode: 'open',
      });

      const stylesheets = root.getStylesheets();

      const onSuccess = () => {
        root.init();
      };

      if (stylesheets && stylesheets.length) {

        const imports = cssImports(stylesheets);

        const onError = () => {
          throw new Error(
              `Error loading stylesheets: ${stylesheets.join(', ')}`);
        };

        if (opr.Toolkit.isDebug()) {

          const style = document.createElement('style');
          style.textContent = imports;
          style.onload = onSuccess;
          style.onerror = onError;
          root.shadow.appendChild(style);

        } else {

          if (root.constructor.adoptedStyleSheet) {
            root.constructor.adoptedStyleSheet.then(sheet => {
              root.shadow.adoptedStyleSheets = [sheet];
              onSuccess();
            });
          } else {
            let onSheetConstructed;
            root.constructor.adoptedStyleSheet = new Promise(resolve => {
              onSheetConstructed = resolve;
            })
            root.sheet = new CSSStyleSheet();
            root.sheet.replace(imports)
                .then(sheet => {
                  root.shadow.adoptedStyleSheets = [sheet];
                  onSheetConstructed(sheet);
                  onSuccess();
                })
                .catch(onError);
          }
        }

      } else {
        onSuccess();
      }
    }

    get isComponentElement() {
      return true;
    }

    connectedCallback() {
      clearTimeout(this.pendingDestruction);
    }

    disconnectedCallback() {
      this.pendingDestruction = setTimeout(() => this.destroy(), 50);
    }

    destroy() {
      const Lifecycle = opr.Toolkit.Lifecycle;
      const root = this.$root;
      Lifecycle.onComponentDestroyed(root);
      Lifecycle.onComponentDetached(root);
      root.ref = null;
      this.$root = null;
    }
  }

  const addPluginsAPI = element => {
    const {
      Plugin,
    } = opr.Toolkit.Plugins;
    element.install = (plugin, cascade = true) => {
      const installTo = root => {
        if (plugin instanceof Plugin) {
          root.plugins.use(plugin);
        } else {
          root.plugins.install(plugin);
        }
        if (cascade) {
          for (const subroot of root.subroots) {
            installTo(subroot);
          }
        }
      };
      installTo(element.$root);
    };
    element.uninstall = (plugin, cascade = true) => {
      const name = typeof plugin === 'string' ? plugin : plugin.name;
      const uninstallFrom = root => {
        root.plugins.uninstall(name);
        if (cascade) {
          for (const subroot of root.subroots) {
            uninstallFrom(subroot);
          }
        }
      };
      uninstallFrom(element.$root);
    };
  }

  module.exports = Renderer;
}
