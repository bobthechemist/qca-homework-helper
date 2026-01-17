import React from 'react';
import ProblemSetLayout from '../components/ProblemSetLayout';
import { genMolarity, genUnitConversion, genStoichiometry, genDilution, genSerialDilution } from '../logic/set2Generators';

const TOPICS = [
  { id: 'molarity', name: 'Molarity', gen: genMolarity },
  { id: 'units',    name: 'Unit Conversion', gen: genUnitConversion },
  { id: 'stoich',   name: 'Stoichiometry', gen: genStoichiometry },
  { id: 'dilution', name: 'Dilution', gen: genDilution },
  { id: 'serial',   name: 'Serial Dilution', gen: genSerialDilution }
];

export default function ProblemSet2() {
  return (
    <ProblemSetLayout 
      title="🧪 Solutions & Dilutions"
      topics={TOPICS}
      description="Note: Report all answers to 3 decimal places to be safe."
    />
  );
}