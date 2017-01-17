// const loader = require('../src/script-loader.js');

describe.skip('Script loader', () => {

  it('defines the loadScript() function', () => {
    assert(typeof global.loadComponent === 'function');
  });

  it.skip('attaches the script element to head', () => {

    const loadedComponent = {};

    global.getFilePath = sinon.stub.returns('/file/path');
    global.window = {
      lastExport: loadedComponent
    };

    const scriptElement = {
      setAttribute: sinon.stub()
    };
    
    global.document = {
      createElement: sinon.stub().returns(scriptElement),
      head: {
        appendChild: sinon.stub()
      }
    }

    appendScript('/path/to/component/root/');

    assert(document.createElement.called);
    assert(document.head.appendChild.called);
    assert(getFilePath.called);

    // assert(scriptElement.setAttribute.called);
  });

});
