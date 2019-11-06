/*
    Sudoku.js
    ---------

    A Sudoku puzzle generator and solver JavaScript library.

    Please see the README for more details.
*/
const root = {};

import Sudoku from "./sudoku";
const sudoku = new Sudoku(root);

export default class Solver {
  MIN_GIVENS = 17;
  BLANK_CHAR = ".";
  DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  MAX_SIZE = 81;
  SQUARES = null;
  UNITS = null;
  ROWS = "ABCDEFGHI"; // Row lables
  COLS = this.DIGITS; // Column lables
  SQUARE_UNITS_MAP = null;
  SQUARE_PEERS_MAP = null;
  board = "";
  validateBoard() {
    if (!this.board) {
      throw "Empty board";
    }

    // Invalid board length
    if (this.board.length !== this.MAX_SIZE) {
      throw "Invalid board size. Board must be exactly " +
        MAX_SIZE +
        " squares.";
    }

    if (
      this.board
        .split("")
        .some(i => i !== this.BLANK_CHAR && !this.DIGITS.includes(i.toString()))
    ) {
      console.error(this.board);
      throw "Invalid board character encountered";
    }
  }
  solve(board, reverse = false) {
    this.board = board;
    this.validateBoard();
    this.SQUARES = this.cross(this.ROWS, this.COLS);
    this.SQUARE_UNITS_MAP = this.getSquareUnitsMap(this.SQUARES, this.UNITS);
    this.SQUARE_PEERS_MAP = this.getSquarePeersMap(
      this.SQUARES,
      this.SQUARE_UNITS_MAP
    );

    // Check number of givens is at least MIN_GIVENS
    const numberGivens = board
      .split("")
      .filter(i => i !== this.BLANK_CHAR && this.DIGITS.includes(i.toString()))
      .length;
    if (numberGivens < this.MIN_GIVENS) {
      throw "Too few givens. Minimum givens is " + MIN_GIVENS;
    }

    const candidates = this.getCandidatesMap(this.board);
    console.log(
      this.getCandidatesMap(this.board)
      // sudoku._get_candidates_map(this.board)
    );
    const result = this.search(candidates, reverse);

    return result ? Object.values(result).join("") : false;
  }

  cross(a, b) {
    const result = [];
    for (let ai in a) {
      for (let bi in b) {
        result.push(a[ai] + b[bi]);
      }
    }
    return result;
  }
  getSquareUnitsMap(squares, units) {
    /* Return a map of `squares` and their associated units (row, col, box)
     */
    const square_unit_map = {};

    // For every square...
    for (let si in squares) {
      const cur_square = squares[si];

      // Maintain a list of the current square's units
      const cur_square_units = [];

      // Look through the units, and see if the current square is in it,
      // and if so, add it to the list of of the square's units.
      for (let ui in units) {
        const cur_unit = units[ui];

        if (cur_unit.indexOf(cur_square) !== -1) {
          cur_square_units.push(cur_unit);
        }
      }

      // Save the current square and its units to the map
      square_unit_map[cur_square] = cur_square_units;
    }

    return square_unit_map;
  }

