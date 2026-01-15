// src/logic/set2Generators.js
import seedrandom from 'seedrandom';
import { COMPOUNDS } from '../data/chemicals';

// Helper to get random item
const getRandom = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// Helper to round a number to specific sig figs/decimals for consistent logic
// "sig" = 0 means fixed decimal places (e.g. 2 means 0.00)
const roundTo = (num, places) => parseFloat(num.toFixed(places));

// --- PROBLEM TYPE 1: Basic Molarity ---
export const genMolarity = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  const volL = getRandom([0.1, 0.25, 0.5, 1.0], rng);
  
  // FIX: Decide mass first, then calculate Molarity.
  // This mimics real lab work: you weigh a specific mass (e.g., 2.50 g), not "2.38192 g"
  const rawMass = (rng() * 4.5) + 0.5;
  const mass = roundTo(rawMass, 3); // Round to 3 decimal places (e.g., 1.250 g)
  
  const moles = mass / cmp.mw;
  const molarity = moles / volL;

  return {
    type: "Molarity Calculation",
    text: `Dissolve ${mass.toFixed(3)} g of ${cmp.name} (${cmp.formula}, MW: ${cmp.mw}) in a ${volL*1000} mL volumetric flask. Calculate the Molarity.`,
    answer: molarity, // Logic now follows the displayed mass exactly
    unit: "M",
    hint: `Moles = Mass / MW. Molarity = Moles / Liters.`
  };
};

// --- PROBLEM TYPE 2: Unit Fluidity (M -> ppm) ---
export const genUnitConversion = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  
  // FIX: Round the starting Molarity so the student starts with a clean number
  const rawM = (rng() * 0.1) + 0.001; 
  const startM = parseFloat(rawM.toPrecision(3)); // 3 Sig Figs (e.g. 0.0543 M)
  
  const ansPPM = startM * cmp.mw * 1000;

  return {
    type: "Unit Conversion",
    text: `A sample of ${cmp.name} has a concentration of ${startM} M. Calculate this concentration in ppm (mg/L).`,
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
  
  const ionName = getRandom(Object.keys(cmp.ions), rng);
  const count = cmp.ions[ionName];
  
  // FIX: Round the concentration BEFORE calculating the answer
  const rawConc = (rng() * 0.5) + 0.1;
  const conc = roundTo(rawConc, 3); // 3 decimal places (e.g. 0.125 M)

  return {
    type: "Ion Concentration",
    text: `What is the concentration of [${ionName}] in a ${conc.toFixed(3)} M solution of ${cmp.name}?`,
    answer: conc * count, // Now 0.11 * 1 = 0.11 exactly
    unit: "M",
    hint: `Look at the formula: ${cmp.formula}. How many ${ionName} are in one molecule?`
  };
};

// --- PROBLEM TYPE 4: Dilution (C1V1 = C2V2) ---
export const genDilution = (seed) => {
  const rng = seedrandom(seed);
  
  const v1 = getRandom([1, 2, 5, 10, 20, 25], rng);
  const v2 = getRandom([50, 100, 250, 500], rng);
  
  if (v1 >= v2) return genDilution(seed + "retry"); 

  // FIX: Round the stock concentration to 2 or 3 decimals
  const rawC1 = (rng() * 2.0) + 0.5;
  const c1 = roundTo(rawC1, 2); // e.g., 1.55 M

  const c2 = (c1 * v1) / v2;

  return {
    type: "Dilution",
    text: `You transfer ${v1} mL of a ${c1.toFixed(2)} M stock solution into a ${v2} mL volumetric flask and dilute to the mark. What is the final concentration?`,
    answer: c2,
    unit: "M",
    hint: `Use C1V1 = C2V2.`
  };
};