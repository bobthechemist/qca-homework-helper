import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import seedrandom from 'seedrandom';
import Chem from './Chem';
import Meniscus from './Meniscus';

export default function ProblemSetLayout({ title, topics, description }) {
  const [mode, setMode] = useState("practice"); // 'practice' or 'quiz'
  const [seed, setSeed] = useState("practice");
  
  // PRACTICE STATE
  const [practiceTopic, setPracticeTopic] = useState(topics[0].id);
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
                border: `1px solid ${currentVal === opt ? "var(--accent-primary)" : "var(--accent-secondary)"}`,
                borderRadius: "4px",
                cursor: disabled ? "default" : "pointer",
                background: currentVal === opt ? "var(--accent-secondary)" : "var(--bg-primary)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
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

  const getResultStyles = (level) => {
    if (level === "Mastered" || level === "Proficient") {
      return { bg: "rgba(0, 255, 136, 0.1)", border: "#00ff88" };
    } else if (level === "Developing") {
      return { bg: "rgba(255, 213, 0, 0.1)", border: "#ffd500" };
    } else {
      return { bg: "rgba(255, 77, 77, 0.1)", border: "#ff4d4d" };
    }
  };

  // --- LOGIC: GENERATION ---
  useEffect(() => {
    // Reset when topics change
    setPracticeTopic(topics[0].id);
  }, [topics]);

  useEffect(() => {
    if (mode === "practice" && seed) {
      const topic = topics.find(t => t.id === practiceTopic) || topics[0];
      const uniqueSeed = `${seed}_${practiceTopic}`; 
      setPracticeProblem(topic.gen(uniqueSeed));
      setPracticeAnswer("");
      setPracticeFeedback("");
    }
  }, [seed, practiceTopic, mode, topics]);

  useEffect(() => {
    if (mode === "quiz" && seed) {
      const problems = [];
      let pid = 0;
      topics.forEach(topic => {
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
  }, [seed, mode, topics]);

  // --- LOGIC: GRADING ---
  const gradeProblem = (prob, ans) => {
    if (!ans) return { isCorrect: false, msg: "Empty" };

    // 1. Multiple Choice Check
    if (prob.isMultipleChoice) {
      return { isCorrect: ans === prob.answer };
    }

    const val = parseFloat(ans);
    if (isNaN(val)) return { isCorrect: false, msg: "Invalid Number" };

    // 2. Sig Fig Check (Strict String Check)
    // Used for Meniscus reading where "20.5" is wrong if "20.50" is expected
    if (prob.checkSigFigs) {
      const decimals = ans.includes('.') ? ans.split('.')[1].length : 0;
      if (decimals !== prob.checkSigFigs) {
        return { isCorrect: false, msg: `Sig Fig Error: Read to exactly ${prob.checkSigFigs} decimal places.` };
      }
    }

    // 3. Absolute Tolerance Check (e.g., +/- 0.02 mL)
    // Used for reading glassware where specific precision is required
    if (prob.toleranceType === 'absolute') {
      const diff = Math.abs(val - prob.answer);
      // Use a default of 0.02 if not specified, or use the problem's specific tolerance
      const allowedDiff = prob.tolerance || 0.02; 
      
      if (diff <= allowedDiff + 0.000001) { // Tiny epsilon for float math
        return { isCorrect: true };
      } else {
        return { isCorrect: false, msg: `Incorrect. Expected ${prob.answer} ± ${allowedDiff}` };
      }
    }

    // 4. Relative Tolerance Check (Default ~2%)
    // Used for general calculations (Molarity, Dilutions, etc.)
    const relError = Math.abs((val - prob.answer) / prob.answer) * 100;
    const allowedError = prob.allowedError || 2; // Allow overriding the 2% default if needed
    
    if (relError < allowedError) return { isCorrect: true };
    
    return { isCorrect: false, msg: `Incorrect. Answer: ${prob.answer} ${prob.unit}` };
  };

  const checkPractice = () => {
    const result = gradeProblem(practiceProblem, practiceAnswer);
    if (result.isCorrect) setPracticeFeedback("✅ Correct!");
    else setPracticeFeedback(result.msg || `❌ Incorrect. Answer: ${practiceProblem.answer} ${practiceProblem.unit}`);
  };

  const submitQuiz = () => {
    let score = 0;
    const total = quizProblems.length;
    const catStats = {};
    topics.forEach(t => catStats[t.id] = 0);
    const details = [];

    quizProblems.forEach(p => {
      const studentAns = quizAnswers[p.id];
      const result = gradeProblem(p, studentAns);
      
      if (result.isCorrect) {
        score++;
        catStats[p.category]++;
      }
      details.push({ ...p, isCorrect: result.isCorrect, studentAns });
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

  // --- THE UI ---
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/" style={{ display: "inline-block", marginBottom: "20px", textDecoration: "none", color: "var(--accent-primary)" }}>
        &larr; Back to Menu
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div>
          <button 
            onClick={() => setMode("practice")}
            style={{ 
              padding: "8px 15px", marginRight: "5px", border: "1px solid var(--accent-primary)", borderRadius: "4px", cursor: "pointer",
              background: mode === "practice" ? "var(--accent-primary)" : "transparent", 
              color: mode === "practice" ? "#0a0e27" : "var(--accent-primary)", fontWeight: "bold"
            }}
          >
            Practice
          </button>
          <button 
            onClick={() => setMode("quiz")}
            style={{ 
              padding: "8px 15px", border: "1px solid var(--accent-primary)", borderRadius: "4px", cursor: "pointer",
              background: mode === "quiz" ? "var(--accent-primary)" : "transparent", 
              color: mode === "quiz" ? "#0a0e27" : "var(--accent-primary)", fontWeight: "bold"
            }}
          >
            Quiz Mode
          </button>
        </div>
      </div>

      <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(0,217,255,0.1)", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div>
            <label><strong>Seed: </strong></label>
            <input 
              type="text" 
              value={seed} 
              onChange={(e) => setSeed(e.target.value)}
              style={{ padding: "5px", width: "100px" }}
            />
            <button onClick={() => setSeed(Math.floor(Math.random() * 10000).toString())} style={{ marginLeft: "10px", background: "var(--accent-secondary)", border: "none", color: "white", padding: "6px 12px", borderRadius: "4px" }}>
              Randomize
            </button>
          </div>
          
          {mode === "practice" && (
            <div>
              <label><strong>Topic: </strong></label>
              <select value={practiceTopic} onChange={(e) => setPracticeTopic(e.target.value)} style={{ padding: "5px" }}>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <p style={{ fontSize: "0.9em", color: "var(--text-secondary)", marginTop: "10px" }}>
          {mode === "practice" 
            ? "Practice specific concepts. Switch topics to focus your study." 
            : `Generate a set of ${topics.length * 2} problems to evaluate your level.`}
        </p>
        {description && <p style={{ fontSize: "0.9em", color: "var(--text-secondary)", marginTop: "10px", fontStyle: "italic" }}>{description}</p>}
      </div>

      {/* QUIZ RESULTS */}
      {mode === "quiz" && quizResult && (
        <div style={{ 
          background: getResultStyles(quizResult.level).bg,
          border: `1px solid ${getResultStyles(quizResult.level).border}`,
          padding: "20px", borderRadius: "8px", marginBottom: "30px" 
        }}>
          <h2 style={{ marginTop: 0, color: getResultStyles(quizResult.level).border }}>Evaluation: {quizResult.level}</h2>
          <p style={{ fontSize: "1.2em" }}>Score: {quizResult.score} / {quizResult.total} ({Math.round((quizResult.score/quizResult.total)*100)}%)</p>
          <button onClick={() => setQuizResult(null)} style={{ padding: "5px 10px", marginTop: "10px", cursor: "pointer", background: "var(--bg-secondary)", border: "1px solid var(--text-primary)", color: "var(--text-primary)" }}>
            Retake
          </button>
        </div>
      )}

      {/* PRACTICE VIEW */}
      {mode === "practice" && practiceProblem && (
        <div className="problem-card">
            <span style={{ fontSize: "0.8em", textTransform: "uppercase", color: "var(--accent-secondary)", letterSpacing: "1px" }}>
              {topics.find(t => t.id === practiceTopic)?.name}
            </span>
            <p style={{ fontSize: "1.2em", margin: "10px 0 20px 0" }}>{renderText(practiceProblem.parts)}</p>

            {practiceProblem.isVisual && <div style={{ marginBottom: "20px" }}><Meniscus {...practiceProblem.props} /></div>}

            {renderInputArea(practiceProblem, practiceAnswer, setPracticeAnswer, false)}

            <button onClick={checkPractice} style={{ marginTop: "15px", padding: "10px 20px", background: "var(--accent-primary)", color: "#0a0e27", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer" }}>Check Answer</button>

            {practiceFeedback && (
              <div style={{ 
                marginTop: "20px", padding: "15px", borderRadius: "8px", 
                background: practiceFeedback.includes("Correct") ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 77, 77, 0.1)",
                border: `1px solid ${practiceFeedback.includes("Correct") ? "#00ff88" : "#ff4d4d"}`
              }}>
                <strong style={{ color: practiceFeedback.includes("Correct") ? "#00ff88" : "#ff4d4d", fontSize: "1.1em" }}>{practiceFeedback}</strong>
                {!practiceFeedback.includes("Correct") && (
                  <div style={{ fontSize: "0.9em", marginTop: "10px", color: "var(--text-secondary)" }}>
                    Hint: {Array.isArray(practiceProblem.hintParts) ? renderText(practiceProblem.hintParts) : practiceProblem.hintParts}
                  </div>
                )}
              </div>
            )}
        </div>
      )}

      {/* QUIZ VIEW */}
      {mode === "quiz" && (
        <div>
          {quizProblems.map((p, idx) => {
            const res = quizResult ? quizResult.details[idx] : null;
            let bg = "var(--bg-secondary)";
            let border = "rgba(0,217,255,0.1)";
            
            if (res) {
                if (res.isCorrect) { bg = "rgba(0, 255, 136, 0.05)"; border = "#00ff88"; }
                else { bg = "rgba(255, 77, 77, 0.05)"; border = "#ff4d4d"; }
            }

            return (
              <div key={p.id} style={{ marginBottom: "30px", padding: "20px", border: `1px solid ${border}`, borderRadius: "12px", background: bg, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: "0.8em", color: "var(--accent-secondary)", marginBottom: "5px" }}>Problem {idx + 1}: {topics.find(t => t.id === p.category).name}</div>
                <div style={{ marginBottom: "15px" }}>{renderText(p.parts)}</div>
                {p.isVisual && <div style={{ marginBottom: "15px" }}><Meniscus {...p.props} /></div>}
                
                {renderInputArea(p, quizAnswers[p.id], (val) => !quizResult && setQuizAnswers({ ...quizAnswers, [p.id]: val }), !!quizResult)}
                
                {res && <div style={{ marginTop: "10px", fontWeight: "bold", color: res.isCorrect ? "#00ff88" : "#ff4d4d" }}>{res.isCorrect ? "✅ Correct" : `❌ Incorrect. Answer: ${p.answer} ${p.unit}`}</div>}
                {res && !res.isCorrect && <div style={{ marginTop: "5px", fontSize: "0.9em", color: "var(--text-secondary)" }}>Hint: {Array.isArray(p.hintParts) ? renderText(p.hintParts) : p.hintParts}</div>}
              </div>
            );
          })}
          {!quizResult && (
             <button onClick={submitQuiz} style={{ width: "100%", padding: "15px", background: "#00ff88", color: "#0a0e27", fontWeight: "bold", fontSize: "1.1em", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "20px", boxShadow: "0 0 15px rgba(0, 255, 136, 0.4)" }}>Submit Quiz for Evaluation</button>
          )}
        </div>
      )}
    </div>
  );
}