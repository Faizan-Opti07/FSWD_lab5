// Named exports for grade and GPA calculations

export function calculateGrade(marks) {
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 50) return 'C';
  return 'F';
}

export function getGradePoints(marks) {
  if (marks >= 85) return 4.0;
  if (marks >= 80) return 3.7;
  if (marks >= 75) return 3.3;
  if (marks >= 70) return 3.0;
  if (marks >= 65) return 2.7;
  if (marks >= 60) return 2.3;
  if (marks >= 50) return 2.0;
  return 0.0;
}

export function calculateAverage(courses = []) {
  if (courses.length === 0) return 0;
  let sum = courses.reduce((acc, c) => acc + c.marks, 0);
  return Number((sum / courses.length).toFixed(2));
}

export function calculateGPA(courses = []) {
  if (courses.length === 0) return 0;
  let total = courses.reduce((acc, c) => acc + getGradePoints(c.marks), 0);
  return Number((total / courses.length).toFixed(2));
}
