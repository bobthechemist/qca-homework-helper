import React from 'react';
import ProblemSetLayout from '../components/ProblemSetLayout';
import { genDataQuality, genGlasswareConcepts, genTolerance, genMeniscus } from '../logic/set1Generators';

const TOPICS = [
  { id: 'data',      name: 'Data Quality (RSD/Error)', gen: genDataQuality },
  { id: 'glass',     name: 'Glassware Concepts', gen: genGlasswareConcepts },
  { id: 'tolerance', name: 'Tolerance Math', gen: genTolerance },
  { id: 'meniscus',  name: 'Reading Meniscus', gen: genMeniscus }
];

export default function ProblemSet1() {
  return (
    <ProblemSetLayout 
      title="🎯 Accuracy, Precision & Glassware"
      topics={TOPICS}
      description="Master glassware concepts, statistics, and sig figs. (Note: Meniscus problems require exact Sig Figs!)"
    />
  );
}