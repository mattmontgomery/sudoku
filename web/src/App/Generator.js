import Solver from "./Solver";

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default class Generator {
  grid = [];
  givens = [62, 53, 44, 35, 26, 17];
  range = 9;
  difficulty = 0;
  solution = [];
  static getEmptyGrid() {
    return [
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null]
    ];
  }
  static getBaseGrid() {
    return [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 1, 4, 3, 6, 5, 8, 9, 7],
      [3, 6, 5, 8, 9, 7, 2, 1, 4],
      [8, 9, 7, 2, 1, 4, 3, 6, 5],
      [5, 3, 1, 6, 4, 2, 9, 7, 8],
      [6, 4, 2, 9, 7, 8, 5, 3, 1],
      [9, 7, 8, 5, 3, 1, 6, 4, 2]
    ];
  }
  constructor(difficulty = 0, presetBoard) {
    this.setGrid(Generator.getBaseGrid().map(col => col.map(cell => cell)));
    this.difficulty = difficulty;
    if (presetBoard) {
      this.setGrid(presetBoard.map(col => col.map(cell => cell)));
    }
  }
  build(difficulty) {
    console.time("puzzle:build");
    let solvable = false;
    let iterations = 0;
    this.difficulty = difficulty;
    while (!solvable && ++iterations < 150) {
      this.setGrid(Generator.getBaseGrid().map(col => col.map(cell => cell)));
      this.randomize();
      this.solution = this.getGrid();
      this.reduceSquares();
      solvable = this.isSolvable();
    }
    console.timeEnd("puzzle:build");
    return this.getGrid();
  }
  randomize(iterations = 500) {
    for (let i = 0; i < iterations; i++) {
      const action = getRandomInt(0, 4);
      const block = getRandomInt(0, 2) * 3;
      const options = shuffle([0, 1, 2]);
      const piece1 = options[0];
      const piece2 = options[1];
      try {
        switch (action) {
          case 0:
            this.swapGridRows(block + piece1, block + piece2);
            break;
          case 1:
            this.swapGridColumns(block + piece1, block + piece2);
            break;
          case 2:
            this.swapGridStack(piece1, piece2);
            break;
          case 3:
            this.swapGridBand(piece1, piece2);
            break;
        }
      } catch (e) {
        //console.log(`failed: ${action}`, e);
      }
    }
  }
  getAllGridPositions() {
    const grid = [];
    for (let x = 0; x < 9; x++) {
      for (let y = 0; y < 9; y++) {
        grid.push([x, y]);
      }
    }
    return grid;
  }
  getRandomGridPositions() {
    return shuffle(this.getAllGridPositions());
  }
  getSingleCandidatePositions() {
    const candidates = this.getPossibles();
    return this.getAllGridPositions().filter(
      ([x, y]) => candidates[y][x].length === 1
    );
  }
  reduceSquares() {
    const givenDifficulty = this.givens[this.difficulty];
    let trimmed = 0;
    let givens = this.getFlatGrid()
      .split("")
      .filter(i => i !== ".").length;
    let iterations = 0;
    while (givens > givenDifficulty && iterations < 100) {
      const randomlySelected = shuffle(this.getSingleCandidatePositions())[0];
      this.grid[randomlySelected[1]][randomlySelected[0]] = null;
      givens = this.getFlatGrid()
        .split("")
        .filter(i => i !== ".").length;
      iterations++;
    }
  }
  setGrid(grid) {
    this.grid = grid;
  }
  swapGridColumns(y1, y2, allowNonFamilialSwap = false) {
    if (!allowNonFamilialSwap && Math.floor(y1 / 3) !== Math.floor(y2 / 3)) {
      throw "attempted non-familial column swap";
    }
    for (let i = 0; i < this.range; i++) {
      const firstValue = this.grid[y1][i];
      this.grid[y1][i] = this.grid[y2][i];
      this.grid[y2][i] = firstValue;
    }
  }
  swapGridRows(x1, x2, allowNonFamilialSwap = false) {
    if (!allowNonFamilialSwap && Math.floor(x1 / 3) !== Math.floor(x2 / 3)) {
      throw "attempted non-familial row swap";
    }
    for (let i = 0; i < this.range; i++) {
      const firstValue = this.grid[i][x1];
      this.grid[i][x1] = this.grid[i][x2];
      this.grid[i][x2] = firstValue;
    }
  }
  swapGridStack(stack1, stack2) {
    for (let i = 0; i < 3; i++) {
      this.swapGridColumns(stack1 * 3 + i, stack2 * 3 + i, true);
    }
  }
  swapGridBand(band1, band2) {
    for (let i = 0; i < 3; i++) {
      this.swapGridColumns(band1 * 3 + i, band2 * 3 + i, true);
    }
  }
  setGridValue(x, y, value) {
    this.grid[y][x] = value;
    return this;
  }
  /**
   * Returns a new copy of the grid
   */
  getGrid() {
    return this.grid.map(col => col.map(cell => cell));
  }
  getFlatGrid() {
    return this.grid.map(col => col.map(i => (i ? i : ".")).join("")).join("");
  }
  getPossibles() {
    return this.grid.map((col, y) =>
      col.map((cell, x) => {
        if (!cell) {
          return this.getPossibleForCell(x, y);
        } else {
          return [cell];
        }
      })
    );
  }
  getPossibleForCell(x, y) {
    const possible = [];
    for (let i = 1; i <= this.range; i++) {
      if (this.isLegal(x, y, i)) {
        possible.push(i);
      }
    }
    return possible;
  }
  isLegal(x, y, value) {
    /** Value exists in column */
    if (this.grid[y][x] === value) {
      return true;
    }
    if (Number.isNaN(value) || value > 9) {
      return false;
    }
    if (
      this.grid[y].some(cell => {
        return cell === value;
      })
    ) {
      return false;
    }
    /** Value exists in row */
    if (
      this.grid.some(col => {
        return col[x] === value;
      })
    ) {
      return false;
    }
    const block = Math.floor(y / 3);
    const band = Math.floor(x / 3);
    if (
      this.grid.slice(block * 3, block * 3 + 3).some(col => {
        return col.slice(band * 3, band * 3 + 3).some(cell => cell === value);
      })
    ) {
      return false;
    }
    return true;
  }
  isImpossible() {
    return this.getPossibles().some(col =>
      col.some(cell => Array.isArray(cell) && cell.length === 0)
    );
  }
  isSolvable() {
    const solver = new Solver();
    const solved = solver.solve(this.getFlatGrid());
    const solvedReverse = solver.solve(this.getFlatGrid(), true);
    // if (solved && solvedReverse !== solved) {
    //   console.error({ solved, solvedReverse });
    // }
    return solved && solvedReverse === solved;
  }
}
