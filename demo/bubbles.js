window.renderBubbles = async (container) => {

  // create new app
  const bubbles = opr.Toolkit.create('bubbles/bubbles-app');

  // preload all resources
  await bubbles.preload();

  // render in body element
  await bubbles.render(container);
};
