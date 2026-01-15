// src/logic/set3Generators.js
import seedrandom from 'seedrandom';

// --- HELPERS ---
const getRandom = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const roundTo = (num, places) => parseFloat(num.toFixed(places));

// --- 1. THE BACK-CALCULATION (Soil Analysis) ---
export const genSoilAnalysis = (seed) => {
  const rng = seedrandom(seed);

  // Variables
  const massSoil = roundTo((rng() * 1.0) + 0.5, 4); // 0.5000 to 1.5000 g
  const flaskVol = getRandom([25, 50, 100], rng); // mL
  
  // Instrument Readout (ppm or ug/mL)
  // Let's assume a realistic soil conc of 20-100 ppm, so digestate is lower
  const targetSoilConc = (rng() * 80) + 20; // ug/g
  const totalUg = targetSoilConc * massSoil; // Total ug in flask
  const instReadout = roundTo(totalUg / flaskVol, 3); // ug/mL

  // Re-calculate answer from rounded readout to ensure "What you see is what you calc"
  const calcTotalUg = instReadout * flaskVol;
  const ansSoilConc = calcTotalUg / massSoil;

  return {
    type: "Sample Preparation",
    parts: [
      `You are analyzing a soil sample for Copper. You weigh `,
      `${massSoil.toFixed(4)} g`,
      ` of soil and digest it in acid. You transfer the digestate to a `,
      `${flaskVol} mL`,
      ` volumetric flask and dilute to the mark. The instrument measures the concentration of the flask solution to be `,
      `${instReadout} µg/mL`,
      `. Calculate the concentration of Copper in the original soil sample (in µg/g).`
    ],
    answer: ansSoilConc,
    unit: "µg/g",
    hintParts: [
      "1. Find total mass of Cu in the flask: Conc (µg/mL) × Volume (mL) = Total µg.",
      " 2. Divide Total µg by Mass of Soil (g)."
    ]
  };
};

// --- 2. PERCENT RECOVERY (Spike) ---
export const genRecovery = (seed) => {
  const rng = seedrandom(seed);

  const unspikedConc = roundTo((rng() * 10) + 5, 2); // e.g. 12.5 ppm
  const addedSpike = roundTo((rng() * 10) + 5, 2);   // e.g. 10.0 ppm
  
  // Randomize Recovery between 80% and 120%
  const recovery = (rng() * 0.4) + 0.8; 
  
  // Calculate the "Result" the student sees
  // Recovery = (Spiked - Unspiked) / Added
  // Spiked = (Recovery * Added) + Unspiked
  const spikedConc = roundTo((recovery * addedSpike) + unspikedConc, 2);
  
  // Back calculate exact answer from rounded values
  const ansRecovery = ((spikedConc - unspikedConc) / addedSpike) * 100;

  return {
    type: "QA/QC",
    parts: [
      `Quality Control Check: You analyze a sample and find a concentration of `,
      `${unspikedConc} ppm`,
      `. You then perform a Matrix Spike by adding `,
      `${addedSpike} ppm`,
      ` of analyte to the sample. The spiked sample reads `,
      `${spikedConc} ppm`,
      `. Calculate the Percent Recovery.`
    ],
    answer: ansRecovery,
    unit: "%",
    hintParts: [
      "% Recovery = ( (Spiked Result - Unspiked Result) / Amount Added ) × 100"
    ]
  };
};

// --- 3. BLANKS & SAMPLING (Definitions) ---
const DEFINITIONS = [
  // BLANKS
  { 
    q: "In your method, reagents are added to a digestion bomb w/o sediment and processed exactly like samples.", 
    a: "Method Blank", 
    opts: ["Method Blank", "Reagent Blank", "Instrument Blank", "Field Blank"] 
  },
  { 
    q: "Reagents are added directly to a volumetric flask and diluted (no digestion process performed).", 
    a: "Reagent Blank", 
    opts: ["Method Blank", "Reagent Blank", "Instrument Blank", "Field Blank"] 
  },
  { 
    q: "Plain deionized water is analyzed as a sample to check the baseline of the machine.", 
    a: "Instrument Blank", 
    opts: ["Method Blank", "Reagent Blank", "Instrument Blank", "Field Blank"] 
  },
  // SAMPLING
  { 
    q: "The initial large sample obtained from the field that is representative of the whole.", 
    a: "Gross Sample", 
    opts: ["Gross Sample", "Lab Sample", "Aliquot", "Specimen"] 
  },
  { 
    q: "The smaller, homogenized material reduced from the bulk material, suitable for handling in the lab.", 
    a: "Lab Sample", 
    opts: ["Gross Sample", "Lab Sample", "Aliquot", "Sampling Unit"] 
  },
  { 
    q: "The specific portion of the lab sample that is actually measured or analyzed.", 
    a: "Aliquot", 
    opts: ["Gross Sample", "Lab Sample", "Aliquot", "Lot"] 
  }
];

