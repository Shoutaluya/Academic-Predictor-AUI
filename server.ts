import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Resolve ES Module directory globals safely for both ESM and CJS environments
// We use distinct names to avoid block-scoping clash and TDZ with global/wrapper variables
const resolvedFilename = typeof __filename !== 'undefined' && __filename 
  ? __filename 
  : (typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '');

const resolvedDirname = typeof __dirname !== 'undefined' && __dirname 
  ? __dirname 
  : (resolvedFilename ? path.dirname(resolvedFilename) : process.cwd());

// CSV parser helper to correctly parse commas inside double-quoted strings
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Filter out irrelevant academic challenges (e.g. "etc" or "but it does not affect me significantly") and standardize
function getStandardizedChallenge(ch: string): string | null {
  if (!ch) return null;
  const clean = ch.replace(/^"|"$/g, '').trim();
  const lower = clean.toLowerCase();
  
  // Relevancy filtering criteria
  if (
    lower === '' || 
    lower === 'none' || 
    lower === 'nil' || 
    lower === 'n/a' || 
    lower === 'no' || 
    lower === 'etc' ||
    lower.includes('etc.') ||
    lower.includes('none etc') ||
    lower.includes('does not affect me') || 
    lower.includes('doesn\'t affect me') || 
    lower.includes('do not affect me') || 
    lower.includes('don\'t affect me') ||
    lower.includes('no significant effect') ||
    lower.includes('not affect me')
  ) {
    return null;
  }
  
  // Categorical standardization
  if (clean.includes('Difficulty') || clean.includes('Difficult course') || lower.includes('difficult')) {
    return 'Difficult Course Content';
  } else if (clean.includes('Distractions') || lower.includes('distraction')) {
    return 'Environmental Distractions';
  } else if (clean.includes('Too many academic workload') || clean.includes('workload demands') || lower.includes('workload')) {
    return 'High Workload Demands';
  } else if (clean.includes('Lack of motivation') || lower.includes('motivation')) {
    return 'Lack of Motivation';
  } else if (clean.includes('Poor time management') || lower.includes('time management')) {
    return 'Poor Time Management';
  } else if (clean.includes('Health') || clean.includes('personal issues') || lower.includes('health')) {
    return 'Health & Personal Issues';
  } else if (clean.includes('academic support') || lower.includes('support')) {
    return 'Lack of Lecturer Support';
  } else if (clean.includes('Financial') || lower.includes('financial') || lower.includes('money')) {
    return 'Financial Bottlenecks';
  }
  
  // Capitalize first letter of each word as standard fallback
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

// Standard body parsers for both application/json (fetch) and x-www-form-urlencoded (forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Link the static assets folder
app.use('/static', express.static(path.join(resolvedDirname, 'static')));

// Define thread-safe analytical counter access
const COUNTER_PATH = path.join(resolvedDirname, 'counter.json');

function getAndIncrementCounter(): number {
  try {
    let count = 247;
    if (fs.existsSync(COUNTER_PATH)) {
      const data = JSON.parse(fs.readFileSync(COUNTER_PATH, 'utf8'));
      count = data.evaluation_count || 247;
    }
    count += 1;
    fs.writeFileSync(COUNTER_PATH, JSON.stringify({ evaluation_count: count }, null, 2), 'utf8');
    return count;
  } catch (err) {
    console.error('Error incrementing counter.json:', err);
    return 248;
  }
}

function getCurrentCounter(): number {
  try {
    if (fs.existsSync(COUNTER_PATH)) {
      const data = JSON.parse(fs.readFileSync(COUNTER_PATH, 'utf8'));
      return data.evaluation_count || 247;
    }
  } catch (err) {
    // Fail silently
  }
  return 247;
}

// -------------------------------------------------------------
// Core GET Page Route
// -------------------------------------------------------------
app.get('/', (req, res) => {
  const indexPath = path.join(resolvedDirname, 'templates', 'index.html');
  if (fs.existsSync(indexPath)) {
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Server-side replace the seeded counter evaluation directly into final html context
    const currentCount = getCurrentCounter();
    htmlContent = htmlContent.replace(
      /\{\{\s*evaluation_count\s*if\s*evaluation_count\s*else\s*247\s*\}\}/g,
      currentCount.toString()
    );
    
    res.setHeader('Content-Type', 'text/html');
    res.end(htmlContent);
  } else {
    res.status(404).send('Templates baseline UI path not configured.');
  }
});

// -------------------------------------------------------------
// Performance Inference POST Route
// -------------------------------------------------------------
app.post('/predict', (req, res) => {
  try {
    const data = req.body;
    
    // Extract variables with exact fallback definitions
    const level = parseInt(data.student_level || 100);
    const waec = parseInt(data.waec_score || 7);
    const jamb = parseInt(data.jamb_score || 250);
    const internal_test = parseInt(data.internal_test_score || 22);
    const first_sem_gpa = parseFloat(data.first_sem_gpa || 3.0);
    const attendance = parseInt(data.attendance_pct || 80);
    const carryovers = parseInt(data.carryover_count || 0);
    const assignment_rate = parseFloat(data.assignment_rate || 0.80);
    const study_hours = parseInt(data.study_hours || 4);
    
    // Core counter increment execution
    const newCount = getAndIncrementCounter();
    
    // -----------------------------------------------------------
    // Mathematical Random Forest Emulation Layer
    // Mirrors training weights mapping:
    // GPA (36%), Attendance (26%), Assignments (14%), CA Tests (10%), JAMB (4%), WAEC (5%), Study Hours (5%), Carryovers (-20% penalty)
    // -----------------------------------------------------------
    const normGpa = first_sem_gpa / 5.0;
    const normAtt = Math.max(0.0, Math.min(1.0, (attendance - 40.0) / 60.0));
    const normAssign = Math.max(0.0, Math.min(1.0, assignment_rate));
    const normInternal = Math.max(0.0, Math.min(1.0, (internal_test - 5.0) / 25.0));
    const normWaec = Math.max(0.0, Math.min(1.0, (waec - 1.0) / 9.0));
    const normJamb = Math.max(0.0, Math.min(1.0, (jamb - 100.0) / 300.0));
    const normStudy = Math.max(0.0, Math.min(1.0, study_hours / 10.0));
    const normCarryover = Math.max(0.0, Math.min(1.0, carryovers / 6.0));
    
    const linearCombination = (
      normGpa * 0.36 +
      normAtt * 0.26 +
      normAssign * 0.14 +
      normInternal * 0.10 +
      normStudy * 0.05 +
      normJamb * 0.04 +
      normWaec * 0.05 -
      normCarryover * 0.20
    );
    
    // Apply highly realistic logistic sigmoid to predict probability limits
    const p_pass = 1.0 / (1.0 + Math.exp(-12.0 * (linearCombination - 0.38)));
    const p_risk = 1.0 - p_pass;
    const prediction = p_pass >= 0.5 ? 1 : 0;
    
    // Model Decision weight parameters
    const confidence = parseFloat((Math.max(p_pass, p_risk) * 100.0).toFixed(1));
    
    // Casual GPA Estimate on Terminal Course
    const estimateValue = first_sem_gpa * 0.9 + (p_pass * 1.0) - 0.2;
    const predictedGpa = parseFloat(Math.max(0.0, Math.min(5.0, estimateValue)).toFixed(1));

    // Probability Spectrum distribution over the 4 Nigerian degree classes based on predicted graduation GPA
    // Logistic cumulative distribution function
    const logisticCdf = (x: number, mu: number, s: number): number => {
      return 1.0 / (1.0 + Math.exp(-(x - mu) / s));
    };

    const sVal = 0.22; // smooth scale factor for class probabilities
    let p_first = Math.max(0, 1.0 - logisticCdf(4.50, predictedGpa, sVal));
    let p_sec_upper = Math.max(0, logisticCdf(4.50, predictedGpa, sVal) - logisticCdf(3.50, predictedGpa, sVal));
    let p_sec_lower = Math.max(0, logisticCdf(3.50, predictedGpa, sVal) - logisticCdf(2.40, predictedGpa, sVal));
    let p_third = Math.max(0, logisticCdf(2.40, predictedGpa, sVal));

    const p_sum = p_first + p_sec_upper + p_sec_lower + p_third;
    if (p_sum > 0) {
      p_first /= p_sum;
      p_sec_upper /= p_sum;
      p_sec_lower /= p_sum;
      p_third /= p_sum;
    }

    let p_first_class_pct = parseFloat((p_first * 100.0).toFixed(1));
    let p_second_upper_pct = parseFloat((p_sec_upper * 100.0).toFixed(1));
    let p_second_lower_pct = parseFloat((p_sec_lower * 100.0).toFixed(1));
    let p_risk_pct = parseFloat((p_third * 100.0).toFixed(1)); // mapping to third class / pass

    // Adjust any rounding differences to sum to 100
    const p_total = p_first_class_pct + p_second_upper_pct + p_second_lower_pct + p_risk_pct;
    if (p_total !== 100.0 && p_total > 0) {
      const difference = 100.0 - p_total;
      p_second_upper_pct = parseFloat((p_second_upper_pct + difference).toFixed(1));
    }

    // Determine CGPA Trajectory String
    let currentGpaClass = "Third Class / Pass (1.50 – 2.39)";
    if (first_sem_gpa >= 4.5) {
      currentGpaClass = "First Class (4.50 – 5.00)";
    } else if (first_sem_gpa >= 3.5) {
      currentGpaClass = "Second Class Upper (3.50 – 4.49)";
    } else if (first_sem_gpa >= 2.4) {
      currentGpaClass = "Second Class Lower (2.40 – 3.49)";
    }

    // Next Boundary Margin Calculations (Nigerian university degree class boundaries)
    let margin = 0.0;
    let targetClassTitle = "Highest Standing";
    let targetThreshold = 5.00;
    let progressPct = 100.0;
    let marginDesc = "Excellent! You have retained the maximum possible standing block.";

    if (first_sem_gpa < 2.40) {
      targetClassTitle = "Second Class Lower (2:2)";
      targetThreshold = 2.40;
      margin = targetThreshold - first_sem_gpa;
      progressPct = Math.max(0, Math.min(100, ((first_sem_gpa - 1.50) / (2.40 - 1.50)) * 100));
      marginDesc = `You are ${margin.toFixed(2)} CGPA points away from breaking into the Second Class Lower division (2.40).`;
    } else if (first_sem_gpa < 3.50) {
      targetClassTitle = "Second Class Upper (2:1)";
      targetThreshold = 3.50;
      margin = targetThreshold - first_sem_gpa;
      progressPct = Math.max(0, Math.min(100, ((first_sem_gpa - 2.40) / (3.50 - 2.40)) * 100));
      marginDesc = `You are ${margin.toFixed(2)} CGPA points away from climbing into the Second Class Upper division (3.50).`;
    } else if (first_sem_gpa < 4.50) {
      targetClassTitle = "First Class Honours";
      targetThreshold = 4.50;
      margin = targetThreshold - first_sem_gpa;
      progressPct = Math.max(0, Math.min(100, ((first_sem_gpa - 3.5) / (4.50 - 3.5)) * 100));
      marginDesc = `You are ${margin.toFixed(2)} CGPA points away from entering the prestigious First Class Honours division (4.50).`;
    } else {
      // First class retention
      targetClassTitle = "Peak First Class Standing";
      targetThreshold = 5.00;
      margin = 5.00 - first_sem_gpa;
      progressPct = Math.max(0, Math.min(100, ((first_sem_gpa - 4.5) / 0.5) * 100));
      marginDesc = `You are successfully retaining a First Class Honours standing! Only ${margin.toFixed(2)} CGPA points from a perfect 5.00 score.`;
    }

    // What's pulling them back: identify single lowest actionable factor
    let pullbackFactor = "";
    if (carryovers > 0) {
      pullbackFactor = "Active carryovers are applying a heavy penalty, dragging down your trajectory.";
    } else if (attendance < 75) {
      pullbackFactor = "Unacceptable lecture attendance is below the mandatory 75% limit, endangering exam entry.";
    } else if (attendance < 85) {
      pullbackFactor = "Lecture attendance is below the 85% recommended cohort average, reducing grade stability.";
    } else if (assignment_rate < 0.70) {
      pullbackFactor = "Deficient assignment submissions are dragging down your Continuous Assessment standing.";
    } else if (internal_test < 18) {
      pullbackFactor = "Low CA Test score is the main restriction on your term prediction score.";
    } else if (study_hours < 4) {
      pullbackFactor = "Highly deficient daily self-directed study volume is capping your upward trajectory.";
    } else {
      pullbackFactor = "Prior CGPA baseline and raw entry credentials currently define your performance bounds.";
    }

    // Class Aware Interventions
    let classAwareAdvice = "";
    if (first_sem_gpa >= 4.5) {
      classAwareAdvice = "Maintain your current high-performance framework. Keep active carryovers at exactly zero, sustain your study schedule, and ensure your lecture attendance remains above 90% to prevent complacency and secure your First Class degree.";
    } else if (first_sem_gpa >= 4.0) {
      classAwareAdvice = `You are within striking distance of a First Class. Raising your Continuous Assessment test results (currently ${internal_test}/30) and dedicating 2 extra hours of study daily will easily provide the leverage needed to push over the critical 4.50 threshold.`;
    } else if (first_sem_gpa >= 3.5) {
      classAwareAdvice = `Securely in the Second Class Upper bracket. To maintain this solid division or branch upwards, focus on maximizing your assignment submissions (currently at ${Math.round(assignment_rate * 100)}%) and systematically clear any potential core-module bottlenecks.`;
    } else if (first_sem_gpa >= 3.0) {
      classAwareAdvice = `You are close to climbing into the Second Class Upper division (3.50). Improving your daily study volume to at least 5-6 hours/day and targeting a score of 24+/30 in CA tests is highly recommended to bridge this boundary gap.`;
    } else if (first_sem_gpa >= 2.4) {
      classAwareAdvice = `Positioned in the Second Class Lower division. To safeguard your standing from falling to a Third Class, ensure your lecture attendance satisfies the strict AUI 75% rule, clear any carryovers immediately, and actively seek peer academic tutorials.`;
    } else if (first_sem_gpa >= 2.0) {
      classAwareAdvice = "Underperformance warning. You are dangerously close to the Third Class boundary (below 2.40). Immediate corrective actions are required: eliminate distractions, increase study volume to at least 4.5 hours daily, and secure every CA test mark.";
    } else {
      classAwareAdvice = "Urgent Academic Recovery Protocol initiated. Your current standing (below 2.00) represents a graduation threat under university guidelines. Report to your academic adviser, clear all active carryover backlogs, and attend 100% of lectures.";
    }

    // Trajectory Nudge Simulation (Local Sensitivity Counterfactuals)
    const nudges = [];
    
    // Nudge 1: Attendance
    if (attendance < 100) {
      const att_n = Math.min(100, attendance + 10);
      const normAtt_n = Math.max(0.0, Math.min(1.0, (att_n - 40.0) / 60.0));
      const lc = (
        normGpa * 0.36 +
        normAtt_n * 0.26 +
        normAssign * 0.14 +
        normInternal * 0.10 +
        normStudy * 0.05 +
        normJamb * 0.04 +
        normWaec * 0.05 -
        normCarryover * 0.20
      );
      const p_pass_n = 1.0 / (1.0 + Math.exp(-12.0 * (lc - 0.38)));
      const gp_n = first_sem_gpa * 0.9 + p_pass_n - 0.2;
      const gpa_diff = gp_n - estimateValue;
      nudges.push({
        factor: "attendance",
        name: "Lecture Attendance Rate",
        improvement: gpa_diff,
        description: `Raising lecture attendance from ${attendance}% to ${att_n}%`,
        impactDesc: `Increasing attendance by +10% strengthens continuous participation weights, adding an estimated +${Math.max(0.01, gpa_diff).toFixed(2)} CGPA points.`
      });
    }

    // Nudge 2: Assignments
    if (assignment_rate < 1.0) {
      const assign_n = Math.min(1.0, assignment_rate + 0.15);
      const normAssign_n = Math.max(0.0, Math.min(1.0, assign_n));
      const lc = (
        normGpa * 0.36 +
        normAtt * 0.26 +
        normAssign_n * 0.14 +
        normInternal * 0.10 +
        normStudy * 0.05 +
        normJamb * 0.04 +
        normWaec * 0.05 -
        normCarryover * 0.20
      );
      const p_pass_n = 1.0 / (1.0 + Math.exp(-12.0 * (lc - 0.38)));
      const gp_n = first_sem_gpa * 0.9 + p_pass_n - 0.2;
      const gpa_diff = gp_n - estimateValue;
      nudges.push({
        factor: "assignments",
        name: "Assignment Submission Fidelity",
        description: `Submitting ${Math.round(assign_n * 100)}% of assignments on time instead of ${Math.round(assignment_rate * 100)}%`,
        improvement: gpa_diff,
        impactDesc: `Submitting your assignments regularly secures simple continuous assessment points, raising estimated GPA projection by +${Math.max(0.01, gpa_diff).toFixed(2)} CGPA points.`
      });
    }

    // Nudge 3: Continuous Assessment Score
    if (internal_test < 30) {
      const test_n = Math.min(30, internal_test + 5);
      const normInternal_n = Math.max(0.0, Math.min(1.0, (test_n - 5.0) / 25.0));
      const lc = (
        normGpa * 0.36 +
        normAtt * 0.26 +
        normAssign * 0.14 +
        normInternal_n * 0.10 +
        normStudy * 0.05 +
        normJamb * 0.04 +
        normWaec * 0.05 -
        normCarryover * 0.20
      );
      const p_pass_n = 1.0 / (1.0 + Math.exp(-12.0 * (lc - 0.38)));
      const gp_n = first_sem_gpa * 0.9 + p_pass_n - 0.2;
      const gpa_diff = gp_n - estimateValue;
      nudges.push({
        factor: "internal_test",
        name: "Continuous Assessment (CA) Performance",
        description: `Pushing Continuous Assessment scores from ${internal_test}/30 to ${test_n}/30`,
        improvement: gpa_diff,
        impactDesc: `A firmer grasp on internal test curriculum modules enhances academic survival signals, boosting estimated terminal standing by +${Math.max(0.01, gpa_diff).toFixed(2)} CGPA points.`
      });
    }

    // Nudge 4: Study Hours
    if (study_hours < 10) {
      const study_n = Math.min(10, study_hours + 2);
      const normStudy_n = Math.max(0.0, Math.min(1.0, study_n / 10.0));
      const lc = (
        normGpa * 0.36 +
        normAtt * 0.26 +
        normAssign * 0.14 +
        normInternal * 0.10 +
        normStudy_n * 0.05 +
        normJamb * 0.04 +
        normWaec * 0.05 -
        normCarryover * 0.20
      );
      const p_pass_n = 1.0 / (1.0 + Math.exp(-12.0 * (lc - 0.38)));
      const gp_n = first_sem_gpa * 0.9 + p_pass_n - 0.2;
      const gpa_diff = gp_n - estimateValue;
      nudges.push({
        factor: "study_hours",
        name: "Daily Study Hours Volume",
        description: `Increasing independent study from ${study_hours} to ${study_n} hours daily`,
        improvement: gpa_diff,
        impactDesc: `Committing to 2 more hours/day of focused self-directed learning builds robust test preparations, leading to a calculated +${Math.max(0.01, gpa_diff).toFixed(2)} CGPA point upgrade.`
      });
    }

    // Nudge 5: Backlogs clearance
    if (carryovers > 0) {
      const carry_n = Math.max(0, carryovers - 1);
      const normCarryover_n = Math.max(0.0, Math.min(1.0, carry_n / 6.0));
      const lc = (
        normGpa * 0.36 +
        normAtt * 0.26 +
        normAssign * 0.14 +
        normInternal * 0.10 +
        normStudy * 0.05 +
        normJamb * 0.04 +
        normWaec * 0.05 -
        normCarryover_n * 0.20
      );
      const p_pass_n = 1.0 / (1.0 + Math.exp(-12.0 * (lc - 0.38)));
      const gp_n = first_sem_gpa * 0.9 + p_pass_n - 0.2;
      const gpa_diff = gp_n - estimateValue;
      nudges.push({
        factor: "carryovers",
        name: "Academic Backlog Clearance",
        description: `Clearing at least 1 carryover course (reduce from ${carryovers} to ${carry_n})`,
        improvement: gpa_diff,
        impactDesc: `Reducing active backlogs removes heavy curriculum penalties immediately, reclaiming up to +${Math.max(0.01, gpa_diff).toFixed(2)} CGPA points.`
      });
    }

    nudges.sort((a, b) => b.improvement - a.improvement);
    const bestNudge = nudges.length > 0 ? nudges[0] : {
      factor: "retained",
      name: "Sustained Academic Routine",
      description: "Keep up your excellent academic profile settings.",
      improvement: 0,
      impactDesc: "You have already optimized all actionable performance factors. Continue maintaining high discipline!"
    };

    // Policy Warning Evaluations
    let policyMessage = "";
    let isCritical = false;
    
    if (level < 400) {
      const semestersLeft = level === 100 ? 6 : (level === 200 ? 4 : 2);
      policyMessage = `You are ${semestersLeft} semesters away from your critical graduation window. Current trajectory: ${currentGpaClass}.`;
      isCritical = false;
    } else {
      // 400 Level (Final Year)
      if (prediction === 0 || p_risk > 0.40) {
        policyMessage = "AUI Academic Policy Warning: Failing any course in your final semester triggers a mandatory extra academic session with a minimum registration requirement of 16 structural units.";
        isCritical = true;
      } else {
        policyMessage = "Reassuring Academic Standing: Standard administrative and curriculum clearances confirmed. Your profile signals standard trajectory toward timely graduation.";
        isCritical = false;
      }
    }
    
    // Primary Decision Driver identification
    let topFactor = "First Semester GPA standing";
    if (carryovers > 0 && prediction === 0) {
      topFactor = "High Carryover Units count";
    } else if (attendance < 75) {
      topFactor = "Inadequate Lecture Attendance percentage";
    } else if (assignment_rate < 0.6) {
      topFactor = "Deficient Assignment submission fidelity";
    } else if (internal_test < 15) {
      topFactor = "Continuous Assessment scores";
    } else if (first_sem_gpa > 4.2) {
      topFactor = "Outstanding Prior CGPA";
    } else if (attendance >= 90) {
      topFactor = "Excellent Lecture Attendance rate";
    } else {
      topFactor = "Daily Independent Learning hours";
    }

    // High-fidelity importance weights mapped to raw parameters
    const feature_importance_list = [
      { name: "Prior CGPA", weight: 36.0 },
      { name: "Lecture Attendance", weight: 26.0 },
      { name: "Active Carryovers", weight: 20.0 },
      { name: "Assignment Submission", weight: 14.0 },
      { name: "Continuous Assessment (CA)", weight: 10.0 },
      { name: "Independent Study Volume", weight: 5.0 },
      { name: "WAEC Grade Index", weight: 5.0 },
      { name: "JAMB Score", weight: 4.0 },
      { name: "Active Student Level", weight: 2.0 }
    ];

    // Read and parse survey responses dynamically to build real student cohort comparison
    let cohortMatchesSize = 0;
    let cohortAvgAttendance = 85.0;
    let cohortCommonChallenge = "Too many academic workload demands";
    let cohortPercentageStress = 72;
    let cohortGpaPeerPercentage = 68;
    let cohortPoolingProtocol = "Strict same-level study cohort";

    const csvPath = path.join(resolvedDirname, 'survey_responses.csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 1) {
        const dataRows = lines.slice(1);
        const levelStr = `${level} Level`;
        
        // Define allowable levels for Dynamic Pool Escalation
        let acceptedLevels = [levelStr];
        let poolingProtocolDesc = "Strict same-level study cohort";
        
        let exactCount = 0;
        for (const line of dataRows) {
          const cols = parseCsvLine(line);
          if (cols.length < 5) continue;
          const rLevel = cols[2] || "300 Level";
          if (rLevel === levelStr) {
            exactCount++;
          }
        }
        
        // Dynamic Pool Escalation protocol to maintain statistical validity (N >= 15 sample size)
        if (exactCount < 15) {
          if (level === 100 || level === 200) {
            acceptedLevels = ["100 Level", "200 Level"];
            poolingProtocolDesc = "Scaled Junior Division Band Cohort (100L-200L)";
          } else {
            acceptedLevels = ["300 Level", "400 Level"];
            poolingProtocolDesc = "Scaled Senior Division Band Cohort (300L-400L)";
          }
          
          let pooledCount = 0;
          for (const line of dataRows) {
            const cols = parseCsvLine(line);
            if (cols.length < 5) continue;
            const rLevel = cols[2] || "300 Level";
            if (acceptedLevels.includes(rLevel)) {
              pooledCount++;
            }
          }
          if (pooledCount < 15) {
            acceptedLevels = ["100 Level", "200 Level", "300 Level", "400 Level"];
            poolingProtocolDesc = "University-Wide Consolidated Cohort Band (100L-400L)";
          }
        }
        
        cohortPoolingProtocol = poolingProtocolDesc;
        
        let sumAtt = 0;
        let countAtt = 0;
        const challengeCounts: Record<string, number> = {};
        let stressAgreeCount = 0;
        
        let sameLevelTotal = 0;
        let userGpaHigherOrEqual = 0;
        
        // Define ordinal mapping for user GPA class rank percentile
        let userGpaClass = 2;
        if (first_sem_gpa >= 4.5) userGpaClass = 4;
        else if (first_sem_gpa >= 3.5) userGpaClass = 3;
        else if (first_sem_gpa >= 2.4) userGpaClass = 2;
        else userGpaClass = 1;

        // Group-stratified mode computation for current GPA range inside Level study cohort
        const levelGpaStrings: string[] = [];
        for (const line of dataRows) {
          const cols = parseCsvLine(line);
          if (cols.length < 5) continue;
          const rLevel = cols[2] || "300 Level";
          if (acceptedLevels.includes(rLevel)) {
            const rawGpa = cols[3];
            if (rawGpa && rawGpa.trim() !== '') {
              levelGpaStrings.push(rawGpa);
            }
          }
        }
        
        // Find level mode
        const counts: Record<string, number> = {};
        let maxCount = 0;
        let levelGpaMode = "3.50 – 4.49 (Second class upper)";
        for (const val of levelGpaStrings) {
          counts[val] = (counts[val] || 0) + 1;
          if (counts[val] > maxCount) {
            maxCount = counts[val];
            levelGpaMode = val;
          }
        }

        const cgpa_mapping: Record<string, number> = {
          "1.50 – 2.39 (Third class)": 1,
          "2.40 – 3.49 (Second class lower)": 2,
          "3.50 – 4.49 (Second class upper)": 3,
          "4.50 – 5.00 (First class)": 4
        };

        for (const line of dataRows) {
          const cols = parseCsvLine(line);
          if (cols.length < 15) continue;
          const rLevel = cols[2] || "300 Level";
          
          if (acceptedLevels.includes(rLevel)) {
            cohortMatchesSize++;
            
            // Attendance
            let rAttRaw = cols[8];
            if (rAttRaw) {
              let rAtt = parseFloat(rAttRaw.replace(/%/g, '').trim());
              if (!isNaN(rAtt)) {
                if (rAtt <= 1.0) rAtt = rAtt * 100;
                sumAtt += rAtt;
                countAtt++;
              }
            }
            
            // Academic Stress
            const rAcadRaw = cols[14];
            if (rAcadRaw && (rAcadRaw.startsWith('Agree') || rAcadRaw.startsWith('Strongly Agree'))) {
              stressAgreeCount++;
            }
            
            // Current GPA ranking comparison with cohort
            let rowGpaRaw = cols[3];
            if (!rowGpaRaw || rowGpaRaw.trim() === '') {
              rowGpaRaw = levelGpaMode; // Stratified Mode Imputation
            }
            const rowGpaClass = cgpa_mapping[rowGpaRaw] || 3;
            sameLevelTotal++;
            if (userGpaClass >= rowGpaClass) {
              userGpaHigherOrEqual++;
            }
            
            // Common challenge accumulation
            const rChallengesRaw = cols[15] || '';
            const chList = rChallengesRaw.split(',');
            for (const ch of chList) {
              const std = getStandardizedChallenge(ch);
              if (std) {
                challengeCounts[std] = (challengeCounts[std] || 0) + 1;
              }
            }
          }
        }
        
        if (countAtt > 0) {
          cohortAvgAttendance = parseFloat((sumAtt / countAtt).toFixed(1));
        }
        if (cohortMatchesSize > 0) {
          cohortPercentageStress = Math.round((stressAgreeCount / cohortMatchesSize) * 100);
          cohortGpaPeerPercentage = Math.round((userGpaHigherOrEqual / sameLevelTotal) * 100);
        }
        
        let topCount = 0;
        for (const [chKey, count] of Object.entries(challengeCounts)) {
          if (count > topCount) {
            topCount = count;
            cohortCommonChallenge = chKey;
          }
        }
        
      }
    }
    
    // Send back calculated payload plus real survey-derived cohort findings
    res.json({
      prediction: prediction,
      confidence: confidence,
      probabilities: {
        first_class_pct: p_first_class_pct,
        second_upper_pct: p_second_upper_pct,
        second_lower_pct: p_second_lower_pct,
        third_class_pct: p_risk_pct,
        risk_profile_pct: p_risk_pct
      },
      class_boundary_margin: {
        current_gpa: first_sem_gpa,
        next_boundary_threshold: targetThreshold,
        next_boundary_title: targetClassTitle,
        margin_gpa: parseFloat(margin.toFixed(2)),
        progress_pct: parseFloat(progressPct.toFixed(1)),
        pullback_factor: pullbackFactor,
        margin_description: marginDesc
      },
      class_aware_advice: classAwareAdvice,
      trajectory_nudge: {
        factor: bestNudge.factor,
        name: bestNudge.name,
        improvement: parseFloat(bestNudge.improvement.toFixed(2)),
        description: bestNudge.description,
        impact_desc: bestNudge.impactDesc
      },
      policy_assessment: policyMessage,
      is_critical_policy: isCritical,
      top_factor: topFactor,
      feature_importances: feature_importance_list,
      predicted_gpa: predictedGpa,
      new_evaluation_count: newCount,
      empirical_cohort_match: {
        size: cohortMatchesSize,
        avg_attendance: cohortAvgAttendance,
        common_challenge: cohortCommonChallenge,
        stress_percentage: cohortPercentageStress,
        standing_peer_percentage: cohortGpaPeerPercentage,
        pooling_protocol: cohortPoolingProtocol
      }
    });
    
  } catch (err: any) {
    console.error('Error in predict endpoint:', err);
    res.status(400).json({ error: `Parsing error: ${err.message}` });
  }
});

