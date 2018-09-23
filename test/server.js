const path = require('path');
const express = require('express');

const app = express();

const PORT = 3033;

app.set('port', PORT);

app.use('/', express.static('test'));
app.use('/config', express.static('test/config'));
app.use('/src', express.static('src'));
app.use('/core', express.static('src/core'));
app.use('/loader', express.static('node_modules/lazy-module-loader'));

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  if (request.url.endsWith('.js')) {
    response.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  }
  return next();
});

const server = app.listen(app.get('port'), () => {
  console.log('---------------------------------------------------');
  console.log(` Running test server at: http://localhost:${PORT}`);
  console.log('---------------------------------------------------');
});
