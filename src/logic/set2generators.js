// src/logic/set2Generators.js
import seedrandom from 'seedrandom';
import { COMPOUNDS } from '../data/chemicals';

// --- HELPERS ---

const getRandom = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const roundTo = (num, places) => parseFloat(num.toFixed(places));

// --- GENERATORS ---

export const genMolarity = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  const volL = getRandom([0.1, 0.25, 0.5, 1.0], rng);
  
  const rawMass = (rng() * 4.5) + 0.5;
  const mass = roundTo(rawMass, 3);

  const moles = mass / cmp.mw;
  const molarity = moles / volL;

  return {
    type: "Molarity Calculation",
    // NOTE: 'parts' array triggers the MathJax rendering
    parts: [
      "Dissolve ",
      `${mass.toFixed(3)} g`,
      " of ",
      { isChem: true, val: cmp.formula }, // <--- Formula used here
      ` (${cmp.name}) in a `,
      `${volL * 1000} mL`,
      " volumetric flask. Calculate the Molarity."
    ],
    answer: molarity,
    unit: "M",
    hintParts: [
      "Moles = Mass / MW (", 
      `${cmp.mw} g/mol`, 
      "). Molarity = Moles / Liters."
    ]
  };
};

export const genUnitConversion = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  
  const rawM = (rng() * 0.1) + 0.001; 
  const startM = parseFloat(rawM.toPrecision(3));

  const ansPPM = startM * cmp.mw * 1000;

  return {
    type: "Unit Conversion",
    parts: [
      "A sample of ",
      { isChem: true, val: cmp.formula },
      " has a concentration of ",
      `${startM} M`,
      ". Calculate this concentration in ppm (mg/L)."
    ],
    answer: ansPPM,
    unit: "ppm",
    hintParts: [
      "ppm is mg/L. Convert M (mol/L) to g/L using MW."
    ]
  };
};

export const genStoichiometry = (seed) => {
  const rng = seedrandom(seed);
  const salts = COMPOUNDS.filter(c => Object.keys(c.ions).length > 0);
  const cmp = getRandom(salts, rng);
  
  const ionName = getRandom(Object.keys(cmp.ions), rng);
  const count = cmp.ions[ionName];
  
  const rawConc = (rng() * 0.5) + 0.1;
  const conc = roundTo(rawConc, 3); 

  return {
    type: "Ion Concentration",
    parts: [
      "What is the concentration of ",
      { isChem: true, val: `[${ionName}]` },
      " in a ",
      `${conc.toFixed(3)} M`,
      " solution of ",
      { isChem: true, val: cmp.formula }, // <--- New code uses Formula, not Name
      "?"
    ],
    answer: conc * count,
    unit: "M",
    hintParts: [
      "Look at the formula ",
      { isChem: true, val: cmp.formula },
      ". For every 1 molecule, there are ",
      `${count}`,
      " ions of ",
      { isChem: true, val: ionName },
      "."
    ]
  };
};

export const genDilution = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng); // Added cmp logic for flavor
  
  const v1 = getRandom([1, 2, 5, 10, 20, 25], rng);
  const v2 = getRandom([50, 100, 250, 500], rng);
  
  if (v1 >= v2) return genDilution(seed + "retry"); 

  const rawC1 = (rng() * 2.0) + 0.5;
  const c1 = roundTo(rawC1, 2); 

  const c2 = (c1 * v1) / v2;

  return {
    type: "Dilution",
    parts: [
      "You transfer ",
      `${v1} mL`,
      " of a ",
      `${c1.toFixed(2)} M`,
      " stock solution of ",
      { isChem: true, val: cmp.formula },
      " into a ",
      `${v2} mL`,
      " volumetric flask and dilute to the mark. What is the final concentration?"
    ],
    answer: c2,
    unit: "M",
    hintParts: [
      "Use C1V1 = C2V2."
    ]
  };
};