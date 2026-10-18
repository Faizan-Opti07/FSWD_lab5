// Task 5: Modular Transcript Processing and Fault-Tolerant JSON
// Demonstrates default import, named import, and aliased named import
import Student from './Student.js';
import { calculateAverage as calcAvg } from './gradeUtils.js';
import { processTranscripts, convertReportToJSON } from './transcriptService.js';

// Test runner showing try, catch, and finally
function runTest(testName, payload) {
  console.log(`\n--- Test: ${testName} ---`);
  let success = false;

  try {
    let report = processTranscripts(payload);
    let jsonOutput = convertReportToJSON(report);
    console.log("Success! Generated Report JSON:");
    console.log(jsonOutput);
    success = true;
  } catch (err) {
    console.log(`Caught ${err.name}: ${err.message}`);
    success = false;
  } finally {
    console.log(`[finally] Completed test "${testName}" (Success: ${success})`);
  }
}

// 1. Normal valid transcript data
const validJson = `
[
  {
    "id": 101,
    "name": "Ali",
    "courses": [
      { "code": "CS301", "marks": 81 },
      { "code": "CS302", "marks": 74 }
    ]
  },
  {
    "id": 102,
    "name": "Sara",
    "courses": [
      { "code": "CS301", "marks": 92 },
      { "code": "CS302", "marks": 89 }
    ]
  }
]
`;
runTest('Normal Valid Transcript Payload', validJson);

// 2. Malformed JSON test
runTest('Malformed JSON Handling', `[ { "id": 101, "name": "Broken JSON" `);

// 3. Missing Student ID test
runTest('Missing Student ID Check', `[ { "name": "No ID", "courses": [{ "code": "CS101", "marks": 70 }] } ]`);

// 4. Duplicate Student ID test
runTest('Duplicate Student ID Check', `
[
  { "id": 101, "name": "Ali", "courses": [{ "code": "CS101", "marks": 75 }] },
  { "id": 101, "name": "Copy Ali", "courses": [{ "code": "CS102", "marks": 80 }] }
]
`);

// 5. Marks out of range test (RangeError)
runTest('Marks Out of Range Check (>100)', `
[
  { "id": 103, "name": "Hamza", "courses": [{ "code": "CS301", "marks": 115 }] }
]
`);

// 6. Missing Course Code test
runTest('Missing Course Code Check', `
[
  { "id": 104, "name": "Zahid", "courses": [{ "marks": 80 }] }
]
`);
