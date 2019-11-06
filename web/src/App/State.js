export function reducer(state, { type, payload }) {
  switch (type) {
    case actions.PUZZLE_SET:
      return {
        ...state,
        puzzle: payload,
        solved:
          JSON.stringify(payload.puzzle) === JSON.stringify(state.solution)
      };
    case actions.MULTI_SET:
      return { ...state, ...payload };
    case actions.PENCIL_SET:
      return {
        ...state,
        pencil: {
          ...state.pencil,
          ...payload
        }
      };
    case actions.CHECK_SOLVED:
      return state.solved
        ? state
        : {
            ...state,
            solved: false
          };
    default:
      return state;
  }
}
export const defaultState = localStorageItems => ({
  puzzle: null,
  base: null,
  pencil: {},
  solution: null,
  ...localStorageItems
});
export const localStorageKeys = {
  puzzle: "puzzle",
  base: "puzzle:base",
  solution: "puzzle:solution",
  pencil: "puzzle:pencil"
};

export const actions = {
  PUZZLE_SET: "PUZZLE_SET",
  MULTI_SET: "MULTI_SET",
  PENCIL_SET: "PENCIL_SET",
  CHECK_SOLVED: "CHECK_SOLVED"
};
