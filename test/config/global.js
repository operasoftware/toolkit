const isBrowser = typeof window === 'object';

const $global = isBrowser ? window : global;

$global.createFromTemplate = (template, parent) =>
    opr.Toolkit.VirtualDOM.createFromDescription(
        opr.Toolkit.Template.describe(template), parent);

$global.createRootInstance = RootClass => {
  const {
    Template,
    VirtualDOM,
  } = opr.Toolkit;
  const description = Template.describe([RootClass]);
  return VirtualDOM.createRoot(description, null, false);
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
