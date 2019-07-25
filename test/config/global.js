const isBrowser = typeof window === 'object';

const $global = isBrowser ? window : global;

const container = document.createElement('main');

$global.createFromTemplate = (template, parent) =>
    opr.Toolkit.VirtualDOM.createFromDescription(
        opr.Toolkit.Template.describe(template), parent);

$global.createRootInstance = RootClass => {
  const {
    Template,
    VirtualDOM,
  } = opr.Toolkit;
  const description = Template.describe([RootClass]);
  const root = VirtualDOM.createWebComponent(description, null, null, false);
  root.container = container;
  return root;
};

$global.createWebComponent = async WebComponent => {
  const instance = createRootInstance(WebComponent);
  const container = document.createElement('main');
  await instance.init(container);
  return instance;
};

$global.createRoot = (template = null, container) => {
  const {
    Template,
    VirtualDOM,
  } = opr.Toolkit;
  class Root extends opr.Toolkit.Root {
    render() {
      return template;
    }
  }
  const root = createRootInstance(Root);
  root.container = document.createElement('main');
  const node = VirtualDOM.createFromDescription(Template.describe(template));
  if (node) {
    root.insertChild(node);
  }
  return root;
};

$global.createComponent = (template = null) => {
  class Component extends opr.Toolkit.Component {
    render() {
      return template;
    }
  }
  return createFromTemplate([Component]);
};
