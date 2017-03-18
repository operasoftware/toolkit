{
  const apps = new Map();

  const DevToolsHook = class {

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

    static describeComponent(component) {
      const description = {
        type: 'component',
        name: component.constructor.name,
        props: this.describeProps(component.props),
      };
      if (component.child) {
        description.children = [this.describeNode(component.child)];
      }
      return description;
    }

    static describeElement(element) {
      const description = {
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

    static getApp(uuid) {
      const app = apps.get(uuid);
      if (app) {
        return this.describeNode(app.root);
      }
      return null;
    }

    static getBoundingRect(uuid) {
      const element = this.getElement(uuid);
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        height: rect.height,
        width: rect.width,
      };
    }

    static getElement(uuid) {
      const app = apps.get(uuid);
      if (app) {
        return app.root.parentElement.ref;
      }
    }
  };

  module.exports = DevToolsHook;
}