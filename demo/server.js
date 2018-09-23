const path = require('path');
const express = require('express');

const app = express();

const PORT = 3030;

app.set('port', PORT);

app.use('/', express.static('demo'));
app.use('/loader', express.static('node_modules/lazy-module-loader'));
app.use('/src', express.static('src'));
app.use('/core', express.static('src/core'));
app.use('/plugins', express.static('src/plugins'));
app.use('/demo', express.static('demo/src'));
app.use('/images', express.static('demo/images'));
app.use('/styles', express.static('demo/styles'));
app.use('/dist', express.static('dist'));
app.use('/test', express.static('test'));

const server = app.listen(app.get('port'), () => {
  console.log('-----------------------------------------------------------');
  console.log(` Running Opera Toolkit demo on port ${PORT}:`);
  console.log('-----------------------------------------------------------');
  console.log(` - debug:   http://localhost:${PORT}/debug/`);
  console.log(` - release: http://localhost:${PORT}/release/`);
  console.log('-----------------------------------------------------------');
});
