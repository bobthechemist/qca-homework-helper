import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MathJaxContext } from 'better-react-mathjax';
import ProblemSet1 from './pages/ProblemSet1';
import ProblemSet2 from './pages/ProblemSet2';
import ProblemSet3 from './pages/ProblemSet3'; // Don't forget this import
import Background from './components/Background';

// MathJax Config (With scale boost for visibility on Dark Mode)
const config = {
  loader: { load: ["[tex]/mhchem"] },
  tex: { packages: { "[+]": ["mhchem"] } },
  chtml: { scale: 1.1, minScale: 1 }
};

// --- LANDING PAGE COMPONENT ---
function Home() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      <header style={{ padding: '2rem 0', borderBottom: '1px solid rgba(0,217,255,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px var(--glow))' }}>🧪</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.5rem', fontWeight: 'bold' }}>QCA Helper</div>
          </div>
          <nav style={{ display: 'flex', gap: '2rem', fontFamily: 'JetBrains Mono' }}>
            <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1rem' }}>Features</button>
            <button onClick={() => scrollTo('sets')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1rem' }}>Problem Sets</button>
            <a href="https://github.com/bobthechemist/qca-homework-helper" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>GitHub</a>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Master Analytical Chemistry
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            A seeded, deterministic problem generator. Perfect for students seeking mastery and instructors creating reproducible assessments.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => scrollTo('sets')} style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', border: 'none', borderRadius: '8px', color: '#0a0e27', fontWeight: 'bold', fontSize: '1rem' }}>
              Start Practicing
            </button>
          </div>
        </div>
        
        {/* Demo Card Visual */}
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,217,255,0.2)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}></div>
            <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Problem Preview</span>
                <span style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px' }}>seed: 42891</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-secondary)' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Calculate Molarity</h3>
                <p>Dissolve 12.45 g of NaCl·2H₂O (98.5% pure) in 250.0 mL.</p>
            </div>
        </div>
      </section>

      {/* Problem Sets Grid */}
      <section id="sets" style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem' }}>
        <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>Select a Module</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* SET 1 */}
            <Link to="/set-1" style={{ textDecoration: 'none' }}>
                <div className="problem-card" style={{ height: '100%', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>SET 01</div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Accuracy & Precision</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Data quality stats, glassware hierarchy, and tolerance math.</p>
                </div>
            </Link>

            {/* SET 2 */}
            <Link to="/set-2" style={{ textDecoration: 'none' }}>
                <div className="problem-card" style={{ height: '100%', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>SET 02</div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Solutions & Dilutions</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Molarity, Unit Fluidity (ppm/ppb), and Serial Dilutions.</p>
                </div>
            </Link>

             {/* SET 3 */}
             <Link to="/set-3" style={{ textDecoration: 'none' }}>
                <div className="problem-card" style={{ height: '100%', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>SET 03</div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Sample Prep & Analysis</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Back-calculations, Percent Recovery, and Blanks logic.</p>
                </div>
            </Link>

        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,217,255,0.1)' }}>
        <p style={{ fontFamily: 'JetBrains Mono' }}>Built for CHM 313 at SUNY Brockport</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MathJaxContext config={config}>
      <Background />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/set-1" element={<ProblemSet1 />} />
          <Route path="/set-2" element={<ProblemSet2 />} />
          <Route path="/set-3" element={<ProblemSet3 />} />
        </Routes>
      </Router>
    </MathJaxContext>
  );
}