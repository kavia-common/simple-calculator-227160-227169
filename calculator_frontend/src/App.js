import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Display from "./components/Display";
import Keypad from "./components/Keypad";

/**
 * Calculator behavior notes:
 * - We keep "entry" as the editable string the user is typing (including decimals).
 * - We keep "acc" as the accumulator (number) that holds the left side of a pending operation.
 * - We keep "pendingOp" as the operator to apply between acc and entry.
 * - We keep "lastOp" as the last executed binary operation to support repeated equals.
 * - We keep "justEvaluated" to decide whether digit input starts a new entry.
 */

const MAX_DISPLAY_LENGTH = 16;

function formatNumberForDisplay(n) {
  if (!Number.isFinite(n)) return "Error";

  // Keep precision reasonable; remove trailing zeros.
  // Use significant digits to avoid huge float strings.
  const s = n.toPrecision(12);
  const asNum = Number(s);

  // For very large/small numbers, fall back to scientific.
  const abs = Math.abs(asNum);
  let out;
  if ((abs !== 0 && abs < 1e-9) || abs >= 1e12) {
    out = asNum.toExponential(6);
  } else {
    out = String(asNum);
  }

  // Clip overly long display.
  if (out.length > MAX_DISPLAY_LENGTH) {
    // Try scientific if not already.
    if (!out.includes("e")) out = asNum.toExponential(6);
  }
  return out;
}

function safeParseEntry(entry) {
  // Convert to number; handle edge cases like "-" or "." during typing.
  if (entry === "" || entry === "-" || entry === "." || entry === "-.") return 0;
  const n = Number(entry);
  return Number.isFinite(n) ? n : 0;
}

function applyOperation(a, op, b) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
    case "-":
      return a - b;
    case "×":
    case "*":
      return a * b;
    case "÷":
    case "/":
      if (b === 0) return { error: true, value: a };
      return a / b;
    default:
      return { error: true, value: a };
  }
}

