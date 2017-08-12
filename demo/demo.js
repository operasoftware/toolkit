window.renderDemo = async (container) => {

  // create new app
  const demo = opr.Toolkit.create('components/demo-app');

  // preload all resources
  await demo.preload();

  // render in body element
  await demo.render(container);
};
