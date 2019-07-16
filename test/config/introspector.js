const introspect = async () => {

  await loadToolkit();
  mocha.setup('bdd');

  opr.Toolkit.configure({
     plugins: [],
     debug: true,
  });

  const esImport = path => eval(`import ('${path}')`);
  const loadTest = async name => await esImport(`/functional/${name}.test.js`);

  await loadTest('attributes');

  mocha.checkLeaks();
  mocha.run();
};

introspect();