// PUBLIC_INTERFACE
function App() {
  const [entry, setEntry] = useState("0");
  const [acc, setAcc] = useState(null); // number | null
  const [pendingOp, setPendingOp] = useState(null); // "+", "−", "×", "÷" | null
  const [lastOp, setLastOp] = useState(null); // { op, rhs } | null
  const [error, setError] = useState(null); // string | null
  const [justEvaluated, setJustEvaluated] = useState(false);

  const displayValue = useMemo(() => {
    if (error) return error;
    return entry;
  }, [entry, error]);

  const clearErrorIfAny = useCallback(() => {
    if (error) setError(null);
  }, [error]);

  const resetAll = useCallback(() => {
    setEntry("0");
    setAcc(null);
    setPendingOp(null);
    setLastOp(null);
    setError(null);
    setJustEvaluated(false);
  }, []);

  const clearEntry = useCallback(() => {
    // "C" clears the current entry only; keep pending operator and accumulator.
    setEntry("0");
    setError(null);
    setJustEvaluated(false);
  }, []);

  const inputDigit = useCallback(
    (d) => {
      clearErrorIfAny();

      setEntry((prev) => {
        // If we just evaluated, a digit starts a new calculation.
        if (justEvaluated) {
          setAcc(null);
          setPendingOp(null);
          setLastOp(null);
          setJustEvaluated(false);
          return d;
        }

        // Replace leading zero.
        if (prev === "0") return d;

        // Prevent overflow in display by limiting length (excluding '-' and '.')
        if (prev.replace(/[-.]/g, "").length >= 16) return prev;

        return prev + d;
      });
    },
    [clearErrorIfAny, justEvaluated]
  );

  const inputDecimal = useCallback(() => {
    clearErrorIfAny();

    setEntry((prev) => {
      if (justEvaluated) {
        setAcc(null);
        setPendingOp(null);
        setLastOp(null);
        setJustEvaluated(false);
        return "0.";
      }
      if (prev.includes(".")) return prev;
      return prev + ".";
    });
  }, [clearErrorIfAny, justEvaluated]);

  const deleteLast = useCallback(() => {
    clearErrorIfAny();
    setEntry((prev) => {
      if (justEvaluated) {
        // If user just evaluated and hits backspace, treat as clearing the entry.
        setJustEvaluated(false);
        return "0";
      }
      if (prev.length <= 1) return "0";
      const next = prev.slice(0, -1);
      // Handle "-": convert to 0
      if (next === "-" || next === "") return "0";
      return next;
    });
  }, [clearErrorIfAny, justEvaluated]);

  const toggleOperator = useCallback(
    (op) => {
      clearErrorIfAny();

      // If currently in error, ignore operator toggles.
      if (error) return;

      const currentEntryNum = safeParseEntry(entry);

      // If no accumulator yet, set it to current entry and set pending op.
      if (acc === null) {
        setAcc(currentEntryNum);
        setPendingOp(op);
        setEntry("0");
        setJustEvaluated(false);
        return;
      }

      // If we have an accumulator but the user hasn't typed a new entry (entry is "0"
      // and we are effectively between ops), allow operator toggling without computing.
      if (entry === "0" && !justEvaluated) {
        setPendingOp(op);
        return;
      }

      // Otherwise, chain: compute acc (pendingOp) entry and set as new acc; keep new op pending.
      if (pendingOp) {
        const result = applyOperation(acc, pendingOp, currentEntryNum);
        if (result && typeof result === "object" && result.error) {
          setError("Cannot divide by zero");
          // Keep prior accumulator and state stable.
          return;
        }
        const value = typeof result === "number" ? result : result.value;
        setAcc(value);
        setPendingOp(op);
        setEntry("0");
        setJustEvaluated(false);
        return;
      }

      // Edge: accumulator exists but no pendingOp (should be rare) => just set op.
      setPendingOp(op);
      setEntry("0");
      setJustEvaluated(false);
    },
    [acc, clearErrorIfAny, entry, error, justEvaluated, pendingOp]
  );

  const evaluate = useCallback(() => {
    clearErrorIfAny();
    if (error) return;

    const currentEntryNum = safeParseEntry(entry);

    // If we have a pending op and an accumulator, execute it.
    if (pendingOp && acc !== null) {
      const result = applyOperation(acc, pendingOp, currentEntryNum);
      if (result && typeof result === "object" && result.error) {
        setError("Cannot divide by zero");
        return;
      }
      const value = typeof result === "number" ? result : result.value;

      // Save last operation for repeated equals (op with the rhs used).
      setLastOp({ op: pendingOp, rhs: currentEntryNum });

      // After evaluation, show value as entry; clear accumulator/op.
      setEntry(formatNumberForDisplay(value));
      setAcc(null);
      setPendingOp(null);
      setJustEvaluated(true);
      return;
    }

    // If no pending op, but we have a lastOp and an entry => repeat last operation.
    if (!pendingOp && lastOp) {
      const base = safeParseEntry(entry);
      const result = applyOperation(base, lastOp.op, lastOp.rhs);
      if (result && typeof result === "object" && result.error) {
        setError("Cannot divide by zero");
        return;
      }
      const value = typeof result === "number" ? result : result.value;
      setEntry(formatNumberForDisplay(value));
      setJustEvaluated(true);
      return;
    }

    // If nothing to evaluate, do nothing.
  }, [acc, clearErrorIfAny, entry, error, lastOp, pendingOp]);

  const handleButton = useCallback(
    (type, value) => {
      switch (type) {
        case "digit":
          inputDigit(value);
          break;
        case "decimal":
          inputDecimal();
          break;
        case "op":
          toggleOperator(value);
          break;
        case "equals":
          evaluate();
          break;
        case "clear":
          // AC vs C behavior: if there is any pending state, "AC" resets everything;
          // if actively typing or just evaluated, "C" clears entry.
          // Here the keypad passes "AC" or "C" label but we implement behavior based on state:
          if (acc !== null || pendingOp !== null || lastOp !== null) resetAll();
          else clearEntry();
          break;
        case "delete":
          deleteLast();
          break;
        default:
          break;
      }
    },
    [acc, clearEntry, deleteLast, evaluate, inputDecimal, inputDigit, lastOp, pendingOp, resetAll, toggleOperator]
  );

  // Keyboard support:
  // - digits 0-9
  // - operators: + - * /
  // - Enter or =: equals
  // - Backspace: delete
  // - Escape: clear (AC/C)
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key;

      // Avoid interfering with browser shortcuts.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        inputDigit(key);
        return;
      }

      if (key === ".") {
        e.preventDefault();
        inputDecimal();
        return;
      }

      if (key === "+" || key === "-" || key === "*" || key === "/") {
        e.preventDefault();
        // Map to UI operators for consistent display.
        const mapped = key === "*" ? "×" : key === "/" ? "÷" : key === "-" ? "−" : "+";
        toggleOperator(mapped);
        return;
      }

      if (key === "Enter" || key === "=") {
        e.preventDefault();
        evaluate();
        return;
      }

      if (key === "Backspace") {
        e.preventDefault();
        deleteLast();
        return;
      }

      if (key === "Escape") {
        e.preventDefault();
        if (acc !== null || pendingOp !== null || lastOp !== null) resetAll();
        else clearEntry();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [acc, clearEntry, deleteLast, evaluate, inputDecimal, inputDigit, lastOp, pendingOp, resetAll, toggleOperator]);

  // Derive whether the clear button should display AC or C.
  const clearLabel = useMemo(() => {
    return acc !== null || pendingOp !== null || lastOp !== null ? "AC" : "C";
  }, [acc, lastOp, pendingOp]);

  return (
    <div className="App">
      <main className="CalcPage">
        <section className="CalcCard" aria-label="Calculator">
          <Display
            value={displayValue}
            secondary={
              error
                ? "Press AC to reset"
                : pendingOp && acc !== null
                  ? `${formatNumberForDisplay(acc)} ${pendingOp}`
                  : " "
            }
          />
          <Keypad clearLabel={clearLabel} onPress={handleButton} />
          <div className="CalcHint" aria-hidden="true">
            Keyboard: 0–9, + − * /, Enter (=), Backspace (⌫), Escape (C/AC)
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
