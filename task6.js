// Task 6: Legacy Course Registration Service Using Callbacks

// Mock database
const db = {
  students: {
    101: { id: 101, name: 'Ali', completedCourses: ['CS301', 'CS302'], registeredCourses: [] },
    102: { id: 102, name: 'Sara', completedCourses: ['CS101'], registeredCourses: [] },
    103: { id: 103, name: 'Usman', completedCourses: ['CS301', 'CS302'], registeredCourses: ['CS401'] }
  },
  courses: {
    'CS401': { code: 'CS401', title: 'Advanced Web Development', prerequisite: 'CS301', availableSeats: 5 },
    'CS402': { code: 'CS402', title: 'Deep Learning', prerequisite: 'CS302', availableSeats: 0 }
  }
};

// Stage 1: Load student record
function loadStudent(studentId, callback) {
  setTimeout(() => {
    let student = db.students[studentId];
    if (!student) {
      return callback(new Error(`Student with ID ${studentId} does not exist`), null);
    }
    return callback(null, { ...student });
  }, 25);
}

// Stage 2: Check prerequisites and duplicate course registrations
function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    let course = db.courses[courseCode];
    if (!course) {
      return callback(new Error(`Course ${courseCode} not found in catalog`), null);
    }

    // Check if already registered
    if (student.registeredCourses.includes(courseCode)) {
      return callback(new Error(`Student ${student.id} is already registered in ${courseCode}`), null);
    }

    // Check prerequisite
    if (course.prerequisite && !student.completedCourses.includes(course.prerequisite)) {
      return callback(new Error(`Prerequisite ${course.prerequisite} not completed for course ${courseCode}`), null);
    }

    return callback(null, { student, course });
  }, 25);
}

// Stage 3: Check seat availability
function checkAvailableSeats(data, callback) {
  setTimeout(() => {
    let { student, course } = data;
    if (course.availableSeats <= 0) {
      return callback(new Error(`Course ${course.code} is full. No available seats left`), null);
    }
    return callback(null, { student, course });
  }, 25);
}

// Stage 4: Deduct seat and confirm registration
function registerCourse(data, callback) {
  setTimeout(() => {
    let { student, course } = data;

    // Deduct one seat and push course to student
    db.courses[course.code].availableSeats -= 1;
    db.students[student.id].registeredCourses.push(course.code);

    let confirmation = {
      studentId: student.id,
      course: course.code,
      status: 'REGISTERED'
    };

    return callback(null, confirmation);
  }, 25);
}

// Chained registration pipeline using error-first callbacks
function runRegistration(studentId, courseCode, onDone) {
  // Step 1: Load student
  loadStudent(studentId, (err1, student) => {
    if (err1) return onDone(err1, null);

    // Step 2: Check prerequisites
    checkPrerequisites(student, courseCode, (err2, data1) => {
      if (err2) return onDone(err2, null);

      // Step 3: Check seats
      checkAvailableSeats(data1, (err3, data2) => {
        if (err3) return onDone(err3, null);

        // Step 4: Register course
        registerCourse(data2, (err4, result) => {
          if (err4) return onDone(err4, null);
          return onDone(null, result);
        });
      });
    });
  });
}

// Test cases demonstrating success and failure scenarios
console.log("--- Test 1: Successful Registration ---");
runRegistration(101, 'CS401', (err, res) => {
  if (err) console.log("Failed:", err.message);
  else console.log("Success:", res);

  console.log("\n--- Test 2: Failure - Student Does Not Exist ---");
  runRegistration(999, 'CS401', (err, res) => {
    console.log(err ? `Stopped at stage 1 -> ${err.message}` : res);

    console.log("\n--- Test 3: Failure - Prerequisite Not Completed ---");
    runRegistration(102, 'CS401', (err, res) => {
      console.log(err ? `Stopped at stage 2 -> ${err.message}` : res);

      console.log("\n--- Test 4: Failure - Course Is Full ---");
      runRegistration(101, 'CS402', (err, res) => {
        console.log(err ? `Stopped at stage 3 -> ${err.message}` : res);

        console.log("\n--- Test 5: Failure - Student Already Registered ---");
        runRegistration(103, 'CS401', (err, res) => {
          console.log(err ? `Stopped at stage 2 -> ${err.message}` : res);

          // Explanation why nested callbacks are hard to maintain
          console.log("\n--- Explanation: Why Dependent Callbacks Are Hard To Maintain ---");
          console.log("1. Nesting / Callback Hell: Each sequential async step adds another layer of indent.");
          console.log("2. Repetitive Error Handling: Every callback must check 'if (err)' manually.");
          console.log("3. Hard to Coordinate: Running parallel branches or clean cleanups is messy.");
        });
      });
    });
  });
});
