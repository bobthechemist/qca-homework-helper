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
    parts: [
      "Dissolve ",
      `${mass.toFixed(3)} g`,
      " of ",
      { isChem: true, val: cmp.formula },
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

// UPDATED: Bi-directional and Varied Units
export const genUnitConversion = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  
  // Decide Direction: 0 = M -> ppm, 1 = ppm -> M
  const direction = Math.floor(rng() * 2);

  // Randomize Unit Labels
  const mLabel = getRandom(["M", "mol/L", "mmol/mL"], rng);
  const ppmLabel = getRandom(["ppm", "mg/L", "ug/mL"], rng);

  if (direction === 0) {
    // M -> ppm
    const rawM = (rng() * 0.1) + 0.001; 
    const startM = parseFloat(rawM.toPrecision(3));
    const ansPPM = startM * cmp.mw * 1000;

    return {
      type: "Unit Conversion",
      parts: [
        "A sample of ",
        { isChem: true, val: cmp.formula },
        " has a concentration of ",
        `${startM} ${mLabel}`,
        `. Calculate this concentration in ${ppmLabel}.`
      ],
      answer: ansPPM,
      unit: ppmLabel,
      hintParts: [
        `Convert ${mLabel} to g/L using the molar mass (${cmp.mw} g/mol), then multiply by 1000 to get mg/L (ppm).`
      ]
    };
  } else {
    // ppm -> M
    const rawPPM = (rng() * 500) + 10; // 10 to 500 ppm
    const startPPM = parseFloat(rawPPM.toPrecision(3));
    // mg/L / 1000 = g/L.  g/L / MW = mol/L
    const ansM = (startPPM / 1000) / cmp.mw;

    return {
      type: "Unit Conversion",
      parts: [
        "A solution of ",
        { isChem: true, val: cmp.formula },
        " contains ",
        `${startPPM} ${ppmLabel}`,
        `. Calculate the Molarity (${mLabel}).`
      ],
      answer: ansM,
      unit: mLabel,
      hintParts: [
        `Convert ${ppmLabel} (mg/L) to g/L by dividing by 1000. Then divide by the molar mass (${cmp.mw} g/mol).`
      ]
    };
  }
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
      { isChem: true, val: cmp.formula },
      "?"
    ],
    answer: conc * count,
    unit: "M",
    hintParts: [
      "For every 1 molecule of ",
      { isChem: true, val: cmp.formula },
      ", there are ",
      `${count}`,
      " ions of ",
      { isChem: true, val: ionName },
      "."
    ]
  };
};

export const genDilution = (seed) => {
  const rng = seedrandom(seed);
  const cmp = getRandom(COMPOUNDS, rng);
  
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

export const genSerialDilution = (seed) => {
  const rng = seedrandom(seed);
  
  // --- Step 1 Generation ---
  const p1 = getRandom([1, 2, 3, 4, 5, 10, 20, 25], rng);
  const f1 = getRandom([50, 100, 250, 500], rng);

  // --- Step 2 Generation ---
  // Constraint: The aliquot for Step 2 (p2) must be less than the total vol of Step 1 (f1).
  // We filter the standard pipet sizes to ensure this physical reality.
  const possibleP2 = [1, 2, 3, 4, 5, 10, 20, 25, 50].filter(vol => vol < f1);
  
  // Fallback: If f1 is tiny (rare), just pick 1mL, but our inputs make this safe.
  const p2 = getRandom(possibleP2.length > 0 ? possibleP2 : [1], rng);
  const f2 = getRandom([50, 100, 250, 500, 1000], rng);

  // --- Calculation ---
  const df1 = f1 / p1;
  const df2 = f2 / p2;
  const totalDF = df1 * df2;

  // Decide Problem Type: 0 = Calculate Total DF, 1 = Back Calculate Stock
  const type = Math.floor(rng() * 2);

  if (type === 0) {
    return {
      type: "Serial Dilution",
      parts: [
        "You perform a two-step serial dilution. Step 1: Transfer ",
        `${p1} mL`,
        " of stock solution into a ",
        `${f1} mL`,
        " volumetric flask and dilute to the mark. Step 2: Transfer ",
        `${p2} mL`,
        " from the first flask into a ",
        `${f2} mL`,
        " flask and dilute to the mark. What is the Total Dilution Factor?"
      ],
      answer: totalDF,
      unit: "", // Dimensionless
      hintParts: [
        "Calculate the DF for each step (Flask / Pipet). The Total DF is the product of the individual steps."
      ]
    };
  } else {
    // Back Calculation
    // Pick a nice "Final" concentration (e.g. 5 ppm)
    const finalConc = getRandom([0.5, 1, 2, 5, 10], rng);
    const stockConc = finalConc * totalDF;

    return {
      type: "Serial Dilution",
      parts: [
        "You perform a two-step serial dilution (Step 1: ",
        `${p1} mL`,
        " into ",
        `${f1} mL`,
        "; Step 2: ",
        `${p2} mL`,
        " into ",
        `${f2} mL`,
        `). The final concentration is determined to be `,
        `${finalConc} ppm`,
        ". What was the concentration of the original stock solution?"
      ],
      answer: stockConc,
      unit: "ppm",
      hintParts: [
        `First calculate the Total DF. Then use: Stock = Final x Total DF.`
      ]
    };
  }
};