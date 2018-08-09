const path = require('path');
const express = require('express');

const app = express();

const PORT = 3033;

app.set('port', PORT);

app.use('/', express.static('test'));
app.use('/src', express.static('src'));

const server = app.listen(app.get('port'), () => {
  console.log('---------------------------------------------------');
  console.log(` Running Mocha web tests at: http://localhost:${PORT}`);
  console.log('---------------------------------------------------');
});
