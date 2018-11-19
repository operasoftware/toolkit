(async () => {
  await loadToolkit();
  const logger = await loader.require('plugins/logger');
  opr.Toolkit.configure({
    debug: true,
    plugins: [logger],
  });
  await opr.Toolkit.render('src/demo', document.querySelector('#left'));
  await opr.Toolkit.render('src/demo', document.querySelector('#right'));
})();
