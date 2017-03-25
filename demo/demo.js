window.renderDemo = async (container) => {

  const DemoApp = loader.symbol('components/demo-app');

  // create new app
  const demo = Reactor.create(DemoApp);

  // preload all resources
  await demo.preload();

  // render in body element
  await demo.render(container);
};
