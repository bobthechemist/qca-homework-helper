import React from 'react';
import { MathJax } from 'better-react-mathjax';

export default function Chem({ children }) {
  // If no data, render a placeholder to prevent crashes
  if (!children) return <span></span>;

  // We must wrap the \ce command in \( ... \) delimiters
  // so MathJax knows to treat it as math/chemistry.
  return (
    <MathJax inline dynamic>
      {`\\(\\ce{${children}}\\)`}
    </MathJax>
  );
}