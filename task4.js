// Task 4: University User Hierarchy and Dynamic this

// Base Person class
class Person {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  introduce() {
    return `Hi, I am ${this.name} (${this.email})`;
  }
}

// Student subclass
class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email);
    this.rollNo = rollNo;
    this.marks = marks;
  }

  // Override introduce and reuse parent intro
  introduce() {
    return `${super.introduce()} | Student [Roll: ${this.rollNo}]`;
  }

  getResult() {
    return this.marks >= 50 ? 'Passed' : 'Failed';
  }
}

// FacultyMember subclass
class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId;
    this.department = department;
  }

  // Override introduce and reuse parent intro
  introduce() {
    return `${super.introduce()} | Faculty [Dept: ${this.department}, EmpID: ${this.employeeId}]`;
  }
}

// Polymorphism test: mixing Student and Faculty objects in one array
const users = [
  new Student('Sara Khan', 'sara@uni.edu', 'CS-201', 89),
  new FacultyMember('Dr. Kamran', 'kamran@uni.edu', 'FAC-402', 'Computer Science'),
  new Student('Bilal Tariq', 'bilal@uni.edu', 'SE-105', 42),
  new FacultyMember('Engr. Ayesha', 'ayesha@uni.edu', 'FAC-512', 'Software Engineering')
];

console.log("--- User Introductions (Polymorphism) ---");
users.forEach(u => console.log(u.introduce()));

console.log("\n--- Student Results ---");
users.filter(u => u instanceof Student).forEach(s => {
  console.log(`${s.name} (Marks: ${s.marks}) -> Result: ${s.getResult()}`);
});

console.log("\n--- Instanceof Type Verification ---");
let sampleStudent = users[0];
console.log("sampleStudent instanceof Student:", sampleStudent instanceof Student);
console.log("sampleStudent instanceof Person:", sampleStudent instanceof Person);
console.log("sampleStudent instanceof FacultyMember:", sampleStudent instanceof FacultyMember);

// Bonus: this, call() and bind() Challenge
console.log("\n--- Bonus: this, call() and bind() Challenge ---");

const guest = {
  name: 'Dr. Ahmed',
  email: 'ahmed@example.com'
};

// 1. Borrow Person introduce method using call()
let guestIntro = Person.prototype.introduce.call(guest);
console.log("1. Using call() with guest object:", guestIntro);

// 2. Detach method from object to show lost this binding
let detachedFn = sampleStudent.introduce;
try {
  detachedFn();
} catch (err) {
  console.log("2. Detached method failed as expected:", err.message);
  console.log("   Explanation: Detaching the method loses 'this', so this becomes undefined in strict mode.");
}

// 3. Fix this binding using bind()
let boundFn = sampleStudent.introduce.bind(sampleStudent);
console.log("3. Safely bound with bind():", boundFn());