export const genDefinitions = (seed) => {
  const rng = seedrandom(seed);
  const def = getRandom(DEFINITIONS, rng);
  const shuffled = [...def.opts].sort(() => 0.5 - rng());

  return {
    type: "Terminology",
    isMultipleChoice: true,
    parts: [def.q],
    answer: def.a,
    options: shuffled,
    unit: "",
    hintParts: ["Method = Whole Process. Reagent = Just Chemicals. Instrument = Just Machine."]
  };
};

// --- 4. WEIGHING BY DIFFERENCE (Purity Titration) ---
export const genPurityAnalysis = (seed) => {
  const rng = seedrandom(seed);
  
  // 1. Set up the Titration
  const molarityHCl = roundTo((rng() * 0.05) + 0.09, 4); // ~0.1000 M
  const purity = (rng() * 0.15) + 0.85; // 85% to 100% pure
  
  // 2. Generate Mass Data
  const bottleMass = roundTo((rng() * 5) + 20, 4); // 20.0000 - 25.0000 g
  const sampleMass = roundTo((rng() * 0.2) + 0.15, 4); // 0.1500 - 0.3500 g
  
  const initialMass = bottleMass + sampleMass;
  const finalMass = bottleMass; // We assume they poured it all out for simplicity/clarity
  
  // 3. Stoichiometry: Na2CO3 + 2HCl -> ...
  const mwCarb = 105.99;
  const actualMassCarb = sampleMass * purity;
  const molesCarb = actualMassCarb / mwCarb;
  const molesHCl = molesCarb * 2;
  
  // 4. Calculate Volume Required
  const volHCl_L = molesHCl / molarityHCl;
  const volHCl_mL = volHCl_L * 1000;
  
  // 5. Generate Buret Readings
  // Check bounds: Buret usually 50mL. If vol > 45, retry (simple recursion)
  if (volHCl_mL > 45) return genPurityAnalysis(seed + "retry");
  
  const initialVol = roundTo(rng() * 2, 2); // 0.00 to 2.00 mL
  const finalVol = roundTo(initialVol + volHCl_mL, 2);
  
  // 6. Calculate Answer based on Visual Data
  const calcVolL = (finalVol - initialVol) / 1000;
  const calcMolesHCl = calcVolL * molarityHCl;
  const calcMolesCarb = calcMolesHCl / 2;
  const calcMassCarb = calcMolesCarb * mwCarb;
  const percentPurity = (calcMassCarb / sampleMass) * 100;

  return {
    type: "Gravimetric Analysis",
    parts: [
      "A sample of impure ",
      { isChem: true, val: "Na2CO3" },
      " is analyzed by titration with standardized HCl. ",
      "The sample is measured by difference. ",
      "Mass of weighing bottle + sample: ", `${initialMass.toFixed(4)} g. `,
      "Mass of weighing bottle after transfer: ", `${finalMass.toFixed(4)} g. `,
      "The sample is dissolved and titrated with ", `${molarityHCl} M`, " HCl. ",
      "Buret Initial: ", `${initialVol.toFixed(2)} mL. `,
      "Buret Final: ", `${finalVol.toFixed(2)} mL. `,
      "Calculate the % Purity (w/w) of the sodium carbonate."
    ],
    answer: percentPurity,
    unit: "%",
    hintParts: [
      "1. Find Sample Mass (Init - Final). ",
      "2. Find Vol HCl (Final - Init). ",
      "3. Moles HCl = M × V. ",
      "4. Moles Na2CO3 = Moles HCl / 2. ",
      "5. Mass Na2CO3 = Moles × 105.99. ",
      "6. % = (Mass Na2CO3 / Sample Mass) × 100."
    ]
  };
};