window.renderDemoApp = async () => {
  const DemoApp = require.defer('demo/components/demo-app');
  await Reactor.render(DemoApp, document.body).then(() => {
    console.log('(demo) Rendering done')
  });
};
