import React, { PureComponent } from "react";
import Grid from "./GridWithState";
export default class App extends PureComponent {
  render() {
    return (
      <div className="App" style={{ fontFamily: "monospace" }}>
        <h1>{"Sudoku"}</h1>
        <Grid />
      </div>
    );
  }
}
