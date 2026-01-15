import React from 'react';
import { MathJax } from 'better-react-mathjax';

export default function Chem({ children }) {
  // Wraps the text in \ce{ ... } so you just pass "H2O"
  return (
    <MathJax inline>
      {`\\ce{${children}}`}
    </MathJax>
  );
}