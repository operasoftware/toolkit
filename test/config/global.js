global.createFromTemplate = (template, root) =>
    opr.Toolkit.VirtualDOM.createFromDescription(
        opr.Toolkit.Template.describe(template), root
    );

global.createRoot = (template = null, container) => {
  const {
    Template,
    VirtualDOM,
  } = opr.Toolkit;
  class Root extends opr.Toolkit.Root {
    render() {
      return template;
    }
  }
  const root = VirtualDOM.createRoot(Root);
  root.container = document.createElement('main');
  const node = VirtualDOM.createFromDescription(Template.describe(template));
  if (node) {
    root.appendChild(node);
  }
  return root;
};

global.createComponent = (template = null) => {
  class Component extends opr.Toolkit.Component {
    render() {
      return template;
    }
  }
  return createFromTemplate([Component]);
};
