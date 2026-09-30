import React from "react";
import iconPaths from "../data/icons.js";

export default function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name] ?? iconPaths.grid} />
    </svg>
  );
}
