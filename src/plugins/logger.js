{
  const RENDER_TIME = 'Render time';
  const title = update => `==> ${update.root.constructor.displayName} <==`;

  /* eslint-disable no-console */

  const Logger = {

    name: 'logger',
    permissions: ['listen-for-updates'],

    onBeforeUpdate(update) {
      console.group(title(update));
      console.log('Command:', update.command.type);
      console.time(RENDER_TIME);
    },

    onAfterUpdate(update) {
      if (update.patches.length) {
        console.log('%cPatches:', 'color: hsl(54, 70%, 45%)', update.patches);
      } else {
        console.log('%c=> No update', 'color: #07a707');
      }
      console.timeEnd(RENDER_TIME);
      console.log('--------------------------------');
      console.groupEnd(title(update));
    },
  };

  /* eslint-enable no-console */

  module.exports = Logger;
}
