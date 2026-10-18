import Student from './Student.js';
import { calculateGrade, calculateAverage, calculateGPA } from './gradeUtils.js';

// Safe parse and validate transcript JSON
export function processTranscripts(rawJson) {
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
    // Missing ID check
    if (item.id === undefined || item.id === null || item.id === '') {
      throw new TypeError(`Missing student ID in record for name: "${item.name || 'Unknown'}"`);
    }

    // Duplicate ID check
    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate student ID detected: "${item.id}"`);
    }
    seenIds.add(item.id);

    // Validate courses list
    if (!Array.isArray(item.courses) || item.courses.length === 0) {
      throw new TypeError(`Student ${item.id} must have a non-empty courses array`);
    }

    // Validate each course
    let validatedCourses = item.courses.map(course => {
      if (!course.code || typeof course.code !== 'string' || course.code.trim() === '') {
        throw new TypeError(`Missing course code for student ID ${item.id}`);
      }

      if (typeof course.marks !== 'number' || isNaN(course.marks)) {
        throw new TypeError(`Invalid marks format in course ${course.code} for student ${item.id}`);
      }

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

// Convert report object back to JSON
export function convertReportToJSON(report) {
  return JSON.stringify(report, null, 2);
}
