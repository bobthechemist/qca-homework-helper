import React, { useState, useEffect } from 'react';
import seedrandom from 'seedrandom';
import { Link } from 'react-router-dom';
import Meniscus from '../components/Meniscus'; // The visual component
import { genDataQuality, genGlasswareConcepts, genTolerance, genMeniscus } from '../logic/set1Generators';

// --- CONFIGURATION ---
const TOPICS = [
  { id: 'data',      name: 'Data Quality (RSD/Error)', gen: genDataQuality },
  { id: 'glass',     name: 'Glassware Concepts', gen: genGlasswareConcepts },
  { id: 'tolerance', name: 'Tolerance Math', gen: genTolerance },
  { id: 'meniscus',  name: 'Reading Meniscus', gen: genMeniscus }
];

export default function ProblemSet1() {
  const [mode, setMode] = useState("practice"); // 'practice' or 'quiz'
  const [seed, setSeed] = useState("practice");
  
  // PRACTICE STATE
  const [practiceTopic, setPracticeTopic] = useState("data");
  const [practiceProblem, setPracticeProblem] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");

  // QUIZ STATE
  const [quizProblems, setQuizProblems] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({}); 
  const [quizResult, setQuizResult] = useState(null); 

  // --- GENERATION LOGIC ---

  // Generate 1 Practice Problem
  useEffect(() => {
    if (mode === "practice" && seed) {
      const topic = TOPICS.find(t => t.id === practiceTopic);
      const uniqueSeed = `${seed}_${practiceTopic}`; 
      setPracticeProblem(topic.gen(uniqueSeed));
      setPracticeAnswer("");
      setPracticeFeedback("");
    }
  }, [seed, practiceTopic, mode]);

  // Generate 8 Quiz Problems (2 per topic)
  useEffect(() => {
    if (mode === "quiz" && seed) {
      const problems = [];
      let pid = 0;
      
      TOPICS.forEach(topic => {
        for (let i = 1; i <= 2; i++) {
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
    if (!practiceAnswer) return;

    // 1. Handle Multiple Choice (Exact String Match)
    if (practiceProblem.isMultipleChoice) {
      if (practiceAnswer === practiceProblem.answer) {
        setPracticeFeedback("✅ Correct!");
      } else {
        setPracticeFeedback(`❌ Incorrect. The answer is: ${practiceProblem.answer}`);
      }
      return;
    }

    // 2. Handle Numeric Answers
    const val = parseFloat(practiceAnswer);
    if (isNaN(val)) {
      setPracticeFeedback("Please enter a valid number.");
      return;
    }

    // 3. Sig Fig Trap (For Meniscus)
    if (practiceProblem.checkSigFigs) {
      const decimals = practiceAnswer.includes('.') ? practiceAnswer.split('.')[1].length : 0;
      if (decimals !== practiceProblem.checkSigFigs) {
        setPracticeFeedback(`⚠️ Sig Fig Error: You must read to exactly ${practiceProblem.checkSigFigs} decimal places.`);
        return;
      }
    }

    // 4. Standard Math Tolerance (2%)
    const correct = practiceProblem.answer;
    const error = Math.abs((val - correct) / correct) * 100;
    
    if (error < 2) {
      setPracticeFeedback("✅ Correct!");
    } else {
      setPracticeFeedback(`❌ Incorrect. Answer: ${correct} ${practiceProblem.unit}`);
    }
  };

  const submitQuiz = () => {
    let score = 0;
    const total = quizProblems.length;
    // Track stats per category to determine "Proficient" status
    const catStats = {}; 
    TOPICS.forEach(t => catStats[t.id] = 0);

    const details = [];

    quizProblems.forEach(p => {
      let isCorrect = false;
      const studentAns = quizAnswers[p.id];

      if (p.isMultipleChoice) {
        // Exact String Match
        if (studentAns === p.answer) isCorrect = true;
      } else {
        // Numeric Check
        const val = parseFloat(studentAns);
        if (!isNaN(val)) {
          // Sig Fig Check for Quiz? 
          let sigFigPass = true;
          if (p.checkSigFigs) {
            const dec = studentAns.includes('.') ? studentAns.split('.')[1].length : 0;
            if (dec !== p.checkSigFigs) sigFigPass = false;
          }

          const error = Math.abs((val - p.answer) / p.answer) * 100;
          if (error < 2 && sigFigPass) isCorrect = true;
        }
      }

      if (isCorrect) {
        score++;
        catStats[p.category]++;
      }
      details.push({ ...p, isCorrect, studentAns });
    });

    // DETERMINE LEVEL
    let level = "Deficient";
    const pct = score / total;
    // Check if they got at least 1 right in every category
    const allCatsCovered = Object.values(catStats).every(count => count >= 1);

    if (score === total) {
      level = "Mastered";
    } else if (pct > 0.8 && allCatsCovered) {
      level = "Proficient";
    } else if (pct >= 0.6) {
      level = "Developing";
    } else {
      level = "Deficient";
    }

    setQuizResult({ score, total, level, details });
    window.scrollTo(0, 0);
  };

  // --- RENDER HELPERS ---
  
  // Render the Input Area (Text box or Buttons)
  const renderInputArea = (prob, currentVal, onChange, disabled, showFeedback) => {
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
                // Highlight selected
                background: currentVal === opt ? "var(--accent-secondary)" : "var(--bg-primary)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                // Quiz Feedback coloring
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

  // Helper to determine styles for result cards
  const getResultStyles = (level) => {
    if (level === "Mastered" || level === "Proficient") {
      return { bg: "rgba(0, 255, 136, 0.1)", border: "#00ff88" };
    } else if (level === "Developing") {
      return { bg: "rgba(255, 213, 0, 0.1)", border: "#ffd500" };
    } else {
      return { bg: "rgba(255, 77, 77, 0.1)", border: "#ff4d4d" };
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Link to="/" style={{ display: "inline-block", marginBottom: "20px", textDecoration: "none", color: "var(--accent-primary)" }}>
            &larr; Back to Menu
        </Link>
      
      {/* HEADER & CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>🎯 Accuracy, Precision & Glassware</h2>
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
                {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <p style={{ fontSize: "0.9em", color: "var(--text-secondary)", marginTop: "10px" }}>
          {mode === "practice" 
            ? "Master glassware concepts, statistics, and sig figs." 
            : "Test your skills with a set of 8 problems (2 from each topic)."}
        </p>
      </div>

      {/* --- QUIZ RESULT CARD --- */}
      {mode === "quiz" && quizResult && (
        <div style={{ 
          background: getResultStyles(quizResult.level).bg,
          border: `1px solid ${getResultStyles(quizResult.level).border}`,
          padding: "20px", borderRadius: "8px", marginBottom: "30px"
        }}>
          <h2 style={{ marginTop: 0, color: getResultStyles(quizResult.level).border }}>Evaluation: {quizResult.level}</h2>
          <p style={{ fontSize: "1.2em" }}>
            Score: {quizResult.score} / {quizResult.total} ({Math.round((quizResult.score/quizResult.total)*100)}%)
          </p>
          <p>
            {quizResult.level === "Mastered" && "🏆 Perfect score!"}
            {quizResult.level === "Proficient" && "✅ You are proficient in these concepts."}
            {quizResult.level === "Developing" && "⚠️ You are developing, but missed some key concepts."}
            {quizResult.level === "Deficient" && "🛑 You need more practice with the basics."}
          </p>
          <button onClick={() => setQuizResult(null)} style={{ padding: "5px 10px", marginTop: "10px", cursor: "pointer", background: "var(--bg-secondary)", border: "1px solid var(--text-primary)", color: "var(--text-primary)" }}>
            Retake
          </button>
        </div>
      )}

      {/* --- PRACTICE MODE VIEW --- */}
      {mode === "practice" && practiceProblem && (
        <div>
          <div className="problem-card" style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "0.8em", textTransform: "uppercase", color: "var(--accent-secondary)", letterSpacing: "1px" }}>
              {TOPICS.find(t => t.id === practiceTopic).name}
            </span>
            
            <p style={{ fontSize: "1.2em", margin: "10px 0 20px 0" }}>
              {practiceProblem.parts.join("")}
            </p>

            {/* Visual Component (if Meniscus problem) */}
            {practiceProblem.isVisual && (
               <div style={{ margin: "20px 0" }}>
                 <Meniscus {...practiceProblem.props} />
               </div>
            )}
            
            {/* Input Area */}
            {renderInputArea(
              practiceProblem, 
              practiceAnswer, 
              setPracticeAnswer, 
              false, 
              false
            )}
            
            <button 
              onClick={checkPractice}
              style={{ marginTop: "15px", padding: "10px 20px", background: "var(--accent-primary)", color: "#0a0e27", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Check Answer
            </button>

            {practiceFeedback && (
               <div style={{ 
                marginTop: "20px", 
                padding: "15px", 
                borderRadius: "8px", 
                background: practiceFeedback.includes("Correct") ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 77, 77, 0.1)",
                border: `1px solid ${practiceFeedback.includes("Correct") ? "#00ff88" : "#ff4d4d"}`
              }}>
                <strong style={{ color: practiceFeedback.includes("Correct") ? "#00ff88" : "#ff4d4d", fontSize: "1.1em" }}>
                  {practiceFeedback}
                </strong>
                {!practiceFeedback.includes("Correct") && (
                  <div style={{ fontSize: "0.9em", marginTop: "10px", color: "var(--text-secondary)" }}>
                    Hint: {practiceProblem.hintParts.join("")}
                  </div>
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
            const res = quizResult ? quizResult.details[idx] : null;
            // Define background colors for quiz items
            let bg = "var(--bg-secondary)";
            let border = "rgba(0,217,255,0.1)";
            
            if (res) {
                if (res.isCorrect) {
                    bg = "rgba(0, 255, 136, 0.05)";
                    border = "#00ff88";
                } else {
                    bg = "rgba(255, 77, 77, 0.05)";
                    border = "#ff4d4d";
                }
            }

            return (
              <div key={p.id} style={{ marginBottom: "30px", padding: "20px", border: `1px solid ${border}`, borderRadius: "12px", background: bg, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: "0.8em", color: "var(--accent-secondary)", marginBottom: "5px" }}>
                  Problem {idx + 1}: {TOPICS.find(t => t.id === p.category).name}
                </div>
                
                <div style={{ marginBottom: "15px" }}>{p.parts.join("")}</div>

                {p.isVisual && (
                  <div style={{ marginBottom: "15px" }}>
                    <Meniscus {...p.props} />
                  </div>
                )}
                
                {renderInputArea(
                  p, 
                  quizAnswers[p.id], 
                  (val) => !quizResult && setQuizAnswers({ ...quizAnswers, [p.id]: val }), 
                  !!quizResult, 
                  !!quizResult
                )}

                {res && (
                  <div style={{ marginTop: "10px", fontWeight: "bold", color: res.isCorrect ? "#00ff88" : "#ff4d4d" }}>
                    {res.isCorrect ? "✅ Correct" : `❌ Incorrect. Answer: ${p.answer} ${p.unit}`}
                  </div>
                )}
              </div>
            );
          })}

          {!quizResult && (
             <button 
             onClick={submitQuiz}
             style={{ 
               width: "100%", padding: "15px", background: "#00ff88", color: "#0a0e27", fontWeight: "bold", 
               fontSize: "1.1em", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "20px",
               boxShadow: "0 0 15px rgba(0, 255, 136, 0.4)"
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