// Base class
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hi, I'm ${this.name} and I'm ${this.age} years old.`;
  }
}

// Subclass Student
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  greet() {
    return `${super.greet()} I'm a student in grade ${this.grade}.`;
  }

  study() {
    return `${this.name} is studying.`;
  }
}

// Subclass Teacher
class Teacher extends Person {
  constructor(name, age, subject) {
    super(name, age);
    this.subject = subject;
  }

  greet() {
    return `${super.greet()} I teach ${this.subject}.`;
  }

  teach() {
    return `${this.name} is teaching ${this.subject}.`;
  }
}

// Demonstration
const person = new Person('Alex', 30);
const student = new Student('Emily', 20, '12th');
const teacher = new Teacher('Mr. Smith', 45, 'Mathematics');

console.log(person.greet());        // Hi, I'm Alex and I'm 30 years old.
console.log(student.greet());      // Hi, I'm Emily and I'm 20 years old. I'm a student in grade 12th.
console.log(student.study());      // Emily is studying.
console.log(teacher.greet());      // Hi, I'm Mr. Smith and I'm 45 years old. I teach Mathematics.
console.log(teacher.teach());      // Mr. Smith is teaching Mathematics.

console.log(student instanceof Person);  // true
console.log(teacher instanceof Student); // false
