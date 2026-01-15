# 🧪 Quantitative Chemical Analysis (QCA) Homework Helper

A client-side web application designed to help college students master calculation-based concepts in Analytical Chemistry. This tool generates infinite, randomized practice problems with immediate feedback, utilizing a deterministic seeding system to allow instructors to reproduce specific problem instances.

## 🌟 Key Features

*   **Seeded Randomization:** Every problem is generated from a seed. Students can practice with random values, while instructors can use specific seeds to create reproducible quizzes or demonstrate specific examples.
*   **Two Modes:**
    *   **Practice Mode:** Focus on specific topic areas with immediate feedback and hints.
    *   **Quiz Mode:** Generates a fixed set of problems (2 per topic) and provides a summative assessment (Deficient, Developing, Proficient, Mastered).
*   **Chemical Realism:** Problem parameters are constrained to chemically realistic ranges (e.g., you won't see a 500 M solution).
*   **Rich Visualizations:**
    *   Dynamic SVG rendering for reading menisci (Burets vs. Graduated Cylinders).
    *   MathJax formatting for professional chemical formulas and equations.

## 📚 Problem Sets

### Set 1: Accuracy, Precision, and Glassware
Focuses on statistical literacy and data quality.
*   **Data Quality:** Calculation of Relative Standard Deviation (ppt) and Percent Error (paying attention to sign).
*   **Glassware Concepts:** Scenario-based selection of appropriate glassware (TC vs. TD).
*   **Tolerance Math:** Converting between absolute ($\pm$ mL) and relative (%) tolerance.
*   **Reading Glassware:** Interactive SVG component requiring students to read volume to the correct number of significant figures based on the glassware type (Buret vs. Cylinder).

### Set 2: Solutions and Dilutions
Focuses on stoichiometry, unit fluidity, and dilution logic.
*   **Molarity:** Calculation from mass/volume, handling hydrates and purity.
*   **Unit Fluidity:** Bi-directional conversions (Molarity $\leftrightarrow$ ppm/mg/L), handling variable unit labels.
*   **Ion Stoichiometry:** Calculating $[Ion]$ vs $[Salt]$.
*   **Dilutions:** $C_1V_1 = C_2V_2$ logic.
*   **Serial Dilutions:** Multi-step dilution logic involving constraints (step volume < flask volume) and back-calculations.

## 🛠️ Technical Stack

*   **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Routing:** React Router (HashRouter for GitHub Pages compatibility)
*   **Math/Logic:** Custom JavaScript generators utilizing `seedrandom` for deterministic outputs.
*   **Formatting:** `better-react-mathjax` for LaTeX/Chemistry rendering.
*   **Deployment:** GitHub Pages.

## 📂 Project Structure

The project separates mathematical logic from the user interface to ensure scalability:

```text
src/
├── components/      # Reusable UI (Chem.jsx, Meniscus.jsx)
├── data/            # Chemical constants and databases
├── logic/           # Pure JS functions for problem generation and solving
├── pages/           # React views (ProblemSet1.jsx, ProblemSet2.jsx)
└── App.jsx          # Main Router configuration
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/qca-homework-helper.git
    ```
2.  Install dependencies:
    ```bash
    cd qca-homework-helper
    npm install
    ```

### Local Development
Run the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

## 🚢 Deployment

This project is configured for **GitHub Pages**.

To deploy a new version to the live site:
```bash
npm run deploy
```
*Note: This runs the build script and pushes the `dist` folder to the `gh-pages` branch.*

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
