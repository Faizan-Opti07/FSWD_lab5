// Task 7: Promise-Based Multi-Service Registration Engine

// Mock database
const students = {
  101: { id: 101, name: 'Ali', completedCourses: ['CS301'], registeredCourses: [] },
  102: { id: 102, name: 'Sara', completedCourses: [], registeredCourses: [] }
};

const courses = {
  'CS401': { code: 'CS401', title: 'Advanced Web Development', prerequisite: 'CS301', seats: 10 },
  'CS402': { code: 'CS402', title: 'Deep Learning', prerequisite: 'CS302', seats: 0 }
};

// Async promise helpers
function getStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let s = students[id];
      if (s) resolve({ ...s });
      else reject(new Error(`Student with ID ${id} not found`));
    }, 20);
  });
}

function getCourse(code) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let c = courses[code];
      if (c) resolve({ ...c });
      else reject(new Error(`Course ${code} not found`));
    }, 20);
  });
}

function checkPrerequisites(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (course.prerequisite && !student.completedCourses.includes(course.prerequisite)) {
        reject(new Error(`Prerequisite ${course.prerequisite} not met for ${course.code}`));
      } else {
        resolve(true);
      }
    }, 20);
  });
}

function checkSeats(course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (course.seats <= 0) {
        reject(new Error(`No seats available in ${course.code}`));
      } else {
        resolve(true);
      }
    }, 20);
  });
}

function registerStudent(student, course) {
  return new Promise(resolve => {
    setTimeout(() => {
      course.seats -= 1;
      student.registeredCourses.push(course.code);
      resolve({
        studentId: student.id,
        course: course.code,
        status: 'REGISTERED'
      });
    }, 20);
  });
}

// Notification and audit services for post-registration
function sendEmail(student, course) {
  return new Promise(resolve => {
    setTimeout(() => resolve(`Email sent to ${student.name}`), 25);
  });
}

function sendSMS(student, course) {
  return new Promise((_, reject) => {
    // Simulated SMS gateway error
    setTimeout(() => reject(new Error('SMS Gateway connection failed')), 20);
  });
}

function writeAuditLog(student, course) {
  return new Promise(resolve => {
    setTimeout(() => resolve(`Audit log entry saved for ${student.id}`), 15);
  });
}

// Part A: Sequential promise chain with .then, .catch, and .finally
function runRegistrationChain(studentId, courseCode) {
  let loadedStudent = null;
  let loadedCourse = null;

  return getStudent(studentId)
    .then(student => {
      loadedStudent = student;
      return getCourse(courseCode);
    })
    .then(course => {
      loadedCourse = course;
      return checkPrerequisites(loadedStudent, loadedCourse);
    })
    .then(() => {
      return checkSeats(loadedCourse);
    })
    .then(() => {
      return registerStudent(loadedStudent, loadedCourse);
    })
    .then(confirmation => {
      console.log("Registration chain succeeded:", confirmation);
      return { confirmation, student: loadedStudent, course: loadedCourse };
    })
    .catch(err => {
      console.log("Registration chain error:", err.message);
      throw err;
    })
    .finally(() => {
      console.log(`[finally] Registration chain completed for Student: ${studentId}, Course: ${courseCode}`);
    });
}

// Part B: Post-registration tasks using Promise.allSettled
function runPostServices(student, course) {
  console.log("\n--- Part B: Post-Registration Services (Promise.allSettled) ---");

  let tasks = [
    sendEmail(student, course),
    sendSMS(student, course),
    writeAuditLog(student, course)
  ];

  return Promise.allSettled(tasks).then(results => {
    let serviceNames = ['Email', 'SMS', 'Audit'];
    let report = results.map((res, i) => ({
      service: serviceNames[i],
      status: res.status
    }));

    console.log("Post-registration report:");
    console.log(report);
    return report;
  });
}

// Part C: Fast service selection using Promise.any
// Server 1 fails fast at 15ms, Server 2 succeeds at 35ms
function fetchServer1(code) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Server 1: 503 Service Unavailable")), 15);
  });
}

function fetchServer2(code) {
  return new Promise(resolve => {
    setTimeout(() => resolve({ server: "Server 2 (Backup)", code, status: "ONLINE" }), 35);
  });
}

function selectCourseServer(code) {
  console.log("\n--- Part C: Service Selection (Promise.any) ---");
  console.log("Why Promise.any() instead of Promise.race()?");
  console.log("Promise.race() rejects immediately as soon as Server 1 fails at 15ms.");
  console.log("Promise.any() ignores Server 1's rejection and resolves with the first successful result from Server 2.");

  return Promise.any([fetchServer1(code), fetchServer2(code)])
    .then(res => {
      console.log("First successful response:", res);
      return res;
    })
    .catch(err => {
      console.log("All servers failed:", err.errors);
    });
}

// Demo function
async function demo() {
  console.log("--- Part A: Running Registration Chain ---");
  try {
    let { student, course } = await runRegistrationChain(101, 'CS401');

    // Run post-registration services
    await runPostServices(student, course);

    // Run server selection
    await selectCourseServer('CS401');

    // Run failure test
    console.log("\n--- Testing Failure Scenario (Missing Prerequisite) ---");
    await runRegistrationChain(102, 'CS401');
  } catch (err) {
    // Handled in catch block
  }
}

demo();
