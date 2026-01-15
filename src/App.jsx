// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MathJaxContext } from 'better-react-mathjax'; 
import ProblemSet2 from './pages/ProblemSet2';
import ProblemSet1 from './pages/ProblemSet1';

// 1. Configure MathJax to understand Chemistry (\ce{})
const config = {
  loader: { load: ["[tex]/mhchem"] },
  tex: { packages: { "[+]": ["mhchem"] } },
  chtml: {
    matchFontHeight: true,
    mtextInheritFont: true,
    merrorInheritFont: true,
    scale: 0.9,       // 1.1 = 110% size relative to surrounding text
    minScale: 0.5       // Prevent it from getting too tiny
  }
};

function Home() {
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>🧪 BoB's QCA Homework Helper</h1>
      <p>Select a topic to begin practice:</p>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "10px 0" }}>
            <Link to="/set-1" style={{ textDecoration: "none", fontSize: "1.2em", color: "#007bff" }}>
              ➡️ Problem Set 1: Accuracy & Precision
            </Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/set-2" style={{ textDecoration: "none", fontSize: "1.2em", color: "#007bff" }}>
              ➡️ Problem Set 2: Solutions & Dilutions
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    // 2. Wrap the entire Router in the Context
    <MathJaxContext config={config}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/set-1" element={<ProblemSet1 />} />
          <Route path="/set-2" element={<ProblemSet2 />} />
        </Routes>
      </Router>
    </MathJaxContext>
  );
}