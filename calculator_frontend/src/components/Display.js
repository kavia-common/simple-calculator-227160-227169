import React from "react";

// PUBLIC_INTERFACE
export default function Display({ value, secondary }) {
  return (
    <div className="CalcDisplay" role="group" aria-label="Calculator display">
      <div className="CalcDisplay-secondary" aria-label="Calculation context">
        {secondary}
      </div>
      <div className="CalcDisplay-primary" aria-label={`Display value ${value}`}>
        {value}
      </div>
    </div>
  );
}
