import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PythonQuestion from './models/PythonQuestion.js';

dotenv.config();

const questions = [
  // Variables - Easy
  {
    topic: 'variables', difficulty: 'Easy', type: 'output',
    code: "x = 5\ny = 10\nprint(x + y)",
    question: "What is the output of this code?",
    options: ["5", "10", "15", "Error"], answer: "15",
    explanation: "x is 5, y is 10. The sum is 15."
  },
  {
    topic: 'variables', difficulty: 'Easy', type: 'fill-in',
    code: "name = ______\nprint(name)",
    question: "Complete the code to print 'Alice'.",
    answer: "'Alice'", explanation: "Strings must be enclosed in quotes."
  },
  {
    topic: 'variables', difficulty: 'Easy', type: 'output',
    code: "a = 1\nb = a\na = 2\nprint(b)",
    question: "What is the value of b?",
    options: ["1", "2", "a", "Error"], answer: "1",
    explanation: "b takes the value of a at the time of assignment."
  },
  {
    topic: 'variables', difficulty: 'Easy', type: 'fill-in',
    code: "x, y = 5, 10\n______ = x + y",
    question: "Store the sum of x and y in a variable named result.",
    answer: "result", explanation: "Assignment happens from right to left."
  },
  {
    topic: 'variables', difficulty: 'Easy', type: 'output',
    code: "x = '5'\ny = '10'\nprint(x + y)",
    question: "What is the output?",
    options: ["15", "510", "Error", "5 10"], answer: "510",
    explanation: "Adding two strings concatenates them."
  },

  // Data Types - Easy
  {
    topic: 'data_types', difficulty: 'Easy', type: 'output',
    code: "print(type(10.5))",
    question: "What is the output?",
    options: ["int", "str", "float", "bool"], answer: "float",
    explanation: "Decimal numbers are floats in Python."
  },
  {
    topic: 'data_types', difficulty: 'Easy', type: 'output',
    code: "print(bool(0))",
    question: "What is the boolean value of 0?",
    options: ["True", "False", "None", "Error"], answer: "False",
    explanation: "In Python, 0 is considered False."
  },
  {
    topic: 'data_types', difficulty: 'Easy', type: 'output',
    code: "s = 'Python'\nprint(s[0])",
    question: "What does this print?",
    options: ["P", "y", "n", "Error"], answer: "P",
    explanation: "Indexing in Python starts at 0."
  },
  {
    topic: 'data_types', difficulty: 'Easy', type: 'fill-in',
    code: "age = ______(input('Enter age: '))",
    question: "Convert the input string to an integer.",
    answer: "int", explanation: "int() converts values to integers."
  },
  {
    topic: 'data_types', difficulty: 'Easy', type: 'output',
    code: "print(len('EduPlay'))",
    question: "What is the output?",
    options: ["6", "7", "8", "5"], answer: "7",
    explanation: "len() returns the number of characters in a string."
  },

  // Operators - Easy
  {
    topic: 'operators', difficulty: 'Easy', type: 'output',
    code: "print(10 // 3)",
    question: "What is the result of floor division?",
    options: ["3.33", "3", "4", "1"], answer: "3",
    explanation: "// returns the largest integer less than or equal to the division result."
  },
  {
    topic: 'operators', difficulty: 'Easy', type: 'output',
    code: "print(2 ** 3)",
    question: "What is the output?",
    options: ["6", "8", "9", "5"], answer: "8",
    explanation: "** is the exponentiation operator (2 to the power of 3)."
  },
  {
    topic: 'operators', difficulty: 'Easy', type: 'fill-in',
    code: "is_equal = (5 ______ 5)",
    question: "Use the comparison operator to check if 5 is equal to 5.",
    answer: "==", explanation: "== checks for equality."
  },
  {
    topic: 'operators', difficulty: 'Easy', type: 'output',
    code: "print(10 % 3)",
    question: "What is the remainder?",
    options: ["1", "3", "0", "10"], answer: "1",
    explanation: "% is the modulo operator."
  },
  {
    topic: 'operators', difficulty: 'Easy', type: 'output',
    code: "print(True and False)",
    question: "What is the result?",
    options: ["True", "False", "None", "Error"], answer: "False",
    explanation: "'and' requires both sides to be True."
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gamified-edu');
    console.log('Connected to MongoDB for question seeding...');
    await PythonQuestion.deleteMany({});
    await PythonQuestion.insertMany(questions);
    console.log('Successfully seeded Python Question Bank!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