  getSquarePeersMap(squares, units_map) {
    /* Return a map of `squares` and their associated peers, i.e., a set of
        other squares in the square's unit.
        */
    const square_peers_map = {};

    // For every square...
    for (let si in squares) {
      const cur_square = squares[si];
      const cur_square_units = units_map[cur_square];

      // Maintain list of the current square's peers
      const cur_square_peers = [];

      // Look through the current square's units map...
      for (let sui in cur_square_units) {
        const cur_unit = cur_square_units[sui];

        for (let ui in cur_unit) {
          const cur_unit_square = cur_unit[ui];

          if (
            cur_square_peers.indexOf(cur_unit_square) === -1 &&
            cur_unit_square !== cur_square
          ) {
            cur_square_peers.push(cur_unit_square);
          }
        }
      }

      // Save the current square an its associated peers to the map
      square_peers_map[cur_square] = cur_square_peers;
    }

    return square_peers_map;
  }
  getCandidatesMap() {
    this.validateBoard();

    const candidate_map = {};
    const squares_values_map = this.getSquareValuesMap();

    // Start by assigning every digit as a candidate to every square
    for (let si in this.SQUARES) {
      candidate_map[this.SQUARES[si]] = this.DIGITS.join("");
    }

    // For each non-blank square, assign its value in the candidate map and
    // propigate.
    for (let square in squares_values_map) {
      const val = squares_values_map[square];

      if (this.DIGITS.indexOf(val) > -1) {
        const new_candidates = this.assign(candidate_map, square, val);

        // Fail if we can't assign val to square
        if (!new_candidates) {
          return false;
        }
      }
    }

    return candidate_map;
  }
  getSquareValuesMap() {
    /* Return a map of squares -> values
     */
    const squares_vals_map = {};

    this.validateBoard();
    for (let i in this.SQUARES) {
      squares_vals_map[this.SQUARES[i]] = this.board[i];
    }

    return squares_vals_map;
  }
  assign(candidates, square, val) {
    /* Eliminate all values, *except* for `val`, from `candidates` at 
        `square` (candidates[square]), and propagate. Return the candidates map
        when finished. If a contradiciton is found, return false.
        
        WARNING: This will modify the contents of `candidates` directly.
        */

    // Grab a list of canidates without 'val'
    var other_vals = candidates[square].replace(val, "");

    // Loop through all other values and eliminate them from the candidates
    // at the current square, and propigate. If at any point we get a
    // contradiction, return false.
    for (var ovi in other_vals) {
      var other_val = other_vals[ovi];

      var candidates_next = sudoku._eliminate(
        candidates,
        square,
        other_val,
        (...args) => this.assign(...args)
      );

      if (!candidates_next) {
        //console.log("Contradiction found by _eliminate.");
        return false;
      }
    }

    return candidates;
  }
  eliminate(candidates, square, val) {
    /* Eliminate `val` from `candidates` at `square`, (candidates[square]),
        and propagate when values or places <= 2. Return updated candidates,
        unless a contradiction is detected, in which case, return false.
        
        WARNING: This will modify the contents of `candidates` directly.
        */

    // If `val` has already been eliminated from candidates[square], return
    // with candidates.
    if (!sudoku._in(val, candidates[square])) {
      return candidates;
    }

    // Remove `val` from candidates[square]
    candidates[square] = candidates[square].replace(val, "");
    candidates = {
      ...candidates,
      [square]: candidates[square]
    };

    // If the square has only candidate left, eliminate that value from its
    // peers
    var nr_candidates = candidates[square].length;
    if (nr_candidates === 1) {
      var target_val = candidates[square];

      for (var pi in this.SQUARE_PEERS_MAP[square]) {
        var peer = this.SQUARE_PEERS_MAP[square][pi];

        var candidates_new = this.eliminate(
          candidates,
          peer,
          target_val,
          assignFn
        );

        if (!candidates_new) {
          return false;
        }
      }

      // Otherwise, if the square has no candidates, we have a contradiction.
      // Return false.
    }
    if (nr_candidates === 0) {
      return false;
    }

    // If a unit is reduced to only one place for a value, then assign it
    for (var ui in this.SQUARE_UNITS_MAP[square]) {
      var unit = this.SQUARE_UNITS_MAP[square][ui];

      var val_places = [];
      for (var si in unit) {
        var unit_square = unit[si];
        if (sudoku._in(val, candidates[unit_square])) {
          val_places.push(unit_square);
        }
      }

      // If there's no place for this value, we have a contradition!
      // return false
      if (val_places.length === 0) {
        return false;

        // Otherwise the value can only be in one place. Assign it there.
      } else if (val_places.length === 1) {
        var candidates_new = assignFn(candidates, val_places[0], val);

        if (!candidates_new) {
          return false;
        }
      }
    }

    return candidates;
  }
  search(candidates, reverse = false) {
    /* Given a map of squares -> candiates, using depth-first search, 
        recursively try all possible values until a solution is found, or false
        if no solution exists. 
        */

    // Return if error in previous iteration
    if (!candidates) {
      return false;
    }

    // If only one candidate for every square, we've a solved puzzle!
    // Return the candidates map.
    let maxCandidates = 0;
    for (let si in this.SQUARES) {
      const square = this.SQUARES[si];

      const candidateLength = candidates[square].length;

      if (candidateLength > maxCandidates) {
        maxCandidates = candidateLength;
      }
    }
    if (maxCandidates === 1) {
      return candidates;
    }

    // Choose the blank square with the fewest possibilities > 1
    let minCandidates = 10;
    let minCandidatesSquare = null;
    for (let si in this.SQUARES) {
      const square = this.SQUARES[si];
      if (
        candidates[square].length < minCandidates &&
        candidates[square].length > 1
      ) {
        minCandidates = candidates[square].length;
        minCandidatesSquare = square;
      }
    }
    const minimumCandidates = candidates[minCandidatesSquare];
    if (!reverse) {
      for (let vi in minimumCandidates) {
        const val = minimumCandidates[vi];

        const candidatesCopy = { ...candidates };
        const candidates_next = this.search(
          this.assign(candidatesCopy, minCandidatesSquare, val)
        );

        if (candidates_next) {
          return candidates_next;
        }
      }

      // Rotate through the candidates backwards
    } else {
      for (let vi = minimumCandidates.length - 1; vi >= 0; --vi) {
        const val = minimumCandidates[vi];

        const candidatesCopy = { ...candidates };
        const candidates_next = this.search(
          this.assign(candidatesCopy, minCandidatesSquare, val),
          reverse
        );

        if (candidates_next) {
          return candidates_next;
        }
      }
    }

    // If we get through all combinations of the square with the fewest
    // candidates without finding an answer, there isn't one. Return false.
    return false;
  }
}
