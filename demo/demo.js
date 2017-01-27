window.renderDemoApp = async () => {

  // TODO: should this below create an instance or resolve after fetching dependencies?
  // const DemoApp = await require('components/demo-app');

  const DemoApp = require.defer('components/demo-app');
  const store = {
    getState: () => ({
      items: Array(1000).fill('').map((item, index) => 'Item ' + (index + 1))
    })
  };

  // create new app
  const demo = Reactor.create(DemoApp);

  // preload all resources
  await demo.preload();

  // render in body element
  await demo.render(document.body);
};
