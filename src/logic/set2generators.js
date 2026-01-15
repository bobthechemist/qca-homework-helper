// src/logic/set2Generators.js
import seedrandom from 'seedrandom';
import { COMPOUNDS } from '../data/chemicals';

// Helper to get random item
const getRandom = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// --- PROBLEM TYPE 1: Basic Molarity ---
export const genMolarity = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  const volL = getRandom([0.1, 0.25, 0.5, 1.0], rng);
  
  // Target Molarity (0.01 - 0.5 M)
  const targetM = (rng() * 0.49) + 0.01; 
  const mass = targetM * volL * cmp.mw;

  return {
    type: "Molarity Calculation",
    text: `Dissolve ${mass.toFixed(3)} g of ${cmp.name} (${cmp.formula}) in a ${volL*1000} mL volumetric flask. Calculate the Molarity.`,
    answer: targetM,
    unit: "M",
    hint: `Moles = Mass / MW (${cmp.mw}). Molarity = Moles / Liters.`
  };
};

// --- PROBLEM TYPE 2: Unit Fluidity (M -> ppm) ---
export const genUnitConversion = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  
  // Start with a Molarity
  const startM = (rng() * 0.1) + 0.001; // 1mM to 100mM
  
  // Calculate ppm (mg/L) -> M * MW * 1000
  const ansPPM = startM * cmp.mw * 1000;

  return {
    type: "Unit Conversion",
    text: `A sample of ${cmp.name} has a concentration of ${startM.toPrecision(3)} M. Calculate this concentration in ppm (mg/L).`,
    answer: ansPPM,
    unit: "ppm",
    hint: `ppm is mg/L. Convert M (mol/L) to g/L using MW (${cmp.mw}), then to mg/L.`
  };
};

// --- PROBLEM TYPE 3: Ion Stoichiometry ---
export const genStoichiometry = (seed) => {
  const rng = seedrandom(seed);
  // Filter for only salts (must have ions)
  const salts = COMPOUNDS.filter(c => Object.keys(c.ions).length > 0);
  const cmp = getRandom(salts, rng);
  
  // Pick an ion
  const ionName = getRandom(Object.keys(cmp.ions), rng);
  const count = cmp.ions[ionName];
  
  const conc = (rng() * 0.5) + 0.1;

  return {
    type: "Ion Concentration",
    text: `What is the concentration of [${ionName}] in a ${conc.toFixed(2)} M solution of ${cmp.name}?`,
    answer: conc * count,
    unit: "M",
    hint: `Look at the formula: ${cmp.formula}. How many ${ionName} are in one molecule?`
  };
};

// --- PROBLEM TYPE 4: Dilution (C1V1 = C2V2) ---
export const genDilution = (seed) => {
  const rng = seedrandom(seed);
  
  // V1 (Aliquot) usually small: 1, 5, 10, 25 mL
  const v1 = getRandom([1, 2, 5, 10, 20, 25], rng);
  // V2 (Flask) usually standard: 50, 100, 250, 500 mL
  const v2 = getRandom([50, 100, 250, 500], rng);
  
  // Ensure V2 > V1
  if (v1 >= v2) return genDilution(seed + "retry"); 

  const c1 = (rng() * 2.0) + 0.5; // Stock solution
  const c2 = (c1 * v1) / v2;

  return {
    type: "Dilution",
    text: `You transfer ${v1} mL of a ${c1.toFixed(2)} M stock solution into a ${v2} mL volumetric flask and dilute to the mark. What is the final concentration?`,
    answer: c2,
    unit: "M",
    hint: `Use C1V1 = C2V2. Don't forget to check your units.`
  };
};