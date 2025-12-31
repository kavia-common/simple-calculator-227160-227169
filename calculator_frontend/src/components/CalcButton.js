import React from "react";

/**
 * Reusable calculator button.
 * We keep this component minimal: the parent defines behavior through onClick.
 */

// PUBLIC_INTERFACE
export default function CalcButton({
  label,
  ariaLabel,
  variant = "default",
  span = 1,
  onClick,
}) {
  const className = `CalcButton CalcButton--${variant} ${span === 2 ? "CalcButton--span2" : ""}`;

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel || label}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
