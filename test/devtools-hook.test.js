describe('DevTools Hook', () => {

  const DevToolsHook = Reactor.__devtools_hook__;

  it('returns the description of apps', () => {

    // given
    const id = 'lets-assume-this-is-uuid'
    const path = Symbol('path/to/app');
    const app = {
      id,
      path,
      root: {
        constructor: {
          name: 'App'
        }
      }
    };
    DevToolsHook.registerApp(app);

    // when
    const apps = DevToolsHook.getApps();

    // then
    assert.equal(apps.length, 1);
    assert.equal(apps[0].id, id);
    assert.equal(apps[0].path, 'path/to/app');
    assert.equal(apps[0].name, 'App');
  });
});