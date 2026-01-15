import React, { useState, useEffect } from 'react';
import seedrandom from 'seedrandom'; // <--- ADD THIS LINE
import { genMolarity, genUnitConversion, genStoichiometry, genDilution } from '../logic/set2Generators';

export default function ProblemSet2() {
  const [seed, setSeed] = useState("practice");
  const [mode, setMode] = useState("mix"); // 'mix', 'molarity', 'dilution', etc.
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // --- THE GENERATOR HUB ---
    const createProblem = (currentSeed, currentMode) => {
    // If "mix", pick a random generator
    const generators = [genMolarity, genUnitConversion, genStoichiometry, genDilution];
    
    let selectedGen;
    
    if (currentMode === "mix") {
      // FIX: Use the seedrandom engine to pick the type reliably
      // We create a temporary RNG just to decide which 'Type' of problem to show for this seed
      const rng = seedrandom(currentSeed); 
      const typeIndex = Math.floor(rng() * generators.length);
      selectedGen = generators[typeIndex];
    } else if (currentMode === "molarity") {
      selectedGen = genMolarity;
    } else if (currentMode === "units") {
      selectedGen = genUnitConversion;
    } else if (currentMode === "stoich") {
      selectedGen = genStoichiometry;
    } else {
      selectedGen = genDilution;
    }

    return selectedGen(currentSeed);
  };

  useEffect(() => {
    if (seed) {
      setProblem(createProblem(seed, mode));
      setFeedback(""); 
      setUserAnswer("");
    }
  }, [seed, mode]);

  const checkAnswer = () => {
    const studentVal = parseFloat(userAnswer);
    if (isNaN(studentVal)) { setFeedback("Please enter a valid number."); return; }

    const correct = problem.answer;
    const error = Math.abs((studentVal - correct) / correct) * 100;

    if (error < 2) { // 2% tolerance
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Incorrect. Answer: ${correct.toPrecision(4)} ${problem.unit}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🧪 Problem Set 2: Solutions</h2>

      {/* CONTROLS */}
      <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        
        <div style={{ marginBottom: "10px" }}>
          <label><strong>Topic: </strong></label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: "5px" }}>
            <option value="mix">🎲 Random Mix</option>
            <option value="molarity">⚖️ Molarity from Mass</option>
            <option value="units">🔄 Unit Conversion (ppm)</option>
            <option value="stoich">⚡ Ion Stoichiometry</option>
            <option value="dilution">💧 Dilutions</option>
          </select>
        </div>

        <div>
          <label><strong>Seed: </strong></label>
          <input 
            type="text" 
            value={seed} 
            onChange={(e) => setSeed(e.target.value)}
            style={{ padding: "5px", width: "100px" }}
          />
          <button onClick={() => setSeed(Math.floor(Math.random() * 10000).toString())} style={{ marginLeft: "10px" }}>
            Randomize
          </button>
        </div>
      </div>

      {/* PROBLEM DISPLAY */}
      {problem && (
        <div>
          <span style={{ fontSize: "0.8em", textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>
            {problem.type}
          </span>
          <p style={{ fontSize: "1.2em", margin: "10px 0 20px 0" }}>{problem.text}</p>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input 
              type="number" 
              placeholder="Your Answer" 
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              style={{ padding: "8px", fontSize: "1em", width: "150px" }}
            />
            <strong>{problem.unit}</strong>
          </div>
          
          <button 
            onClick={checkAnswer}
            style={{ marginTop: "15px", padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Check Answer
          </button>

          {feedback && (
            <div style={{ marginTop: "20px", padding: "10px", background: feedback.includes("Correct") ? "#d4edda" : "#f8d7da", borderRadius: "5px" }}>
              <strong>{feedback}</strong>
              {!feedback.includes("Correct") && <div style={{ fontSize: "0.9em", marginTop: "5px" }}>Hint: {problem.hint}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}