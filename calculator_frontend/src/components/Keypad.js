import React from "react";
import CalcButton from "./CalcButton";

function opAria(op) {
  switch (op) {
    case "+":
      return "Add";
    case "−":
      return "Subtract";
    case "×":
      return "Multiply";
    case "÷":
      return "Divide";
    default:
      return op;
  }
}

// PUBLIC_INTERFACE
export default function Keypad({ clearLabel = "C", onPress }) {
  return (
    <div className="CalcKeypad" role="group" aria-label="Calculator keypad">
      <CalcButton
        label={clearLabel}
        ariaLabel={clearLabel === "AC" ? "All clear" : "Clear entry"}
        variant="danger"
        onClick={() => onPress("clear")}
      />
      <CalcButton
        label="⌫"
        ariaLabel="Delete last digit"
        variant="secondary"
        onClick={() => onPress("delete")}
      />
      <CalcButton
        label="÷"
        ariaLabel={opAria("÷")}
        variant="op"
        onClick={() => onPress("op", "÷")}
      />
      <CalcButton
        label="7"
        ariaLabel="Seven"
        onClick={() => onPress("digit", "7")}
      />
      <CalcButton
        label="8"
        ariaLabel="Eight"
        onClick={() => onPress("digit", "8")}
      />
      <CalcButton
        label="9"
        ariaLabel="Nine"
        onClick={() => onPress("digit", "9")}
      />
      <CalcButton
        label="×"
        ariaLabel={opAria("×")}
        variant="op"
        onClick={() => onPress("op", "×")}
      />
      <CalcButton
        label="4"
        ariaLabel="Four"
        onClick={() => onPress("digit", "4")}
      />
      <CalcButton
        label="5"
        ariaLabel="Five"
        onClick={() => onPress("digit", "5")}
      />
      <CalcButton
        label="6"
        ariaLabel="Six"
        onClick={() => onPress("digit", "6")}
      />
      <CalcButton
        label="−"
        ariaLabel={opAria("−")}
        variant="op"
        onClick={() => onPress("op", "−")}
      />
      <CalcButton
        label="1"
        ariaLabel="One"
        onClick={() => onPress("digit", "1")}
      />
      <CalcButton
        label="2"
        ariaLabel="Two"
        onClick={() => onPress("digit", "2")}
      />
      <CalcButton
        label="3"
        ariaLabel="Three"
        onClick={() => onPress("digit", "3")}
      />
      <CalcButton
        label="+"
        ariaLabel={opAria("+")}
        variant="op"
        onClick={() => onPress("op", "+")}
      />
      <CalcButton
        label="0"
        ariaLabel="Zero"
        span={2}
        onClick={() => onPress("digit", "0")}
      />
      <CalcButton
        label="."
        ariaLabel="Decimal point"
        onClick={() => onPress("decimal")}
      />
      <CalcButton
        label="="
        ariaLabel="Equals"
        variant="equals"
        onClick={() => onPress("equals")}
      />
    </div>
  );
}
