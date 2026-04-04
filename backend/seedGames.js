import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from './models/Game.js';
import PythonLevel from './models/PythonLevel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gamified-edu';

const defaultGames = [
  {
    name: 'Math Blitz',
    type: 'Math',
    category: 'Mathematics',
    description: 'Solve arithmetic problems at lightning speed to dominate the leaderboard.',
    difficulty: 'Easy',
    icon: 'Calculator',
    xpReward: 10,
    path: '/games/math',
    color: 'emerald'
  },
  {
    name: 'Knowledge Quiz',
    type: 'Quiz',
    category: 'General Knowledge',
    description: 'Test your wisdom across science, math, and general knowledge categories.',
    difficulty: 'Medium',
    icon: 'BrainCircuit',
    xpReward: 15,
    path: '/games/quiz',
    color: 'primary'
  },
  {
    name: 'Logic Puzzles',
    type: 'Puzzle',
    category: 'Logic',
    description: 'Challenge your brain with pattern recognition and complex reasoning tasks.',
    difficulty: 'Hard',
    icon: 'Puzzle',
    xpReward: 20,
    path: '/games/logic',
    color: 'amber'
  },
  {
    name: 'Python Adventure',
    type: 'Learning',
    category: 'Programming',
    description: 'Learn Python basics through fun challenges and mini-games in an epic quest.',
    difficulty: 'Progressive',
    icon: 'Terminal',
    xpReward: 25,
    path: '/games/python',
    color: 'rose'
  }
];

const pythonLevels = [
  {
    levelId: 1,
    title: 'Variables',
    concept: 'Storing data',
    icon: '📦',
    lesson: "In Python, variables are used to store data. You create a variable by giving it a name and assigning it a value using the `=` operator.",
    example: "name = \"Edu\"\nscore = 100",
    challenge: {
      question: "Create a variable named 'player' and assign it the value 'Hero'.",
      type: 'fill-in',
      code_template: "______ = \"Hero\"",
      answer: "player"
    },
    quiz: [
      { q: "Which symbol is used for assignment?", a: ["=", "==", ":", "->"], correct: 0 },
      { q: "Is '1name' a valid variable name?", a: ["Yes", "No"], correct: 1 }
    ]
  },
  {
    levelId: 2,
    title: 'Data Types',
    concept: 'Strings & Numbers',
    icon: '🔢',
    lesson: "Python has various data types. The most common ones are Integers (numbers), Strings (text), and Floats (decimal numbers).",
    example: "age = 25 # Integer\nprice = 9.99 # Float\nmessage = \"Hello\" # String",
    challenge: {
      question: "What is the data type of the value 10.5?",
      type: 'choice',
      options: ["int", "str", "float", "bool"],
      answer: "float"
    },
    quiz: [
      { q: "Which of these is a string?", a: ["10", "'10'", "10.0", "True"], correct: 1 },
      { q: "What data type is used for True/False values?", a: ["Integer", "String", "Boolean"], correct: 2 }
    ]
  },
  {
    levelId: 3,
    title: 'Operators',
    concept: 'Calculations',
    icon: '➕',
    lesson: "Operators are used to perform operations on variables and values. Basic arithmetic: + (Add), - (Sub), * (Mul), / (Div).",
    example: "total = 10 + 5 # 15\nproduct = 4 * 3 # 12",
    challenge: {
      question: "What is the result of 10 / 2 in Python?",
      type: 'input',
      answer: "5.0"
    },
    quiz: [
      { q: "Which operator is used for multiplication?", a: ["x", "*", "^", "&"], correct: 1 },
      { q: "What is 10 % 3? (Remainder)", a: ["1", "3", "0", "10"], correct: 0 }
    ]
  },
  {
    levelId: 4,
    title: 'Lists',
    concept: 'Collections',
    icon: '📝',
    lesson: "Lists are used to store multiple items in a single variable. They are created using square brackets [].",
    example: "fruits = [\"apple\", \"banana\", \"cherry\"]\nprint(fruits[0]) # apple",
    challenge: {
      question: "Access the second item in the list: items = [10, 20, 30]",
      type: 'fill-in',
      code_template: "print(items[____])",
      answer: "1"
    },
    quiz: [
      { q: "What is the index of the first item in a list?", a: ["1", "0", "-1", "First"], correct: 1 },
      { q: "Which method adds an item to a list?", a: ["add()", "push()", "append()"], correct: 2 }
    ]
  },
  {
    levelId: 5,
    title: 'Conditions',
    concept: 'If/Else Logic',
    icon: '🔀',
    lesson: "Conditions allow your code to make decisions. The 'if' statement is used for this, often with 'else' for alternatives.",
    example: "if score > 50:\n    print(\"You win!\")\nelse:\n    print(\"Try again\")",
    challenge: {
      question: "Complete the condition to check if age is 18 or older.",
      type: 'fill-in',
      code_template: "if age ____ 18:",
      answer: ">="
    },
    quiz: [
      { q: "Which keyword is used for 'else if' in Python?", a: ["elseif", "elsif", "elif"], correct: 2 },
      { q: "Which operator checks for equality?", a: ["=", "==", "===", "is"], correct: 1 }
    ]
  },
  {
    levelId: 6,
    title: 'Loops',
    concept: 'Repeat actions',
    icon: '🔁',
    lesson: "Loops allow you to repeat a block of code. 'for' loops are great for iterating over a sequence (like a list).",
    example: "for i in range(5):\n    print(i) # prints 0 to 4",
    challenge: {
      question: "How many times will this loop run? for i in range(3):",
      type: 'input',
      answer: "3"
    },
    quiz: [
      { q: "Which loop runs while a condition is True?", a: ["for", "while", "repeat"], correct: 1 },
      { q: "What does 'break' do?", a: ["Restarts loop", "Exits loop", "Skips iteration"], correct: 1 }
    ]
  },
  {
    levelId: 7,
    title: 'Functions',
    concept: 'Reusable code',
    icon: '⚙️',
    lesson: "Functions are blocks of code that only run when called. You define them using the 'def' keyword.",
    example: "def greet():\n    print(\"Hello!\")\n\ngreet() # Calling the function",
    challenge: {
      question: "Complete the function definition.",
      type: 'fill-in',
      code_template: "____ my_function():",
      answer: "def"
    },
    quiz: [
      { q: "How do you send data into a function?", a: ["Variables", "Arguments", "Deliveries"], correct: 1 },
      { q: "What keyword sends a value back from a function?", a: ["send", "back", "return"], correct: 2 }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding games...');

    // Seed Games
    for (const gameData of defaultGames) {
      await Game.findOneAndUpdate(
        { name: gameData.name },
        gameData,
        { upsert: true, new: true }
      );
    }
    console.log('Default games seeded successfully!');

    // Seed Python Levels
    for (const levelData of pythonLevels) {
      await PythonLevel.findOneAndUpdate(
        { levelId: levelData.levelId },
        levelData,
        { upsert: true, new: true }
      );
    }
    console.log('Python levels seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
