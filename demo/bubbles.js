window.renderBubbles = async (container) => {

  const BubblesApp = require.def('demo/components/bubbles-app');

  // create new app
  const bubbles = Reactor.create(BubblesApp);

  // preload all resources
  await bubbles.preload();

  // render in body element
  await bubbles.render(container);
};
