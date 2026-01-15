import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import seedrandom from 'seedrandom';
import Chem from '../components/Chem';
import { genSoilAnalysis, genRecovery, genDefinitions, genPurityAnalysis } from '../logic/set3Generators';

const TOPICS = [
  { id: 'backcalc', name: 'Back Calculation (Soil)', gen: genSoilAnalysis },
  { id: 'recovery', name: 'Percent Recovery', gen: genRecovery },
  { id: 'defs',     name: 'Blanks & Sampling', gen: genDefinitions },
  { id: 'purity',   name: 'Purity Analysis', gen: genPurityAnalysis }
];

export default function ProblemSet3() {
  const [mode, setMode] = useState("practice");
  const [seed, setSeed] = useState("practice");
  
  // PRACTICE STATE
  const [practiceTopic, setPracticeTopic] = useState("backcalc");
  const [practiceProblem, setPracticeProblem] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");

  // QUIZ STATE
  const [quizProblems, setQuizProblems] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // --- RENDER HELPERS ---
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

  const renderInputArea = (prob, currentVal, onChange, disabled) => {
    if (prob.isMultipleChoice) {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
          {prob.options.map(opt => (
            <button
              key={opt}
              disabled={disabled}
              onClick={() => onChange(opt)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: disabled ? "default" : "pointer",
                background: currentVal === opt ? "#007bff" : "white",
                color: currentVal === opt ? "white" : "black",
                opacity: disabled && currentVal !== opt ? 0.5 : 1
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
        <input 
          type="number" 
          placeholder="Answer" 
          disabled={disabled}
          value={currentVal || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: "8px", width: "150px" }}
        />
        <strong>{prob.unit}</strong>
      </div>
    );
  };

  // --- GENERATION LOGIC ---
  useEffect(() => {
    if (mode === "practice" && seed) {
      const topic = TOPICS.find(t => t.id === practiceTopic);
      const uniqueSeed = `${seed}_${practiceTopic}`; 
      setPracticeProblem(topic.gen(uniqueSeed));
      setPracticeAnswer("");
      setPracticeFeedback("");
    }
  }, [seed, practiceTopic, mode]);

  useEffect(() => {
    if (mode === "quiz" && seed) {
      const problems = [];
      let pid = 0;
      TOPICS.forEach(topic => {
        for (let i = 1; i <= 2; i++) {
          const subSeed = `${seed}_${topic.id}_${i}`;
          const prob = topic.gen(subSeed);
          problems.push({ ...prob, id: pid++, category: topic.id });
        }
      });
      setQuizProblems(problems);
      setQuizAnswers({});
      setQuizResult(null);
    }
  }, [seed, mode]);

  // --- GRADING ---
  const checkPractice = () => {
    if (!practiceAnswer) return;

    if (practiceProblem.isMultipleChoice) {
      if (practiceAnswer === practiceProblem.answer) setPracticeFeedback("✅ Correct!");
      else setPracticeFeedback(`❌ Incorrect. Answer: ${practiceProblem.answer}`);
      return;
    }

    const val = parseFloat(practiceAnswer);
    if (isNaN(val)) { setPracticeFeedback("Invalid number."); return; }

    const correct = practiceProblem.answer;
    const error = Math.abs((val - correct) / correct) * 100;
    
    if (error < 2) setPracticeFeedback("✅ Correct!");
    else setPracticeFeedback(`❌ Incorrect. Answer: ${correct.toPrecision(4)} ${practiceProblem.unit}`);
  };

  const submitQuiz = () => {
    let score = 0;
    const total = quizProblems.length;
    const catStats = {};
    TOPICS.forEach(t => catStats[t.id] = 0);
    const details = [];

    quizProblems.forEach(p => {
      let isCorrect = false;
      const studentAns = quizAnswers[p.id];
      
      if (p.isMultipleChoice) {
        if (studentAns === p.answer) isCorrect = true;
      } else {
        const val = parseFloat(studentAns);
        if (!isNaN(val)) {
          const error = Math.abs((val - p.answer) / p.answer) * 100;
          if (error < 2) isCorrect = true;
        }
      }

      if (isCorrect) { score++; catStats[p.category]++; }
      details.push({ ...p, isCorrect, studentAns });
    });

    let level = "Deficient";
    const pct = score / total;
    const allCatsCovered = Object.values(catStats).every(c => c >= 1);

    if (score === total) level = "Mastered";
    else if (pct > 0.8 && allCatsCovered) level = "Proficient";
    else if (pct >= 0.6) level = "Developing";

    setQuizResult({ score, total, level, details });
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/" style={{ display: "inline-block", marginBottom: "20px", textDecoration: "none", color: "#007bff" }}>&larr; Back to Menu</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>⚗️ Sample Prep & Analysis</h2>
        <div>
          <button onClick={() => setMode("practice")} style={{ padding: "8px 15px", marginRight: "5px", background: mode === "practice" ? "#007bff" : "#e0e0e0", color: mode === "practice" ? "white" : "black", border: "none", borderRadius: "4px", cursor: "pointer" }}>Practice</button>
          <button onClick={() => setMode("quiz")} style={{ padding: "8px 15px", background: mode === "quiz" ? "#007bff" : "#e0e0e0", color: mode === "quiz" ? "white" : "black", border: "none", borderRadius: "4px", cursor: "pointer" }}>Quiz Mode</button>
        </div>
      </div>

      <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div>
            <label><strong>Seed: </strong></label>
            <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} style={{ padding: "5px", width: "100px" }} />
            <button onClick={() => setSeed(Math.floor(Math.random() * 10000).toString())} style={{ marginLeft: "10px" }}>Randomize</button>
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
      </div>

      {mode === "quiz" && quizResult && (
        <div style={{ background: quizResult.level === "Mastered" ? "#d4edda" : quizResult.level === "Deficient" ? "#f8d7da" : "#fff3cd", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #ddd" }}>
          <h2 style={{ marginTop: 0 }}>Evaluation: {quizResult.level}</h2>
          <p style={{ fontSize: "1.2em" }}>Score: {quizResult.score} / {quizResult.total} ({Math.round((quizResult.score/quizResult.total)*100)}%)</p>
          <button onClick={() => setQuizResult(null)} style={{ padding: "5px 10px", marginTop: "10px", cursor: "pointer" }}>Retake</button>
        </div>
      )}

      {mode === "practice" && practiceProblem && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "0.8em", textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>{TOPICS.find(t => t.id === practiceTopic).name}</span>
            <p style={{ fontSize: "1.2em", margin: "10px 0 20px 0" }}>{renderText(practiceProblem.parts)}</p>
            {renderInputArea(practiceProblem, practiceAnswer, setPracticeAnswer, false)}
            <button onClick={checkPractice} style={{ marginTop: "15px", padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Check Answer</button>
            {practiceFeedback && (
              <div style={{ marginTop: "20px", padding: "10px", background: practiceFeedback.includes("Correct") ? "#d4edda" : "#f8d7da", borderRadius: "5px" }}>
                <strong>{practiceFeedback}</strong>
                {!practiceFeedback.includes("Correct") && <div style={{ fontSize: "0.9em", marginTop: "5px" }}>Hint: {renderText(practiceProblem.hintParts)}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "quiz" && (
        <div>
          {quizProblems.map((p, idx) => {
            const res = quizResult ? quizResult.details[idx] : null;
            const bg = res ? (res.isCorrect ? "#d4edda33" : "#f8d7da33") : "transparent";
            return (
              <div key={p.id} style={{ marginBottom: "30px", padding: "15px", border: "1px solid #eee", borderRadius: "8px", background: bg }}>
                <div style={{ fontSize: "0.8em", color: "#888", marginBottom: "5px" }}>Problem {idx + 1}: {TOPICS.find(t => t.id === p.category).name}</div>
                <div style={{ marginBottom: "15px" }}>{renderText(p.parts)}</div>
                {renderInputArea(p, quizAnswers[p.id], (val) => !quizResult && setQuizAnswers({ ...quizAnswers, [p.id]: val }), !!quizResult)}
                {res && <div style={{ marginTop: "10px", fontWeight: "bold", color: res.isCorrect ? "green" : "red" }}>{res.isCorrect ? "✅ Correct" : `❌ Incorrect. Answer: ${p.answer} ${p.unit}`}</div>}
                {res && !res.isCorrect && <div style={{ marginTop: "5px", fontSize: "0.9em", color: "#666" }}>Hint: {renderText(p.hintParts)}</div>}
              </div>
            );
          })}
          {!quizResult && <button onClick={submitQuiz} style={{ width: "100%", padding: "15px", background: "#28a745", color: "white", fontSize: "1.1em", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "20px" }}>Submit Quiz for Evaluation</button>}
        </div>
      )}
    </div>
  );
}