{
  const CREATE = Symbol('create');
  const MOVE = Symbol('move');
  const DESTROY = Symbol('destroy');

  const addLogo = (state, logo) => ({
    ...state,
    logos: [
      ...state.logos,
      createLogo(logo, {
        highlighted: false,
      }),
    ],
  });

  const updateLogos = (state, createLogo) => ({
    ...state,
    logos: state.logos.map(logo => createLogo(logo)),
  });

  const createLogo = props => ({...props});

  const reducer = (state, command) => {
    switch (command.type) {
      case CREATE:
        return addLogo(state, command.logo);
      case MOVE:
        return updateLogos(
            state,
            logo => createLogo(logo, command.positions[logo.id]));
      case DESTROY:
        return {
          ...state,
          logos: state.logos.filter(logo => logo.id !== command.id),
        };
      default:
        return state;
    }
  };

  reducer.commands = {
    create: logo => ({
      type: CREATE,
      logo,
    }),
    move: positions => ({
      type: MOVE,
      positions,
    }),
    destroy: id => ({
      type: DESTROY,
      id,
    }),
  };

  module.exports = reducer;
}
