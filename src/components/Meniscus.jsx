import React from 'react';

// Renders a dynamic graduated cylinder or buret
// volume: The liquid level (e.g., 24.35)
// min/max: The visible range numbers (e.g., 23 to 26)
// glassType: 'cylinder' (nums go up) or 'buret' (nums go down)
export default function Meniscus({ volume, min, max, glassType = 'cylinder' }) {
  const height = 300;
  const range = max - min;

  // Convert a volume value to a Y pixel position
  const scaleY = (val) => {
    const pct = (val - min) / range;
    
    if (glassType === 'buret') {
      // Buret: Min value (e.g. 0) is at Top (0px)
      // Max value (e.g. 50) is at Bottom (300px)
      return pct * height;
    } else {
      // Cylinder: Min value (e.g. 0) is at Bottom (300px)
      // Max value is at Top (0px)
      return height - (pct * height);
    }
  };

  // Generate Tick Marks
  const ticks = [];
  // Loop from min to max with 0.1 increments
  // Using Math.round to fix floating point loop errors
  for (let i = 0; i <= range * 10; i++) {
    const v = min + (i / 10);
    const y = scaleY(v);
    
    const isMajor = i % 10 === 0; // x.0
    const isMiddle = i % 10 === 5; // x.5
    
    let length = 10; 
    if (isMajor) length = 25; 
    else if (isMiddle) length = 18;

    ticks.push(
      <g key={v.toFixed(1)}>
        <line x1="0" y1={y} x2={length} y2={y} stroke="black" strokeWidth="1" />
        {isMajor && (
          <text x="30" y={y + 5} fontSize="14" fontFamily="Arial">
            {v.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  const liquidY = scaleY(volume);
  const meniscusDepth = 8; 

  return (
    <div style={{ border: "1px solid #ccc", display: "inline-block", padding: "10px", background: "white" }}>
      <svg width="100" height={height} viewBox={`0 0 100 ${height}`}>
        {/* Gradients */}
        <defs>
          <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e0f7fa" />
            <stop offset="100%" stopColor="#b2ebf2" />
          </linearGradient>
        </defs>

        {/* Liquid Rectangle */}
        {/* Logic differs by glassware type because the "bottom" of the SVG is always y=300 */}
        <rect 
          x="0" 
          y={liquidY} 
          width="100" 
          height={height - liquidY} 
          fill="url(#liquidGrad)" 
        />
        
        {/* Meniscus Curve (White scoop) */}
        <path 
          d={`M 0,${liquidY} Q 50,${liquidY + meniscusDepth} 100,${liquidY} L 100,${liquidY-20} L 0,${liquidY-20} Z`} 
          fill="white" 
        />
        
        {/* Walls */}
        <line x1="0" y1="0" x2="0" y2={height} stroke="#888" strokeWidth="2" />
        <line x1="100" y1="0" x2="100" y2={height} stroke="#888" strokeWidth="2" />

        {/* Ticks */}
        {ticks}
      </svg>
    </div>
  );
}