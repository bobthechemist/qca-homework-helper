import seedrandom from 'seedrandom';

// --- HELPERS ---
const getRandom = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const roundTo = (num, places) => parseFloat(num.toFixed(places));

// --- 1. DATA QUALITY (RSD / % Error) ---
export const genDataQuality = (seed) => {
  const rng = seedrandom(seed);
  
  const trueVal = roundTo((rng() * 50) + 10, 2);
  
  const noiseRange = 0.4; 
  const points = [];
  for(let i=0; i<4; i++) {
    const noise = (rng() * noiseRange) - (noiseRange/2);
    points.push(roundTo(trueVal + noise, 2));
  }

  const sum = points.reduce((a, b) => a + b, 0);
  const mean = sum / points.length;
  
  const sqDiffs = points.map(x => Math.pow(x - mean, 2));
  const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / (points.length - 1);
  const stdDev = Math.sqrt(avgSqDiff);

  const type = Math.floor(rng() * 2);

  if (type === 0) {
    // FIX: Removed Math.abs(). Now (Exp - True) / True
    const perError = ((mean - trueVal) / trueVal) * 100;
    return {
      type: "Data Quality",
      parts: [
        `A student attempts to measure a standard with a known true value of ${trueVal}. Their results are: `,
        points.join(", "),
        ". Calculate the Percent Error of their mean. (Pay attention to the sign!)"
      ],
      answer: perError,
      unit: "%",
      hintParts: ["Mean = Sum/n. % Error = (Mean - True) / True * 100"]
    };
  } else {
    // RSD is always positive
    const rsdPPT = (stdDev / mean) * 1000;
    return {
      type: "Data Quality",
      parts: [
        `Calculate the Relative Standard Deviation (RSD) in parts per thousand (ppt) for this dataset: `,
        points.join(", ")
      ],
      answer: rsdPPT,
      unit: "ppt",
      hintParts: ["1. Calculate Mean. 2. Calculate Std Dev (s). 3. RSD (ppt) = (s / mean) * 1000."]
    };
  }
};

// --- 2. GLASSWARE CONCEPTS (Qualitative) ---
const SCENARIOS = [
  { text: "You need to measure exactly 25.00 mL of standard solution to prepare a dilution.", correct: "Volumetric Pipet", options: ["Beaker", "Graduated Cylinder", "Volumetric Pipet"] },
  { text: "You need to contain exactly 100.0 mL of solution at a precise concentration.", correct: "Volumetric Flask", options: ["Erlenmeyer Flask", "Volumetric Flask", "Beaker"] },
  { text: "You need to quickly dispense approx 50 mL of water where high precision is not required.", correct: "Graduated Cylinder", options: ["Buret", "Volumetric Pipet", "Graduated Cylinder"] },
  { text: "Which glassware is calibrated 'To Deliver' (TD)?", correct: "Buret", options: ["Volumetric Flask", "Beaker", "Buret"] },
  { text: "Which glassware is calibrated 'To Contain' (TC)?", correct: "Volumetric Flask", options: ["Volumetric Flask", "Volumetric Pipet", "Buret"] }
];

export const genGlasswareConcepts = (seed) => {
  const rng = seedrandom(seed);
  const scenario = getRandom(SCENARIOS, rng);
  
  // Shuffle options so the answer isn't always the same position
  const shuffledOptions = [...scenario.options].sort(() => 0.5 - rng());

  return {
    type: "Glassware Concepts",
    isMultipleChoice: true, // Signal to UI to render buttons
    parts: [scenario.text],
    answer: scenario.correct,
    options: shuffledOptions,
    unit: "",
    hintParts: ["Think about Accuracy (Exact vs Approx) and Function (Holding vs Moving liquid)."]
  };
};

// --- 3. TOLERANCE ---
export const genTolerance = (seed) => {
  const rng = seedrandom(seed);
  
  const items = [
    { name: "10 mL Volumetric Pipet", tol: 0.02 },
    { name: "50 mL Buret", tol: 0.05 },
    { name: "100 mL Volumetric Flask", tol: 0.08 },
    { name: "25 mL Volumetric Pipet", tol: 0.03 }
  ];
  const glass = getRandom(items, rng);
  // Extract volume number from name (e.g. "10")
  const vol = parseFloat(glass.name.split(" ")[0]);

  // Type 0: Calc % Tolerance
  // Type 1: Given % Tolerance, Calc Abs
  const type = Math.floor(rng() * 2);

  if (type === 0) {
    const relTol = (glass.tol / vol) * 100;
    return {
      type: "Tolerance Calculation",
      parts: [`A ${glass.name} has an absolute tolerance of ±${glass.tol} mL. Calculate the relative tolerance in %.`],
      answer: relTol,
      unit: "%",
      hintParts: ["Relative = (Absolute / Total Volume) * 100"]
    };
  } else {
    const relTol = (glass.tol / vol) * 100;
    // We give them the % (rounded nicely) and ask for absolute
    return {
      type: "Tolerance Calculation",
      parts: [`A ${glass.name} has a relative tolerance of ${relTol.toPrecision(2)}%. What is the absolute tolerance in mL?`],
      answer: glass.tol,
      unit: "mL",
      hintParts: ["Absolute = (Relative % / 100) * Total Volume"]
    };
  }
};

// --- 4. READING THE MENISCUS ---
export const genMeniscus = (seed) => {
  const rng = seedrandom(seed);
  
  // Decide Glassware Type
  const isBuret = rng() > 0.5;
  const glassType = isBuret ? 'buret' : 'cylinder';

  // Generate a volume base
  // Burets usually read 0-50, Cylinders vary. Let's stick to a 20-30 range segment.
  const whole = Math.floor(rng() * 3) + 20; // 20, 21, 22
  const decimal = rng(); 
  const trueVol = whole + decimal;
  
  const visualVol = roundTo(trueVol, 2);

  return {
    type: "Reading Glassware",
    isVisual: true,
    // Pass the glassType to the component
    props: { 
      volume: visualVol, 
      min: whole - 1, 
      max: whole + 2, 
      glassType: glassType 
    }, 
    parts: [
      `Read the volume in the ${glassType} shown below. Pay attention to the direction of the numbers and Significant Figures.`
    ],
    answer: visualVol,
    unit: "mL",
    checkSigFigs: 2,
    toleranceType: 'absolute', // Math check: Must be within absolute range
    tolerance: 0.02,           // The Range: +/- 0.02 mL
    hintParts: [
      isBuret 
        ? "For a Buret, numbers increase going DOWN. Be careful not to read it backwards." 
        : "For a Cylinder, numbers increase going UP."
    ]
  };
};