const {Template, Renderer, VirtualDOM} = opr.Toolkit;

const container = document.createElement('container');
const settings = {
  plugins: [],
};

class RootComponent extends opr.Toolkit.Root {};

const root = new RootComponent({}, container, settings);

class Utils {

  static createFromTemplate(template) {
    const description = Template.describe(template);
    if (description === null) {
      return null;
    }
    const node = VirtualDOM.createFromDescription(
        description, root, root);
    if (node.isComponent()) {
      node.props = description.props;
    }
    return node;
  }

  static createDescription(template) {
    return Template.describe(template);
  }

  static createRoot() {
    return new RootComponent({}, container, settings);
  }
};

module.exports = Utils;
