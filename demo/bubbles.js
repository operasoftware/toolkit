window.renderBubbles = async (container) => {

  const BubblesApp = loader.symbol('bubbles/bubbles-app');

  // create new app
  const bubbles = opr.Toolkit.create(BubblesApp);

  // preload all resources
  await bubbles.preload();

  // render in body element
  await bubbles.render(container);
};
