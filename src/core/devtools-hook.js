{
  const apps = new Map();

  const DevToolsHook = class {

    static publishUpdate(app) {
      setTimeout(() => {
        window.postMessage({
          source: 'Reactor',
          type: 'update-app',
          data:  {
            appId: app.id,
          },
        }, '*');
      });
    }

    static describeApp(app) {
      return {
        name: app.root.constructor.name,
        id: app.id,
        path: app.path.toString().slice(7, -1),
      }
    }

    static describeProps(props) {
      return props;
    }

    static getPath(component) {
      const loaderEntry = loader.debug_.getModules()
        .find(([path, module]) => module === component.constructor);
      return location.href + loaderEntry[0] + '.js';
    }

    static describeComponent(component) {
      const description = {
        id: component.id,
        type: 'component',
        name: component.constructor.name,
        path: this.getPath(component),
        props: this.describeProps(component.props),
      };
      if (component.child) {
        description.children = [this.describeNode(component.child)];
      }
      return description;
    }

    static describeElement(element) {
      const description = {
        id: element.id,
        type: 'element',
        name: element.name,
        classNames: element.classNames,
      }
      if (element.children.length) {
        description.children = element.children.map(
          node => this.describeNode(node));
      }
      if (element.text) {
        description.text = element.text;
      }
      return description;
    }

    static describeNode(node) {
      if (node.isComponent()) {
        return this.describeComponent(node);
      }
      if (node.isElement()) {
        return this.describeElement(node);
      }
      return null;
    }

    static registerApp(app) {
      apps.set(app.id, app);
    }

    static getApps() {
      return Array.from(apps.values()).map(app => this.describeApp(app));
    }

    static getApp(appId) {
      const app = apps.get(appId);
      if (app) {
        return this.describeNode(app.root);
      }
      return null;
    }

    static getBoundingRect(appId, nodeId) {
      const element = this.getElement(appId, nodeId);
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        height: rect.height,
        width: rect.width,
      };
    }

    static getElement(appId, nodeId) {
      const app = apps.get(appId);
      if (app) {
        if (nodeId) {
          const node = app.root.findNode(nodeId);
          if (node.isElement()) {
            return node.ref;
          }
          if (node.isComponent()) {
            return node.childElement.ref;
          }
          return null;
        }
        return app.root.parentElement.ref;
      }
    }

    static getComponent(appId, nodeId) {
      const app = apps.get(appId);
      if (app) {
        const node = app.root.findNode(nodeId);
        if (node && node.isComponent()) {
          return node;
        }
      }
      return null;
    }

    static getComponentName(appId, nodeId) {
      const component = this.getComponent(appId, nodeId);
      if (component) {
        return component.constructor.name;
      }
    }

    static getRenderFunction(appId, nodeId) {
      const component = this.getComponent(appId, nodeId);
      if (component) {
        return component.context.render;
      }
    }

    static reloadApps() {
      for (const app of Array.from(apps.values())) {
        app.reload();
      }
    }
  };

  module.exports = DevToolsHook;
}