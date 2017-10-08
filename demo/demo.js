window.renderDemo = async (container) => {

  // create new app
  const demo = opr.Toolkit.create('bubbles/bubbles-app');

  // preload all resources
  await demo.preload();

  // render in body element
  await demo.render(container);
};
