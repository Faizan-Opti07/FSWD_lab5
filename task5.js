// Task 5: Modular Transcript Processing and Fault-Tolerant JSON

// Student class representation
class Student {
  constructor(id, name, courses = []) {
    this.id = id;
    this.name = name;
    this.courses = courses;
  }
}

// Convert numerical marks to letter grade
function calculateGrade(marks) {
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 50) return 'C';
  return 'F';
}

// Convert marks to GPA points
function getGradePoints(marks) {
  if (marks >= 85) return 4.0;
  if (marks >= 80) return 3.7;
  if (marks >= 75) return 3.3;
  if (marks >= 70) return 3.0;
  if (marks >= 65) return 2.7;
  if (marks >= 60) return 2.3;
  if (marks >= 50) return 2.0;
  return 0.0;
}

// Compute average marks for courses
function calculateAverage(courses = []) {
  if (courses.length === 0) return 0;
  let sum = courses.reduce((acc, c) => acc + c.marks, 0);
  return Number((sum / courses.length).toFixed(2));
}

// Compute GPA across courses
function calculateGPA(courses = []) {
  if (courses.length === 0) return 0;
  let totalPoints = courses.reduce((acc, c) => acc + getGradePoints(c.marks), 0);
  return Number((totalPoints / courses.length).toFixed(2));
}

// Process raw JSON transcript payload with strict validation
function processTranscripts(rawJson) {
  if (typeof rawJson !== 'string') {
    throw new TypeError('Incoming transcript payload must be a JSON string');
  }

  // Safe parse JSON
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    throw new Error(`Malformed JSON: Failed to parse string (${err.message})`);
  }

  if (!Array.isArray(parsed)) {
    throw new TypeError('Expected JSON payload to be an array of students');
  }

  let seenIds = new Set();
  let processedStudents = [];

  for (let item of parsed) {
    // Check missing ID
    if (item.id === undefined || item.id === null || item.id === '') {
      throw new TypeError(`Missing student ID in record for name: "${item.name || 'Unknown'}"`);
    }

    // Check duplicate ID
    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate student ID detected: "${item.id}"`);
    }
    seenIds.add(item.id);

    // Validate courses list
    if (!Array.isArray(item.courses) || item.courses.length === 0) {
      throw new TypeError(`Student ${item.id} must have a non-empty courses array`);
    }

    // Validate each course entry
    let validatedCourses = item.courses.map(course => {
      if (!course.code || typeof course.code !== 'string' || course.code.trim() === '') {
        throw new TypeError(`Missing course code for student ID ${item.id}`);
      }

      if (typeof course.marks !== 'number' || isNaN(course.marks)) {
        throw new TypeError(`Invalid marks format in course ${course.code} for student ${item.id}`);
      }

      // Range check 0-100 throwing RangeError
      if (course.marks < 0 || course.marks > 100) {
        throw new RangeError(`Marks for course ${course.code} must be between 0 and 100 (got ${course.marks})`);
      }

      return {
        code: course.code,
        marks: course.marks,
        grade: calculateGrade(course.marks)
      };
    });

    let studentObj = new Student(item.id, item.name, validatedCourses);
    let avg = calculateAverage(validatedCourses);
    let gpa = calculateGPA(validatedCourses);

    processedStudents.push({
      id: studentObj.id,
      name: studentObj.name,
      courses: studentObj.courses,
      average: avg,
      gpa,
      status: gpa >= 2.0 ? 'GOOD STANDING' : 'PROBATION'
    });
  }

  return {
    reportTitle: 'Official Academic Transcript Report',
    totalStudents: processedStudents.length,
    students: processedStudents
  };
}

// Convert report object back to formatted JSON string
function convertReportToJSON(report) {
  return JSON.stringify(report, null, 2);
}

// Test runner showing try, catch, and finally block execution
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
