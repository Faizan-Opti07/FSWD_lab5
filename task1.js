// Task 1: Admission Decision and Data Sanitization Engine

const supportedPrograms = ['BSCS', 'BSSE', 'BSAI', 'BSIT'];

// Check if value is a valid number within range
function checkNumber(val, min, max) {
  if (val === null || val === undefined || typeof val === 'boolean') return false;
  if (typeof val === 'string' && val.trim() === '') return false;
  let num = Number(val);
  return !isNaN(num) && num >= min && num <= max;
}

// Process one applicant
function checkApplicant(app) {
  if (!app) return { status: 'INVALID DATA' };

  // Validate age between 17 and 30
  let validAge = checkNumber(app.age, 17, 30);

  // Validate marks between 0 and 100
  let validMatric = checkNumber(app.matricMarks, 0, 100);
  let validInter = checkNumber(app.intermediateMarks, 0, 100);
  let validEntry = checkNumber(app.entryTest, 0, 100);

  // Check supported program
  let validProgram = supportedPrograms.includes(app.program);

  // If any required field is invalid
  if (!validAge || !validMatric || !validInter || !validEntry || !validProgram) {
    return {
      id: app.id || 'N/A',
      name: app.name || 'N/A',
      program: app.program || 'N/A',
      valid: false,
      status: 'INVALID DATA'
    };
  }

  // Convert string to numbers explicitly
  let matric = Number(app.matricMarks);
  let inter = Number(app.intermediateMarks);
  let entry = Number(app.entryTest);
  let fee = app.feePaid === 'true' || app.feePaid === true;

  // Calculate merit formula: Matric 20%, Inter 30%, Entry Test 50%
  let merit = Number(((matric * 0.20) + (inter * 0.30) + (entry * 0.50)).toFixed(2));

  // Eligibility condition: Merit >= 70, Entry Test >= 60, Intermediate >= 60
  let isEligible = merit >= 70 && entry >= 60 && inter >= 60;

  let status = 'REJECTED';
  if (isEligible) {
    status = (fee && merit >= 75) ? 'SELECTED' : 'WAITING';
  }

  return {
    id: app.id,
    name: app.name,
    age: Number(app.age),
    program: app.program,
    merit,
    feePaid: fee,
    valid: true,
    status
  };
}

// Process all applicants
function processApplicants(list) {
  let results = [];
  for (let i = 0; i < list.length; i++) {
    results.push(checkApplicant(list[i]));
  }
  return results;
}

// Bonus Challenge: Generate summary statistics
function getSummary(results) {
  let validCount = 0;
  let invalidCount = 0;
  let totalMerit = 0;
  let highest = null;
  let lowest = null;
  let programCounts = {};

  for (let r of results) {
    if (r.program && r.program !== 'N/A') {
      programCounts[r.program] = (programCounts[r.program] || 0) + 1;
    }

    if (!r.valid) {
      invalidCount++;
      continue;
    }

    validCount++;
    totalMerit += r.merit;

    if (!highest || r.merit > highest.merit) highest = r;
    if (!lowest || r.merit < lowest.merit) lowest = r;
  }

  return {
    validApplicants: validCount,
    invalidApplicants: invalidCount,
    highestMerit: highest ? { name: highest.name, merit: highest.merit, program: highest.program } : null,
    lowestMerit: lowest ? { name: lowest.name, merit: lowest.merit, program: lowest.program } : null,
    averageMerit: validCount > 0 ? Number((totalMerit / validCount).toFixed(2)) : 0,
    programCounts
  };
}

// Sample input data from lab manual
const applicants = [
  {
    id: 'A101',
    name: 'Sara Khan',
    age: '19',
    matricMarks: '91',
    intermediateMarks: '87',
    entryTest: '78',
    program: 'BSCS',
    feePaid: 'true'
  },
  {
    id: 'A102',
    name: 'Ahmed Ali',
    age: 'twenty',
    matricMarks: '88',
    intermediateMarks: '',
    entryTest: '72',
    program: 'BSSE',
    feePaid: 'false'
  },
  {
    id: 'A103',
    name: 'Hassan',
    age: '18',
    matricMarks: '76',
    intermediateMarks: '83',
    entryTest: '91',
    program: 'BSAI',
    feePaid: 'true'
  }
];

// Boundary and invalid test cases
const extraTests = [
  { id: 'A104', name: 'Zainab (Boundary Age 17)', age: '17', matricMarks: '70', intermediateMarks: '70', entryTest: '70', program: 'BSIT', feePaid: 'false' },
  { id: 'A105', name: 'Bilal (Invalid Age 16)', age: '16', matricMarks: '90', intermediateMarks: '90', entryTest: '90', program: 'BSCS', feePaid: 'true' },
  { id: 'A106', name: 'Hamza (Marks Over 100)', age: '21', matricMarks: '105', intermediateMarks: '80', entryTest: '80', program: 'BSSE', feePaid: 'true' },
  { id: 'A107', name: 'Daniyal (Unsupported Program)', age: '22', matricMarks: '80', intermediateMarks: '80', entryTest: '80', program: 'BBA', feePaid: 'true' }
];

console.log("--- Processed Sample Applicants ---");
let processed = processApplicants(applicants);
console.table(processed);

console.log("\n--- Extra Boundary & Invalid Tests ---");
let extraProcessed = processApplicants(extraTests);
console.table(extraProcessed);

console.log("\n--- Bonus Challenge: Summary Report ---");
let allResults = processApplicants([...applicants, ...extraTests]);
console.log(getSummary(allResults));
