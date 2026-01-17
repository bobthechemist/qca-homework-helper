import React, { useEffect, useRef } from 'react';

export default function Background() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Clear existing to prevent duplicates on re-render
    container.innerHTML = '';

    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      // Inline styles for the specific particle
      particle.style.position = 'absolute';
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.background = 'var(--accent-primary)';
      particle.style.borderRadius = '50%';
      particle.style.animation = 'float 20s infinite ease-in-out';
      
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 200;
      const delay = Math.random() * 20;
      
      particle.style.left = startX + '%';
      particle.style.top = startY + '%';
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.animationDelay = delay + 's';
      
      container.appendChild(particle);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: -1, opacity: 0.4, pointerEvents: 'none'
      }}
    />
  );
}