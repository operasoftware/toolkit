(async () => {
  opr.Toolkit.configure({
    debug: false,
  });
  await opr.Toolkit.render('src/demo', document.querySelector('#left'));
  await opr.Toolkit.render('src/demo', document.querySelector('#right'));
})();
