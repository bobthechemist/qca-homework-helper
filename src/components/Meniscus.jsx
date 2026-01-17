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
      // Buret: Min (0) at Top, Max (50) at Bottom
      return pct * height;
    } else {
      // Cylinder: Min (0) at Bottom, Max (50) at Top
      return height - (pct * height);
    }
  };

  // Generate Tick Marks
  const ticks = [];
  for (let i = 0; i <= range * 10; i++) {
    const v = min + (i / 10);
    const y = scaleY(v);
    
    // Floating point math fix for loop
    const isMajor = Math.abs(i % 10) < 0.001; 
    const isMiddle = Math.abs(i % 10 - 5) < 0.001;
    
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

  // --- MENISCUS GEOMETRY FIX ---
  // A quadratic bezier curve (Q) goes from Start to End, pulled towards a Control Point.
  // The curve passes through the midpoint of the Control Point depth.
  // We want the BOTTOM of the curve to match scaleY(volume).
  
  const meniscusDepth = 10; // Total pixel height of the curve
  const curveBottomOffset = meniscusDepth / 2; // The visual bottom of a symmetric Q curve
  
  // We shift the "water level" UP (negative Y) so that the dip hits the target line
  const liquidY = scaleY(volume) - curveBottomOffset;

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
        <rect 
          x="0" 
          y={liquidY} 
          width="100" 
          height={height - liquidY} 
          fill="url(#liquidGrad)" 
        />
        
        {/* Meniscus Curve (White scoop) */}
        {/* 
           M 0,Y           -> Start at left wall, water level
           Q 50,Y+Depth    -> Pull down towards center (creates the curve)
           100,Y           -> End at right wall
           L ...           -> Close the shape upwards to fill the gap
        */}
        <path 
          d={`M 0,${liquidY} Q 50,${liquidY + meniscusDepth} 100,${liquidY} L 100,${liquidY-20} L 0,${liquidY-20} Z`} 
          fill="white" 
        />
        
        {/* Walls */}
        <line x1="0" y1="0" x2="0" y2={height} stroke="#888" strokeWidth="2" />
        <line x1="100" y1="0" x2="100" y2={height} stroke="#888" strokeWidth="2" />

        {/* Ticks */}
        {ticks}
        
        {/* OPTIONAL DEBUG: Uncomment this to see a red line where the answer actually is */}
        {/* <line x1="0" y1={scaleY(volume)} x2="100" y2={scaleY(volume)} stroke="red" strokeWidth="0.5" opacity="0.5" /> */}
      </svg>
    </div>
  );
}