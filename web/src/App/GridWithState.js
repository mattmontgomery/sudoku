import React, { useEffect, useState, useReducer } from "react";
import Grid from "./Grid";
import Generator from "./Generator";
import { reducer, defaultState, localStorageKeys, actions } from "./State";

const DEBUG = true;
function debug(...message) {
  if (DEBUG) {
    console.log(...message);
  }
}

export default function GridWithState() {
  const [state, dispatch] = useReducer(
    reducer,
    defaultState(
      Object.keys(localStorageKeys).reduce((acc, curr) => {
        acc[curr] = !!window.localStorage.getItem(localStorageKeys[curr])
          ? JSON.parse(window.localStorage.getItem(localStorageKeys[curr]))
          : null;
        return acc;
      }, {})
    )
  );
  const [grid] = useState(new Generator(null, state.puzzle));
  const [pencil, setPencilState] = useState(false);
  const [selected, setSelected] = useState([0, 0]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    Object.entries(localStorageKeys).forEach(([key, val]) => {
      window.localStorage.setItem(val, JSON.stringify(state[key]));
    });
    window.state = state;
    dispatch({ type: actions.CHECK_SOLVED });
  });

  return (
    <div>
      <div>
        <button onClick={() => setPencilState(!pencil)}>{`${
          pencil ? "Fill" : "Pencil"
        } mode`}</button>
      </div>
      <div>
        <Grid
          baseGrid={state.base}
          errors={errors}
          grid={state.puzzle}
          mode={pencil ? "pencil" : "pen"}
          onChange={(x, y, value) => {
            // const isLegal = grid.isLegal(x, y, value);
            const isInBase = state.base[y][x];
            if (!isInBase) {
              dispatch({
                type: actions.PUZZLE_SET,
                payload: grid.setGridValue(x, y, value).getGrid()
              });
              const solution = grid.isSolvable();
              if (solution) {
                // debug(`This is a solvable grid: ${solution}`);
                setErrors([]);
              } else {
                debug(`This is no longer a solvable grid`);
                if (errors.indexOf(`${x}:${y}`) === -1) {
                  setErrors([...errors, `${x}:${y}`]);
                }
              }
            }
          }}
          onSetPossible={(x, y, value) => {
            const key = `${x}:${y}`;
            const currentPossible = Array.isArray(state.pencil[key])
              ? state.pencil[key]
              : [];
            dispatch({
              type: actions.PENCIL_SET,
              payload: {
                [key]: currentPossible.includes(value)
                  ? currentPossible.filter(i => i !== value)
                  : [...currentPossible, value]
              }
            });
          }}
          onTogglePencil={() => setPencilState(!pencil)}
          possible={state.pencil}
          selected={selected}
          setSelected={setSelected}
          solved={state.solved}
        />
      </div>
      <div>
        <button
          onClick={() => {
            const newGrid = grid.build(0);
            dispatch({
              type: actions.MULTI_SET,
              payload: {
                puzzle: newGrid,
                solution: grid.solution,
                base: newGrid,
                pencil: {}
              }
            });
          }}
        >
          {"Generate easy"}
        </button>
        <button
          onClick={() => {
            const newGrid = grid.build(1);
            dispatch({
              type: actions.MULTI_SET,
              payload: {
                puzzle: newGrid,
                solution: grid.solution,
                base: newGrid,
                pencil: {}
              }
            });
          }}
        >
          {"Generate med"}
        </button>
        <button
          onClick={() => {
            const newGrid = grid.build(2);
            dispatch({
              type: actions.MULTI_SET,
              payload: {
                puzzle: newGrid,
                solution: grid.solution,
                base: newGrid,
                pencil: {}
              }
            });
          }}
        >
          {"Generate hard"}
        </button>
        <button
          onClick={() => {
            const newGrid = grid.build(3);
            dispatch({
              type: actions.MULTI_SET,
              payload: {
                puzzle: newGrid,
                solution: grid.solution,
                base: newGrid,
                pencil: {}
              }
            });
          }}
        >
          {"Generate real tough"}
        </button>
        <button
          onClick={() => {
            const newGrid = grid.build(4);
            dispatch({
              type: actions.MULTI_SET,
              payload: {
                puzzle: newGrid,
                solution: grid.solution,
                base: newGrid,
                pencil: {}
              }
            });
          }}
        >
          {"Generate god-like"}
        </button>
        <button
          onClick={() => {
            const newGrid = grid.build(5);
            dispatch({
              type: actions.MULTI_SET,
              payload: {
                puzzle: newGrid,
                solution: grid.solution,
                base: newGrid,
                pencil: {}
              }
            });
          }}
        >
          {"Generate insane"}
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            localStorage.clear();
            dispatch({
              type: actions.PUZZLE_SET,
              payload: Generator.getEmptyGrid()
            });
          }}
        >
          {"Clear"}
        </button>
      </div>
    </div>
  );
}
