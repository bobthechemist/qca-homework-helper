import React, { useState, useEffect } from 'react';
import seedrandom from 'seedrandom';
import Chem from '../components/Chem';
import { genMolarity, genUnitConversion, genStoichiometry, genDilution, genSerialDilution } from '../logic/set2Generators';

// --- CONSTANTS ---
const TOPICS = [
  { id: 'molarity', name: 'Molarity', gen: genMolarity },
  { id: 'units',    name: 'Unit Conversion', gen: genUnitConversion },
  { id: 'stoich',   name: 'Stoichiometry', gen: genStoichiometry },
  { id: 'dilution', name: 'Dilution', gen: genDilution },
  { id: 'serial',   name: 'Serial Dilution', gen: genSerialDilution }
];

export default function ProblemSet2() {
  const [mode, setMode] = useState("practice"); // 'practice' or 'quiz'
  const [seed, setSeed] = useState("practice");
  
  // PRACTICE STATE
  const [practiceTopic, setPracticeTopic] = useState("molarity");
  const [practiceProblem, setPracticeProblem] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");

  // QUIZ STATE
  const [quizProblems, setQuizProblems] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({}); // { 0: "0.5", 1: "1.2" }
  const [quizResult, setQuizResult] = useState(null); // The final report card

  // --- HELPER: Render text/chem ---
  const renderText = (parts) => {
    if (!parts) return "";
    if (typeof parts === 'string') return parts;
    return (
      <span>
        {parts.map((part, index) => (
          part.isChem 
            ? <Chem key={index}>{part.val}</Chem> 
            : <span key={index}>{part}</span>
        ))}
      </span>
    );
  };

  // --- GENERATION LOGIC ---

  // Generate 1 Practice Problem
  useEffect(() => {
    if (mode === "practice" && seed) {
      const topic = TOPICS.find(t => t.id === practiceTopic);
      // Create a unique seed for this specific instance
      const uniqueSeed = `${seed}_${practiceTopic}`; 
      setPracticeProblem(topic.gen(uniqueSeed));
      setPracticeAnswer("");
      setPracticeFeedback("");
    }
  }, [seed, practiceTopic, mode]);

  // Generate 8 Quiz Problems
  useEffect(() => {
    if (mode === "quiz" && seed) {
      const problems = [];
      let pid = 0;
      
      // Generate 2 of each type
      TOPICS.forEach(topic => {
        for (let i = 1; i <= 2; i++) {
          // Deterministic seed: "masterseed_molarity_1"
          const subSeed = `${seed}_${topic.id}_${i}`;
          const prob = topic.gen(subSeed);
          problems.push({ 
            ...prob, 
            id: pid++, 
            category: topic.id 
          });
        }
      });
      setQuizProblems(problems);
      setQuizAnswers({});
      setQuizResult(null);
    }
  }, [seed, mode]);

  // --- GRADING LOGIC ---

  const checkPractice = () => {
    const val = parseFloat(practiceAnswer);
    if (isNaN(val)) return;
    const correct = practiceProblem.answer;
    const error = Math.abs((val - correct) / correct) * 100;
    
    if (error < 2) setPracticeFeedback("✅ Correct!");
    else setPracticeFeedback(`❌ Incorrect. Answer: ${correct} ${practiceProblem.unit}`);
  };

  const submitQuiz = () => {
    let score = 0;
    const total = 10;
    const catStats = { molarity: 0, units: 0, stoich: 0, dilution: 0, serial: 0 };
    const details = [];

    quizProblems.forEach(p => {
      const studentVal = parseFloat(quizAnswers[p.id]);
      const isCorrect = !isNaN(studentVal) && (Math.abs((studentVal - p.answer) / p.answer) * 100 < 2);
      
      if (isCorrect) {
        score++;
        catStats[p.category]++;
      }
      details.push({ ...p, isCorrect, studentVal });
    });

    // DETERMINE LEVEL
    let level = "Deficient";
    const pct = score / total;
    const allCatsCovered = Object.values(catStats).every(count => count >= 1);

    if (score === 8) {
      level = "Mastered";
    } else if (pct > 0.8 && allCatsCovered) {
      level = "Proficient";
    } else if (pct >= 0.6) {
      level = "Developing";
    } else {
      level = "Deficient";
    }

    setQuizResult({ score, total, level, details });
    // Scroll to top to see result
    window.scrollTo(0, 0);
  };

  // --- RENDER ---
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* HEADER & CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>🧪 Solutions & Dilutions</h2>
        <div>
          <button 
            onClick={() => setMode("practice")}
            style={{ 
              padding: "8px 15px", marginRight: "5px", border: "none", borderRadius: "4px", cursor: "pointer",
              background: mode === "practice" ? "#007bff" : "#e0e0e0", 
              color: mode === "practice" ? "white" : "black" 
            }}
          >
            Practice
          </button>
          <button 
            onClick={() => setMode("quiz")}
            style={{ 
              padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer",
              background: mode === "quiz" ? "#007bff" : "#e0e0e0", 
              color: mode === "quiz" ? "white" : "black" 
            }}
          >
            Quiz Mode
          </button>
        </div>
      </div>

      <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
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
          
          {mode === "practice" && (
            <div>
              <label><strong>Topic: </strong></label>
              <select value={practiceTopic} onChange={(e) => setPracticeTopic(e.target.value)} style={{ padding: "5px" }}>
                {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "10px" }}>
          {mode === "practice" 
            ? "Practice specific concepts. Switch topics to focus your study." 
            : "Generate a fixed set of 8 problems (2 of each type) to evaluate your level."}
            
        </p>
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "10px" }}>
          This tool does not handle significant figures. Report all of your answers to 3 sig figs.
        </p>
      </div>

      {/* --- QUIZ RESULT CARD --- */}
      {mode === "quiz" && quizResult && (
        <div style={{ 
          background: quizResult.level === "Mastered" ? "#d4edda" : quizResult.level === "Deficient" ? "#f8d7da" : "#fff3cd", 
          padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #ddd"
        }}>
          <h2 style={{ marginTop: 0 }}>Evaluation: {quizResult.level}</h2>
          <p style={{ fontSize: "1.2em" }}>
            Score: {quizResult.score} / {quizResult.total} ({Math.round((quizResult.score/quizResult.total)*100)}%)
          </p>
          <p>
            {quizResult.level === "Mastered" && "🏆 Perfect score! You have mastered this material."}
            {quizResult.level === "Proficient" && "✅ Excellent work. You have demonstrated strong understanding across all topics."}
            {quizResult.level === "Developing" && "⚠️ Good start, but you missed some key concepts. Check the feedback below."}
            {quizResult.level === "Deficient" && "🛑 You are struggling with this material. Please return to Practice Mode."}
          </p>
          <button 
            onClick={() => setQuizResult(null)} 
            style={{ padding: "5px 10px", marginTop: "10px", cursor: "pointer" }}
          >
            Hide Results / Retake
          </button>
        </div>
      )}

      {/* --- PRACTICE MODE VIEW --- */}
      {mode === "practice" && practiceProblem && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "0.8em", textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>
              {TOPICS.find(t => t.id === practiceTopic).name}
            </span>
            <p style={{ fontSize: "1.2em", margin: "10px 0 20px 0" }}>{renderText(practiceProblem.parts)}</p>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input 
                type="number" 
                placeholder="Answer" 
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                style={{ padding: "8px", width: "150px" }}
              />
              <strong>{practiceProblem.unit}</strong>
            </div>
            
            <button 
              onClick={checkPractice}
              style={{ marginTop: "15px", padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Check Answer
            </button>

            {practiceFeedback && (
              <div style={{ marginTop: "20px", padding: "10px", background: practiceFeedback.includes("Correct") ? "#d4edda" : "#f8d7da", borderRadius: "5px" }}>
                <strong>{practiceFeedback}</strong>
                {!practiceFeedback.includes("Correct") && (
                  <div style={{ fontSize: "0.9em", marginTop: "5px" }}>Hint: {renderText(practiceProblem.hintParts)}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- QUIZ MODE VIEW --- */}
      {mode === "quiz" && (
        <div>
          {quizProblems.map((p, idx) => {
            // If we have results, show feedback inline
            const res = quizResult ? quizResult.details[idx] : null;
            const bg = res ? (res.isCorrect ? "#d4edda33" : "#f8d7da33") : "transparent";

            return (
              <div key={p.id} style={{ marginBottom: "30px", padding: "15px", border: "1px solid #eee", borderRadius: "8px", background: bg }}>
                <div style={{ fontSize: "0.8em", color: "#888", marginBottom: "5px" }}>
                  Problem {idx + 1}: {TOPICS.find(t => t.id === p.category).name}
                </div>
                <div style={{ marginBottom: "15px" }}>{renderText(p.parts)}</div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input 
                    type="number" 
                    disabled={!!quizResult} // Lock input after submit
                    value={quizAnswers[p.id] || ""}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, [p.id]: e.target.value })}
                    style={{ padding: "8px", width: "120px", borderColor: res && !res.isCorrect ? "red" : "#ccc" }}
                  />
                  <strong>{p.unit}</strong>
                  {res && (
                    <span style={{ marginLeft: "10px", color: res.isCorrect ? "green" : "red", fontWeight: "bold" }}>
                      {res.isCorrect ? "✅" : `❌ (Ans: ${p.answer})`}
                    </span>
                  )}
                </div>
                {/* Show hint only if incorrect after grading */}
                {res && !res.isCorrect && (
                  <div style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
                    Hint: {renderText(p.hintParts)}
                  </div>
                )}
              </div>
            );
          })}

          {!quizResult && (
             <button 
             onClick={submitQuiz}
             style={{ 
               width: "100%", padding: "15px", background: "#28a745", color: "white", 
               fontSize: "1.1em", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "20px" 
             }}
           >
             Submit Quiz for Evaluation
           </button>
          )}
        </div>
      )}

    </div>
  );
}