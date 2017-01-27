{
  const settings = {
    getState: () => {
      const items = [];
      for (let i = 1; i <= 1000; i++) {
        items.push({
          label: 'Item ' + i,
          highlighted: false
        })
      }
      return items;
    }
  };

  module.exports = settings;
}
