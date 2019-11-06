import React, { PureComponent } from "react";
const SELECTED_COLOR = "#bbccff";
const HIGHLIGHT_COLOR = "#eef0ff";
const PREFILLED_COLOR = "#eeeeee";
const PREFILLED_SELECTED_COLOR = "#dde0f0";
const PREFILLED_HIGHLIGHTED_COLOR = "#e0e0f0";
const SOLVED_COLOR = "#eeffcc";
const ERROR_COLOR = "#ff0000";

export default class Input extends PureComponent {
  static defaultProps = {
    pencilValues: []
  };
  getColor = () => {
    if (this.props.disabled) {
      return SOLVED_COLOR;
    }
    if (this.props.prefilled && this.props.selected) {
      return PREFILLED_SELECTED_COLOR;
    } else if (this.props.prefilled && this.props.highlighted) {
      return PREFILLED_HIGHLIGHTED_COLOR;
    } else if (this.props.prefilled) {
      return PREFILLED_COLOR;
    } else if (this.props.selected) {
      return SELECTED_COLOR;
    } else if (this.props.highlighted) {
      return HIGHLIGHT_COLOR;
    }
  };
  getBorder = () => {
    if (this.props.prefilled) {
      return "1px dashed #999";
    }
    return "1px solid black";
  };
  renderInterior = () => {
    if (!this.props.value) {
      return (
        <div
          className="pencil-grid"
          style={{
            alignItems: "center",
            display: "grid",
            gridTemplateColumns: `repeat(3, 1fr)`,
            height: "100%",
            fontSize: "8pt"
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i}>
              {this.props.pencilValues.length
                ? this.props.pencilValues.includes(i)
                  ? i
                  : "."
                : " "}
            </div>
          ))}
        </div>
      );
    }
    return this.props.value;
  };
  render() {
    return (
      <div
        style={{
          border: this.getBorder(),
          padding: ".25rem",
          margin: ".5rem",
          textAlign: "center",
          fontSize: "2rem",
          resize: "none",
          width: "auto",
          height: "3rem",
          outline: "none",
          backgroundColor: this.getColor(),
          color: this.props.error ? ERROR_COLOR : "black"
        }}
        rows={1}
        disabled={this.props.valueLocked}
        ref={e => (this.e = e)}
        onClick={this.props.setSelected}
        tabIndex={this.props.tabIndex}
      >
        {this.renderInterior()}
      </div>
    );
  }
}
