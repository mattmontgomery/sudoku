import React, { PureComponent } from "react";
import Input from "./Input";

const KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  PENCIL_SWITCH: ["p"]
};

export default class Grid extends PureComponent {
  static defaultProps = {
    range: 9
  };
  componentDidMount() {
    window.addEventListener("keydown", this.arrowListener);
    window.addEventListener("keyup", this.inputListener);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.arrowListener);
    window.removeEventListener("keyup", this.inputListener);
  }
  getWrappedNumber = (idx, dir) => {
    if (dir === 1) {
      return idx + 1 >= this.props.range ? 0 : idx + 1;
    } else if (dir === -1) {
      return idx - 1 < 0 ? this.props.range - 1 : idx - 1;
    }
  };
  inputListener = ev => {
    if (Number.isNaN(parseInt(ev.key)) || ev.key === "0") {
      return;
    }
    if (this.props.mode === "pencil") {
      this.props.onSetPossible(
        this.props.selected[0],
        this.props.selected[1],
        parseInt(ev.key)
      );
    } else {
      this.props.onChange(
        this.props.selected[0],
        this.props.selected[1],
        ev.key
      );
    }
  };
  arrowListener = ev => {
    if ([KEYS.LEFT, KEYS.UP, KEYS.RIGHT, KEYS.DOWN].includes(ev.which)) {
      ev.preventDefault();
      ev.stopPropagation();
      switch (ev.which) {
        case KEYS.LEFT:
          this.props.setSelected([
            this.props.selected[0],
            this.getWrappedNumber(this.props.selected[1], -1)
          ]);
          break;
        case KEYS.UP:
          this.props.setSelected([
            this.getWrappedNumber(this.props.selected[0], -1),
            this.props.selected[1]
          ]);
          break;
        case KEYS.RIGHT:
          this.props.setSelected([
            this.props.selected[0],
            this.getWrappedNumber(this.props.selected[1], 1)
          ]);
          break;
        case KEYS.DOWN:
          this.props.setSelected([
            this.getWrappedNumber(this.props.selected[0], 1),
            this.props.selected[1]
          ]);
          break;
      }
      return;
    } else if (KEYS.PENCIL_SWITCH.includes(ev.key)) {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onTogglePencil();
    }
  };
  render() {
    return (
      <div
        className="Grid"
        style={{
          fontFamily: "monospace",
          display: "grid",
          gridTemplateColumns: `repeat(9, 1fr)`,
          width: "750px"
        }}
      >
        <style>
          {`.Grid > div > div:nth-of-type(3n) { border-bottom: 4px solid black; }`}
          {`.Grid > div > div:last-of-type { border-bottom: 0; }`}
          {`.Grid > div:nth-of-type(3n) { border-right: 4px solid black; }`}
          {`.Grid > div:last-of-type { border-right: none; }`}
        </style>
        {this.props.grid.map((columns, y) => (
          <div key={y}>
            {columns.map((_row, x) => (
              <div
                key={x}
                style={{
                  textAlign: "center",
                  verticalAlign: "middle"
                }}
              >
                <Input
                  disabled={this.props.solved}
                  error={this.props.errors.indexOf(`${x}:${y}`) > -1}
                  highlighted={
                    this.props.selected[0] === x || this.props.selected[1] === y
                  }
                  mode={this.props.mode}
                  onChange={(value, ev) => this.props.onChange(x, y, value, ev)}
                  pencilValues={
                    this.props.possible[`${x}:${y}`]
                      ? this.props.possible[`${x}:${y}`]
                      : []
                  }
                  prefilled={!!this.props.baseGrid[y][x]}
                  selected={
                    this.props.selected[0] === x && this.props.selected[1] === y
                  }
                  setSelected={() => this.props.setSelected([x, y])}
                  tabIndex={x * 10 + y + 1}
                  value={this.props.grid[y][x]}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
