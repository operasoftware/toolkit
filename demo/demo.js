window.renderDemoApp = async () => {

  const DemoApp = require.defer('demo/components/demo-app');
  const store = {};

  // create new app
  const demo = Reactor.create(DemoApp).init(store);

  // preload all resources
  await demo.preload();

  // render in body element
  await demo.render(document.body);
};
