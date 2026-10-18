// Task 2: Academic Performance Intelligence Engine

// Student results data from lab manual
const results = [
  { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
  { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
  { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
  { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
  { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
  { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];

// Grade helper based on grading policy table
function getGrade(marks) {
  if (marks >= 85) return { grade: 'A', gpa: 4.0, status: 'PASS' };
  if (marks >= 80) return { grade: 'A-', gpa: 3.7, status: 'PASS' };
  if (marks >= 75) return { grade: 'B+', gpa: 3.3, status: 'PASS' };
  if (marks >= 70) return { grade: 'B', gpa: 3.0, status: 'PASS' };
  if (marks >= 65) return { grade: 'B-', gpa: 2.7, status: 'PASS' };
  if (marks >= 60) return { grade: 'C+', gpa: 2.3, status: 'PASS' };
  if (marks >= 50) return { grade: 'C', gpa: 2.0, status: 'PASS' };
  return { grade: 'F', gpa: 0.0, status: 'FAIL' };
}

// Part A: Map each student to include grade, GPA and pass/fail status
let processedResults = results.map(s => {
  let g = getGrade(s.marks);
  return {
    id: s.id,
    name: s.name,
    department: s.department,
    course: s.course,
    marks: s.marks,
    grade: g.grade,
    gradePoints: g.gpa,
    status: g.status
  };
});

console.log("--- Part A: Student Grades ---");
console.table(processedResults);

// Part B: Ranked merit list (sorted without modifying original results array)
let rankedList = [...results].sort((a, b) => {
  if (b.marks !== a.marks) {
    return b.marks - a.marks;
  }
  return a.name.localeCompare(b.name);
});

console.log("\n--- Part B: Ranked Merit List ---");
console.table(rankedList);
console.log("Original array untouched:", results[0].name === 'Ali');

// Part C: Department statistics using reduce
let deptStats = results.reduce((acc, curr) => {
  let dept = curr.department;
  if (!acc[dept]) {
    acc[dept] = { students: 0, total: 0, highest: curr.marks, passed: 0 };
  }

  acc[dept].students++;
  acc[dept].total += curr.marks;
  if (curr.marks > acc[dept].highest) acc[dept].highest = curr.marks;
  if (curr.marks >= 50) acc[dept].passed++;

  return acc;
}, {});

// Calculate average marks for each department using forEach
let finalDeptStats = {};
Object.keys(deptStats).forEach(dept => {
  let item = deptStats[dept];
  finalDeptStats[dept] = {
    students: item.students,
    average: Number((item.total / item.students).toFixed(2)),
    highest: item.highest,
    passed: item.passed
  };
});

console.log("\n--- Part C: Department Statistics ---");
console.log(finalDeptStats);

// Part D: Academic queries
console.log("\n--- Part D: Academic Queries ---");

// 1. Find first student scoring above 85
let firstTop = results.find(s => s.marks > 85);
console.log("1. First student > 85:", firstTop.name, `(${firstTop.marks})`);

// 2. Find index of first failing student (< 50)
let failIndex = results.findIndex(s => s.marks < 50);
console.log("2. Index of first failed student:", failIndex, `(${results[failIndex].name})`);

// 3. Check if at least one student failed
let hasFailures = results.some(s => s.marks < 50);
console.log("3. Has at least one failure:", hasFailures);

// 4. Check if all marks are valid between 0 and 100
let allValid = results.every(s => s.marks >= 0 && s.marks <= 100);
console.log("4. All marks within range 0-100:", allValid);

// 5. Filter students scoring above overall average
let totalMarks = results.reduce((sum, s) => sum + s.marks, 0);
let overallAvg = Number((totalMarks / results.length).toFixed(2));
let aboveAverage = results.filter(s => s.marks > overallAvg);
console.log(`5. Students scoring above overall average (${overallAvg}):`, aboveAverage.map(s => `${s.name} (${s.marks})`));

// 6. Get names of top 3 students using slice and map
let topThree = [...rankedList].slice(0, 3).map(s => s.name);
console.log("6. Top 3 student names:", topThree);
