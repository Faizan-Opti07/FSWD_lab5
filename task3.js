// Task 3: Safe Student Profile Update Service

// Sample student record
const student = {
  id: 101,
  name: 'Ali',
  marks: 0,
  scholarship: false,
  address: {
    city: 'Islamabad',
    sector: 'F-10'
  },
  contact: {
    email: 'ali@university.edu'
  }
};

// Incoming profile update payload
const update = {
  name: 'Ali Khan',
  address: {
    city: 'Rawalpindi'
  },
  contact: {
    phone: '03001234567'
  }
};

// Rest parameters helper for tags
function formatTags(prefix, ...tags) {
  return `${prefix}: ${tags.join(', ')}`;
}

// Function to safely merge profile updates without mutating original
function updateProfile(original, changes = {}) {
  // Destructure incoming changes with rest operator
  let { address: newAddress, contact: newContact, ...otherChanges } = changes;

  // Nested destructuring and renaming from original
  let { address: { sector: oldSector } } = original;

  // Array destructuring with default fallback values
  let [defaultRole, defaultStatus] = ['Student', 'Active'];
  let { role = defaultRole, status = defaultStatus } = changes;

  // Nullish coalescing (??) so 0 and false are not treated as missing
  let marks = changes.marks ?? original.marks;
  let scholarship = changes.scholarship ?? original.scholarship;

  // Optional chaining (?.) to safely read nested properties
  let city = changes?.address?.city ?? original?.address?.city;
  let phone = changes?.contact?.phone ?? original?.contact?.phone;

  // Shallow copy nested address with spread operator
  let address = {
    ...original.address,
    ...(newAddress ?? {}),
    sector: oldSector
  };

  // Shallow copy nested contact with spread operator
  let contact = {
    ...original.contact,
    ...(newContact ?? {})
  };

  // Combine everything using spread and property shorthand
  let updatedStudent = {
    ...original,
    ...otherChanges,
    marks,
    scholarship,
    role,
    status,
    address,
    contact
  };

  return updatedStudent;
}

let updated = updateProfile(student, update);

console.log("--- Original Student ---");
console.log(student);

console.log("\n--- Updated Student ---");
console.log(updated);

// Verify that 0 and false were preserved
console.log("\n--- Value Preservation Checks ---");
console.log("Marks kept 0 (not replaced):", updated.marks === 0);
console.log("Scholarship kept false (not replaced):", updated.scholarship === false);
console.log("Address sector kept unchanged:", updated.address.sector === 'F-10');
console.log("Existing email preserved:", updated.contact.email === 'ali@university.edu');
console.log("New phone added:", updated.contact.phone === '03001234567');

// Bonus Reference Challenge: Prove reference equality
console.log("\n--- Bonus: Reference Challenge ---");
console.log("1. student === updated:", student === updated, "-> False (new root object)");
console.log("2. student.address === updated.address:", student.address === updated.address, "-> False (new address copy)");
console.log("3. student.contact === updated.contact:", student.contact === updated.contact, "-> False (new contact copy)");

console.log("\n" + formatTags("Tags", "Safe_Update", "Immutability"));
