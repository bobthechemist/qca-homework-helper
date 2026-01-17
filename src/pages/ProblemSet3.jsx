import React from 'react';
import ProblemSetLayout from '../components/ProblemSetLayout';
import { genSoilAnalysis, genRecovery, genDefinitions, genPurityAnalysis } from '../logic/set3Generators';

const TOPICS = [
  { id: 'backcalc', name: 'Back Calculation (Soil)', gen: genSoilAnalysis },
  { id: 'recovery', name: 'Percent Recovery', gen: genRecovery },
  { id: 'defs',     name: 'Blanks & Sampling', gen: genDefinitions },
  { id: 'purity',   name: 'Purity Analysis', gen: genPurityAnalysis }
];

export default function ProblemSet3() {
  return (
    <ProblemSetLayout 
      title="⚗️ Sample Prep & Analysis"
      topics={TOPICS}
      description="Focus on analytical workflows, blank corrections, and QA/QC math."
    />
  );
}