// -------------------------------------------------------------
// Survey Stats API Endpoint with Robust Imputation & Vectorization Engine
// -------------------------------------------------------------
app.get('/api/survey-stats', (req, res) => {
  try {
    const csvPath = path.join(resolvedDirname, 'survey_responses.csv');
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Survey data not initialized yet.' });
    }
    
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) {
      return res.json({ totalCount: 0 });
    }
    
    const dataRows = lines.slice(1);
    const totalCount = dataRows.length;
    
    // Aggregation maps (Human readable)
    const gender = { male: 0, female: 0 };
    const levels: Record<string, number> = {};
    const gpaRanges: Record<string, number> = {};
    const targetGpaRanges: Record<string, number> = {};
    const habits = { regularly: 0, exams: 0, other: 0 };
    const locations: Record<string, number> = {};
    const conducive: Record<string, number> = {};
    const socialMedia: Record<string, number> = {};
    const financialStress: Record<string, number> = {};
    const academicStress: Record<string, number> = {};
    const challenges: Record<string, number> = {};
    
    // Pass 1: Accumulate data points per level of study for group-stratified mode and median estimation
    const gpaValsByLevel: Record<string, string[]> = {};
    const attByLevel: Record<string, number[]> = {};
    const helpByLevel: Record<string, number[]> = {};
    const focusByLevel: Record<string, number[]> = {};
    const assignByLevel: Record<string, number[]> = {};
    
    const allKnownLevels = ["100 Level", "200 Level", "300 Level", "400 Level"];
    for (const lvl of allKnownLevels) {
      gpaValsByLevel[lvl] = [];
      attByLevel[lvl] = [];
      helpByLevel[lvl] = [];
      focusByLevel[lvl] = [];
      assignByLevel[lvl] = [];
    }
    
    // Utility to strip '%' and standardize decimal values (e.g., 0.9 -> 90.0, 90% -> 90)
    const parsePercent = (val: string): number => {
      if (!val || val.trim() === '') return NaN;
      const clean = val.replace(/%/g, '').trim();
      let num = parseFloat(clean);
      if (isNaN(num)) return NaN;
      if (num <= 1.0) num = num * 100; // standardise decimal probabilities
      return num;
    };
    
    for (const line of dataRows) {
      const cols = parseCsvLine(line);
      if (cols.length < 5) continue;
      
      let lvl = cols[2] || "300 Level";
      if (!allKnownLevels.includes(lvl)) {
        if (lvl.includes("100")) lvl = "100 Level";
        else if (lvl.includes("200")) lvl = "200 Level";
        else if (lvl.includes("300")) lvl = "300 Level";
        else if (lvl.includes("400")) lvl = "400 Level";
        else lvl = "300 Level";
      }
      
      // Current GPA
      const cgpa = cols[3];
      if (cgpa && cgpa.trim() !== '') {
        gpaValsByLevel[lvl].push(cgpa);
      }
      
      // Percentage metrics
      const att = parsePercent(cols[8]);
      if (!isNaN(att)) attByLevel[lvl].push(att);
      
      const help = parsePercent(cols[9]);
      if (!isNaN(help)) helpByLevel[lvl].push(help);
      
      const focus = parsePercent(cols[10]);
      if (!isNaN(focus)) focusByLevel[lvl].push(focus);
      
      const assign = parsePercent(cols[11]);
      if (!isNaN(assign)) assignByLevel[lvl].push(assign);
    }
    
    // Simple median helper
    const getMedian = (arr: number[]): number => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
      } else {
        return sorted[mid];
      }
    };
    
    // Simple mode helper
    const getMode = (arr: string[]): string => {
      const filtered = arr.filter(v => v && v.trim() !== '');
      if (filtered.length === 0) return "3.50 – 4.49 (Second class upper)";
      const counts: Record<string, number> = {};
      let maxCount = 0;
      let modeVal = filtered[0];
      for (const val of filtered) {
        counts[val] = (counts[val] || 0) + 1;
        if (counts[val] > maxCount) {
          maxCount = counts[val];
          modeVal = val;
        }
      }
      return modeVal;
    };
    
    // Resolve modes & medians for each stratum
    const levelModes: Record<string, string> = {};
    const levelMedians: Record<string, { att: number; help: number; focus: number; assign: number }> = {};
    const defaultMedians = { att: 86.5, help: 58.2, focus: 41.5, assign: 66.8 };
    
    for (const lvl of allKnownLevels) {
      levelModes[lvl] = getMode(gpaValsByLevel[lvl]);
      levelMedians[lvl] = {
        att: attByLevel[lvl].length > 0 ? getMedian(attByLevel[lvl]) : defaultMedians.att,
        help: helpByLevel[lvl].length > 0 ? getMedian(helpByLevel[lvl]) : defaultMedians.help,
        focus: focusByLevel[lvl].length > 0 ? getMedian(focusByLevel[lvl]) : defaultMedians.focus,
        assign: assignByLevel[lvl].length > 0 ? getMedian(assignByLevel[lvl]) : defaultMedians.assign
      };
    }
    
    // Explicit Ordinal mappings from Treatment Matrix
    const cgpa_map: Record<string, number> = {
      "1.50 – 2.39 (Third class)": 1,
      "2.40 – 3.49 (Second class lower)": 2,
      "3.50 – 4.49 (Second class upper)": 3,
      "4.50 – 5.00 (First class)": 4
    };
    
    const conducive_map: Record<string, number> = {
      "Very poor": 1,
      "Not conducive": 1,
      "Neutral": 2,
      "Conducive": 3,
      "Very conducive": 4
    };
    
    const social_media_map: Record<string, number> = {
      "Less than 1 hour": 0.5,
      "1–3 hours": 2.0,
      "4–6 hours": 5.0,
      "More than 6 hours": 7.0
    };
    
    const finMap: Record<string, number> = { "Not at all": 0, "Slightly": 1, "Moderately": 2, "Significantly": 3 };
    const acadMap: Record<string, number> = { "Strongly Disagree": 0, "Disagree": 1, "Agree": 2, "Strongly Agree": 3 };
    
    // Pass 2: Clean, impute, and vectorize each row
    const vectorizedRecords: any[] = [];
    
    for (const line of dataRows) {
      const cols = parseCsvLine(line);
      if (cols.length < 15) continue;
      
      const rGender = cols[1];
      if (rGender === 'Male') gender.male++;
      else if (rGender === 'Female') gender.female++;
      
      let lvl = cols[2] || "300 Level";
      if (!allKnownLevels.includes(lvl)) {
        if (lvl.includes("100")) lvl = "100 Level";
        else if (lvl.includes("200")) lvl = "200 Level";
        else if (lvl.includes("300")) lvl = "300 Level";
        else if (lvl.includes("400")) lvl = "400 Level";
        else lvl = "300 Level";
      }
      levels[lvl] = (levels[lvl] || 0) + 1;
      
      // CGPA Imputation & Mapping
      let rawCgpa = cols[3];
      let isCgpaImputed = false;
      if (!rawCgpa || rawCgpa.trim() === '') {
        rawCgpa = levelModes[lvl] || "3.50 – 4.49 (Second class upper)";
        isCgpaImputed = true;
      }
      const currentGpaEncoded = cgpa_map[rawCgpa] || 3;
      
      const readableGpaKey = isCgpaImputed ? `${rawCgpa} (Imputed)` : rawCgpa;
      gpaRanges[rawCgpa] = (gpaRanges[rawCgpa] || 0) + 1;
      
      // Target GPA mapping
      const rawTargetCgpa = cols[4] || "3.50 – 4.49 (Second class upper)";
      const targetGpaEncoded = cgpa_map[rawTargetCgpa] || 3;
      targetGpaRanges[rawTargetCgpa] = (targetGpaRanges[rawTargetCgpa] || 0) + 1;
      
      // Study Habit
      const rHabit = cols[5];
      const habitRegularEncoded = rHabit === 'Regularly' ? 1 : 0;
      if (rHabit === 'Regularly') habits.regularly++;
      else if (rHabit && (rHabit.includes('exam') || rHabit.includes('test'))) habits.exams++;
      else habits.other++;
      
      // Location
      const rLoc = cols[6];
      if (rLoc) locations[rLoc] = (locations[rLoc] || 0) + 1;
      
      // Conduciveness
      const rCond = cols[7] || "Neutral";
      conducive[rCond] = (conducive[rCond] || 0) + 1;
      const conducivenessEncoded = conducive_map[rCond] || 2;
      
      // Percentages Imputation (median based)
      const parseAndImputeMetric = (rawVal: string, type: 'att' | 'help' | 'focus' | 'assign') => {
        const parsed = parsePercent(rawVal);
        if (isNaN(parsed)) {
          return { val: levelMedians[lvl]?.[type] || defaultMedians[type], imputed: true };
        }
        return { val: parsed, imputed: false };
      };
      
      const attRes = parseAndImputeMetric(cols[8], 'att');
      const helpRes = parseAndImputeMetric(cols[9], 'help');
      const focusRes = parseAndImputeMetric(cols[10], 'focus');
      const assignRes = parseAndImputeMetric(cols[11], 'assign');
      
      // Social Media standard midpoint mapping
      const rSocial = cols[12] || "1–3 hours";
      socialMedia[rSocial] = (socialMedia[rSocial] || 0) + 1;
      const socialMediaHoursEncoded = social_media_map[rSocial] || 2.0;
      
      // Financial Stress standard index
      const rFinRaw = cols[13] || "Slightly";
      let rFin = 'Unknown';
      if (rFinRaw.startsWith('Significantly')) rFin = 'Significantly';
      else if (rFinRaw.startsWith('Moderately')) rFin = 'Moderately';
      else if (rFinRaw.startsWith('Slightly')) rFin = 'Slightly';
      else if (rFinRaw.startsWith('Not at all')) rFin = 'Not at all';
      financialStress[rFin] = (financialStress[rFin] || 0) + 1;
      const financialStressEncoded = finMap[rFin] !== undefined ? finMap[rFin] : 1;
      
      // Academic Stress index
      const rAcadRaw = cols[14] || "Agree";
      let rAcad = 'Unknown';
      if (rAcadRaw.startsWith('Strongly Agree')) rAcad = 'Strongly Agree';
      else if (rAcadRaw.startsWith('Agree')) rAcad = 'Agree';
      else if (rAcadRaw.startsWith('Disagree')) rAcad = 'Disagree';
      else if (rAcadRaw.startsWith('Strongly Disagree')) rAcad = 'Strongly Disagree';
      academicStress[rAcad] = (academicStress[rAcad] || 0) + 1;
      const academicStressEncoded = acadMap[rAcad] !== undefined ? acadMap[rAcad] : 2;
      
      // Challenges parser
      const rChallengesRaw = cols[15] || '';
      const cleanChallenges = rChallengesRaw
        .replace(/^"|"$/g, '')
        .replace(/Too many academic workload\.\.\./g, 'Too many academic workload demands')
        .replace(/Poor time m\.\.\./g, 'Poor time management');
      
      const chList = cleanChallenges.split(',');
      for (const rawCh of chList) {
        const std = getStandardizedChallenge(rawCh);
        if (std) {
          challenges[std] = (challenges[std] || 0) + 1;
        }
      }
      
      // One-Hot Binary Flags
      const ch_motivation = cleanChallenges.includes('Lack of motivation') ? 1 : 0;
      const ch_time_mgmt = cleanChallenges.includes('Poor time management') ? 1 : 0;
      const ch_difficult_content = (cleanChallenges.includes('Difficulty') || cleanChallenges.includes('Difficult course')) ? 1 : 0;
      const ch_lecturer_support = cleanChallenges.includes('Lack of academic support') ? 1 : 0;
      const ch_distractions = cleanChallenges.includes('Distractions') ? 1 : 0;
      const ch_workload = (cleanChallenges.includes('Too many academic workload') || cleanChallenges.includes('workload demands')) ? 1 : 0;
      const ch_financial = cleanChallenges.includes('Financial') ? 1 : 0;
      const ch_health = cleanChallenges.includes('Health') ? 1 : 0;
      
      vectorizedRecords.push({
        gender: rGender || 'Female',
        gender_male_encoded: rGender === 'Male' ? 1 : 0,
        student_level: lvl,
        level_num: parseInt(lvl) || 300,
        current_gpa_raw: rawCgpa,
        current_gpa_imputed: isCgpaImputed,
        current_gpa_encoded: currentGpaEncoded,
        target_gpa_raw: rawTargetCgpa,
        target_gpa_encoded: targetGpaEncoded,
        study_habit_regular_encoded: habitRegularEncoded,
        location_raw: rLoc || 'Hostel room',
        hostel_study_area_conduciveness_encoded: conducivenessEncoded,
        hostel_conducive_raw: rCond,
        lecture_attendance: parseFloat(attRes.val.toFixed(1)),
        lecture_attendance_imputed: attRes.imputed,
        lecture_helpfulness: parseFloat(helpRes.val.toFixed(1)),
        lecture_helpfulness_imputed: helpRes.imputed,
        lecturer_focus: parseFloat(focusRes.val.toFixed(1)),
        lecturer_focus_imputed: focusRes.imputed,
        assignments_on_time: parseFloat(assignRes.val.toFixed(1)),
        assignments_on_time_imputed: assignRes.imputed,
        social_media_hours: socialMediaHoursEncoded,
        social_media_raw: rSocial,
        financial_stress_encoded: financialStressEncoded,
        financial_stress_raw: rFinRaw,
        academic_stress_encoded: academicStressEncoded,
        academic_stress_raw: rAcadRaw,
        challenge_lack_of_motivation: ch_motivation,
        challenge_poor_time_management: ch_time_mgmt,
        challenge_difficulty_understanding_course_content: ch_difficult_content,
        challenge_lack_of_academic_support: ch_lecturer_support,
        challenge_distractions: ch_distractions,
        challenge_too_many_workload_demands: ch_workload,
        challenge_financial_issues: ch_financial,
        challenge_health_personal_issues: ch_health
      });
    }
    
    // Calculate Pearson correlation index
    const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
      if (x.length !== y.length || x.length === 0) return 0;
      const n = x.length;
      let sumX = 0, sumY = 0;
      for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
      }
      const meanX = sumX / n;
      const meanY = sumY / n;
      
      let num = 0;
      let denX = 0, denY = 0;
      for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        num += diffX * diffY;
        denX += diffX * diffX;
        denY += diffY * diffY;
      }
      if (denX === 0 || denY === 0) return 0;
      return num / Math.sqrt(denX * denY);
    };
    
    const stressVals = vectorizedRecords.map(r => r.academic_stress_encoded);
    const finStressVals = vectorizedRecords.map(r => r.financial_stress_encoded);
    const gpaVals = vectorizedRecords.map(r => r.current_gpa_encoded);
    const socialVals = vectorizedRecords.map(r => r.social_media_hours);
    const condVals = vectorizedRecords.map(r => r.hostel_study_area_conduciveness_encoded);
    const attendanceVals = vectorizedRecords.map(r => r.lecture_attendance);
    
    const correlations = {
      academicStressVsGpa: parseFloat(calculatePearsonCorrelation(stressVals, gpaVals).toFixed(3)),
      financialStressVsAcademicStress: parseFloat(calculatePearsonCorrelation(finStressVals, stressVals).toFixed(3)),
      socialMediaVsGpa: parseFloat(calculatePearsonCorrelation(socialVals, gpaVals).toFixed(3)),
      envConducivenessVsGpa: parseFloat(calculatePearsonCorrelation(condVals, gpaVals).toFixed(3)),
      attendanceVsGpa: parseFloat(calculatePearsonCorrelation(attendanceVals, gpaVals).toFixed(3))
    };
    
    // Overall Lecture Metrics based on fully imputed vectors
    let sumAttendance = 0, sumHelpful = 0, sumFocus = 0, sumAssignments = 0;
    for (const r of vectorizedRecords) {
      sumAttendance += r.lecture_attendance;
      sumHelpful += r.lecture_helpfulness;
      sumFocus += r.lecturer_focus;
      sumAssignments += r.assignments_on_time;
    }
    const avgAttendance = vectorizedRecords.length > 0 ? (sumAttendance / vectorizedRecords.length) : 86.5;
    const avgHelpful = vectorizedRecords.length > 0 ? (sumHelpful / vectorizedRecords.length) : 58.2;
    const avgLecturerFocus = vectorizedRecords.length > 0 ? (sumFocus / vectorizedRecords.length) : 41.5;
    const avgAssignments = vectorizedRecords.length > 0 ? (sumAssignments / vectorizedRecords.length) : 66.8;
    
    // Map standard raw records for general UI backward compatibility
    const rawRecords = dataRows.map(line => {
      const cols = parseCsvLine(line);
      if (cols.length < 5) return null;
      return {
        timestamp: cols[0] || '',
        gender: cols[1] || 'Female',
        level: cols[2] || '300 Level',
        currentGpa: cols[3] || 'Freshman / Regular',
        targetGpa: cols[4] || '',
        habit: cols[5] || '',
        location: cols[6] || '',
        conducive: cols[7] || '',
        attendance: cols[8] || '',
        helpful: cols[9] || '',
        focus: cols[10] || '',
        assignments: cols[11] || '',
        socialMedia: cols[12] || '',
        financialStress: cols[13] || '',
        academicStress: cols[14] || '',
        challenges: cols[15] || ''
      };
    }).filter(Boolean);
    
    res.json({
      totalCount,
      gender,
      levels,
      gpaRanges,
      targetGpaRanges,
      habits,
      locations,
      conducive,
      lectures: {
        avgAttendance: parseFloat(avgAttendance.toFixed(1)),
        avgHelpful: parseFloat(avgHelpful.toFixed(1)),
        avgLecturerFocus: parseFloat(avgLecturerFocus.toFixed(1)),
        avgAssignments: parseFloat(avgAssignments.toFixed(1))
      },
      socialMedia,
      financialStress,
      academicStress,
      challenges,
      rawRecords,
      vectorizedRecords,
      correlations
    });
  } catch (err: any) {
    console.error('Error generating survey stats:', err);
    res.status(500).json({ error: `Internal stats error: ${err.message}` });
  }
});

// Launch server listener
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AUI AcadPred server running locally at http://0.0.0.0:${PORT}`);
});
