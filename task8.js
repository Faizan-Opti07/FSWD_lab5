// Task 8: Concurrent Academic API Aggregator with async/await

// Mock backend API data
const apiData = {
  '/users': [
    { id: 1, name: 'Sara Khan', department: 'CS' },
    { id: 2, name: 'Ali Ahmed', department: 'SE' },
    { id: 3, name: 'Zoya Fatima', department: 'AI' },
    { id: 4, name: 'Usman Tariq', department: 'CS' }
  ],
  '/courses': [
    { code: 'CS301', title: 'Data Structures' },
    { code: 'SE302', title: 'Software Design' },
    { code: 'AI303', title: 'Machine Learning' }
  ],
  '/results': [
    { studentId: 1, name: 'Sara Khan', department: 'CS', marks: 92 },
    { studentId: 2, name: 'Ali Ahmed', department: 'SE', marks: 84 },
    { studentId: 3, name: 'Zoya Fatima', department: 'AI', marks: 44 },
    { studentId: 4, name: 'Usman Tariq', department: 'CS', marks: 78 }
  ]
};

// Fake Fetch implementation supporting AbortSignal for timeouts
function fakeFetch(url, options = {}) {
  let signal = options.signal;

  return new Promise((resolve, reject) => {
    // Check if already aborted
    if (signal?.aborted) {
      return reject(new DOMException('This operation was aborted', 'AbortError'));
    }

    let abortListener;
    if (signal) {
      abortListener = () => reject(new DOMException('This operation was aborted', 'AbortError'));
      signal.addEventListener('abort', abortListener, { once: true });
    }

    let delay = url === '/slow' ? 250 : 35;

    let timer = setTimeout(() => {
      if (signal && abortListener) {
        signal.removeEventListener('abort', abortListener);
      }

      // 1. Network failure
      if (url === '/network-fail') {
        return reject(new TypeError('Failed to fetch: Connection refused'));
      }

      // 2. 404 Not Found
      if (url === '/not-found') {
        return resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ error: 'Not found' })
        });
      }

      // 3. 500 Internal Server Error
      if (url === '/server-error') {
        return resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' })
        });
      }

      // 4. Invalid JSON
      if (url === '/invalid-json') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => {
            throw new SyntaxError('Unexpected token < in JSON at position 0');
          }
        });
      }

      // 5. Normal data endpoint
      let data = apiData[url];
      if (data) {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => JSON.parse(JSON.stringify(data))
        });
      }

      // 6. Slow route
      if (url === '/slow') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ message: 'Slow data arrived' })
        });
      }

      return resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Route not found' })
      });
    }, delay);

    if (signal) {
      signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
    }
  });
}

// Fetch helper checking response.ok and returning JSON
async function getJSON(url, fetchImpl = fakeFetch) {
  let response = await fetchImpl(url);

  // Check HTTP status ok
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  let data = await response.json();
  return data;
}

// Compute dashboard metrics from users, courses, and results
function getDashboardStats(users, courses, results) {
  let totalStudents = users.length;
  let totalCourses = courses.length;

  let totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
  let overallAverage = Number((totalMarks / results.length).toFixed(2));

  // Highest scorer
  let highest = results.reduce((max, r) => r.marks > max.marks ? r : max, results[0]);

  // Count failing students (< 50)
  let failedCount = results.filter(r => r.marks < 50).length;

  // Group by department
  let deptMap = results.reduce((acc, r) => {
    let dept = r.department;
    if (!acc[dept]) acc[dept] = { count: 0, total: 0, passed: 0 };
    acc[dept].count++;
    acc[dept].total += r.marks;
    if (r.marks >= 50) acc[dept].passed++;
    return acc;
  }, {});

  let departmentStats = {};
  for (let dept of Object.keys(deptMap)) {
    let d = deptMap[dept];
    departmentStats[dept] = {
      students: d.count,
      average: Number((d.total / d.count).toFixed(2)),
      passed: d.passed
    };
  }

  return {
    totalStudents,
    totalCourses,
    overallAverageMarks: overallAverage,
    highestPerformingStudent: { name: highest.name, department: highest.department, marks: highest.marks },
    failedStudentsCount: failedCount,
    departmentWiseStatistics: departmentStats
  };
}

// Bonus Challenge: Timeout using AbortController
async function fetchWithTimeout(url, milliseconds, fetchImpl = fakeFetch) {
  let controller = new AbortController();
  let timerId = setTimeout(() => controller.abort(), milliseconds);

  try {
    let response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    // Categorize error types
    if (err.name === 'AbortError') {
      throw new Error(`[Timeout]: Request timed out after ${milliseconds}ms`);
    }
    if (err instanceof SyntaxError) {
      throw new Error(`[Invalid JSON]: ${err.message}`);
    }
    if (err.message.startsWith('HTTP Error')) {
      throw new Error(`[HTTP Failure]: ${err.message}`);
    }
    throw new Error(`[Network Failure]: ${err.message}`);
  } finally {
    clearTimeout(timerId);
  }
}

// Main dashboard execution
async function runDashboard() {
  console.log("--- Concurrent Dashboard Loading (Promise.all) ---");
  let startTime = Date.now();

  try {
    // Run 3 independent endpoints in parallel
    let [users, courses, results] = await Promise.all([
      getJSON('/users', fakeFetch),
      getJSON('/courses', fakeFetch),
      getJSON('/results', fakeFetch)
    ]);

    let duration = Date.now() - startTime;
    console.log(`Loaded 3 services concurrently in ${duration}ms (no sequential waiting).`);

    let stats = getDashboardStats(users, courses, results);
    console.log("\nDashboard Analytics:");
    console.log(stats);
  } catch (err) {
    console.log("Dashboard load error:", err.message);
  }

  // Testing timeout and error categories
  console.log("\n--- Bonus: Timeout Challenge Demonstrations ---");

  // 1. Success within timeout
  try {
    let ok = await fetchWithTimeout('/courses', 500, fakeFetch);
    console.log("1. Within timeout limit -> Success, courses loaded:", ok.length);
  } catch (e) {
    console.log("1. Error:", e.message);
  }

  // 2. Timeout on slow route
  try {
    await fetchWithTimeout('/slow', 50, fakeFetch);
  } catch (e) {
    console.log("2. Slow request timed out as expected ->", e.message);
  }

  // 3. HTTP 404
  try {
    await fetchWithTimeout('/not-found', 500, fakeFetch);
  } catch (e) {
    console.log("3. 404 handled ->", e.message);
  }

  // 4. HTTP 500
  try {
    await fetchWithTimeout('/server-error', 500, fakeFetch);
  } catch (e) {
    console.log("4. 500 handled ->", e.message);
  }

  // 5. Network failure
  try {
    await fetchWithTimeout('/network-fail', 500, fakeFetch);
  } catch (e) {
    console.log("5. Network failure handled ->", e.message);
  }

  // 6. Invalid JSON
  try {
    await fetchWithTimeout('/invalid-json', 500, fakeFetch);
  } catch (e) {
    console.log("6. Invalid JSON handled ->", e.message);
  }
}

runDashboard();
