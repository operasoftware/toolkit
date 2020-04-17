require('./test/config/init.js');

module.exports = {
  colors: true,
  diff: true,
  extension: ['.js'],
  package: './package.json',
  reporter: 'spec',
  slow: 250,
  sort: true,
  timeout: 2000,
  ui: 'bdd',
  'watch-files': ['src/**/*.js', 'test/**/*.js'],
};
