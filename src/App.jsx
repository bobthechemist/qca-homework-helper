import React, { useState, useEffect } from 'react';
import seedrandom from 'seedrandom';

// --- CHEMICAL DATABASE ---
const COMPOUNDS = [
  { name: "Sodium Chloride", formula: "NaCl", mw: 58.44 },
  { name: "Potassium Permanganate", formula: "KMnO4", mw: 158.03 },
  { name: "Glucose", formula: "C6H12O6", mw: 180.16 },
  { name: "Calcium Chloride Dihydrate", formula: "CaCl2·2H2O", mw: 147.01 }
];

// --- PROBLEM GENERATOR ENGINE ---
const generateProblem = (seed) => {
  // Initialize the PRNG with the seed
  const rng = seedrandom(seed);

  // 1. Pick a random compound
  const cmpIndex = Math.floor(rng() * COMPOUNDS.length);
  const compound = COMPOUNDS[cmpIndex];

  // 2. Pick a volume (Standard volumetric flask sizes: 100mL, 250mL, 500mL)
  const volOptions = [0.1, 0.25, 0.5, 1.0]; // Liters
  const volIndex = Math.floor(rng() * volOptions.length);
  const volumeL = volOptions[volIndex];

  // 3. Pick a Target Molarity (between 0.05 and 0.5 M) to ensure realistic numbers
  const targetMolarity = (rng() * 0.45) + 0.05;

  // 4. Back-calculate the required mass
  // Molarity = Moles / Vol -> Moles = Molarity * Vol
  const targetMoles = targetMolarity * volumeL;
  // Mass = Moles * MW
  const mass = targetMoles * compound.mw;

  // 5. Create the Problem Object
  return {
    text: `A student dissolves ${mass.toFixed(3)} g of ${compound.name} (${compound.formula}, MW: ${compound.mw} g/mol) in a volumetric flask to make ${volumeL * 1000} mL of solution. Calculate the molarity.`,
    answer: targetMolarity, // Keep the raw number for checking
    units: "M"
  };
};

// --- THE USER INTERFACE ---
function App() {
  const [seed, setSeed] = useState("practice");
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // Re-generate problem whenever the Seed changes
  useEffect(() => {
    if (seed) {
      setProblem(generateProblem(seed));
      setFeedback(""); // Reset feedback
      setUserAnswer(""); // Reset input
    }
  }, [seed]);

  const checkAnswer = () => {
    const studentVal = parseFloat(userAnswer);
    const correctVal = problem.answer;
    
    // ERROR TRAP: Check if input is a valid number
    if (isNaN(studentVal)) {
      setFeedback("Please enter a valid number.");
      return;
    }

    // TOLERANCE CHECK: Allow 1% error
    // (ABS(Student - Correct) / Correct) * 100
    const percentError = (Math.abs(studentVal - correctVal) / correctVal) * 100;

    if (percentError < 1) {
      setFeedback("✅ Correct! Great work.");
    } else {
      setFeedback(`❌ Incorrect. The correct answer is approx ${correctVal.toFixed(4)} M.`);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>⚗️ Problem Set 2: Solutions</h1>
      
      {/* SEED INPUT */}
      <div style={{ background: "#f0f0f0", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <label><strong>Problem Seed: </strong></label>
        <input 
          type="text" 
          value={seed} 
          onChange={(e) => setSeed(e.target.value)}
          style={{ padding: "5px" }}
        />
        <p style={{ fontSize: "0.8em", color: "#666" }}>
          Type a different seed (e.g., your name, "101", "test") to get a new problem. 
          Use the same seed to practice the same problem again.
        </p>
      </div>

      {/* QUESTION AREA */}
      {problem && (
        <div>
          <h3>Question:</h3>
          <p style={{ fontSize: "1.1em", lineHeight: "1.5" }}>{problem.text}</p>
          
          <div style={{ marginTop: "20px" }}>
            <input 
              type="number" 
              placeholder="Enter Molarity" 
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              style={{ padding: "8px", fontSize: "1em", width: "150px" }}
            />
            <span style={{ marginLeft: "10px" }}>M</span>
            
            <br /><br />
            
            <button 
              onClick={checkAnswer}
              style={{ 
                padding: "10px 20px", background: "#007bff", color: "white", 
                border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "1em" 
              }}
            >
              Check Answer
            </button>
          </div>

          {/* FEEDBACK AREA */}
          {feedback && (
            <div style={{ marginTop: "20px", fontWeight: "bold", fontSize: "1.2em" }}>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;