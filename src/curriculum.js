import { assertDeepEqual, assertEqual } from "./testEngine.js";

export const assignments = [
  {
    id: "recipe-card",
    title: "Recipe Card Component",
    path: "Foundations / DOM + data",
    level: "Starter",
    duration: "35-45 min",
    summary:
      "Turn recipe data into a presentable card model. This starts small, but mirrors the kind of data shaping needed in larger project pages.",
    concepts: ["objects", "arrays", "string formatting", "pure functions"],
    files: ["recipeCard.js"],
    startingCode: `function buildRecipeCard(recipe) {
  // Return an object with:
  // title: the recipe name
  // subtitle: "<minutes> min · <servings> servings"
  // ingredients: a comma-separated ingredient list
  // isQuick: true when the recipe takes 30 minutes or less
}

module.exports = { buildRecipeCard };`,
    instructions: [
      "Read the recipe object that is passed into buildRecipeCard.",
      "Return a new object without mutating the original recipe.",
      "Format the subtitle exactly as shown in the skeleton comment.",
      "Join ingredients with a comma and a space.",
    ],
    rubric: [
      "Uses a pure function with a returned object.",
      "Handles different recipe durations and serving counts.",
      "Keeps presentation formatting consistent.",
    ],
    tests: [
      {
        name: "exports a buildRecipeCard function",
        run(submission) {
          assertEqual(typeof submission.buildRecipeCard, "function", "buildRecipeCard should be exported");
        },
      },
      {
        name: "formats a quick recipe card",
        run(submission) {
          const recipe = {
            name: "Lemon Pasta",
            minutes: 25,
            servings: 2,
            ingredients: ["pasta", "lemon", "parmesan"],
          };

          assertDeepEqual(
            submission.buildRecipeCard(recipe),
            {
              title: "Lemon Pasta",
              subtitle: "25 min · 2 servings",
              ingredients: "pasta, lemon, parmesan",
              isQuick: true,
            },
            "Quick recipe card output is incorrect",
          );
        },
      },
      {
        name: "marks longer recipes as not quick",
        run(submission) {
          const recipe = {
            name: "Sunday Stew",
            minutes: 95,
            servings: 6,
            ingredients: ["beef", "carrots", "stock"],
          };

          assertEqual(submission.buildRecipeCard(recipe).isQuick, false, "Long recipes should not be quick");
        },
      },
    ],
  },
  {
    id: "task-board",
    title: "Task Board Summary",
    path: "Foundations / project logic",
    level: "Builder",
    duration: "60-75 min",
    summary:
      "Calculate the state of a small project board from task records. This is the first step toward dashboard-style project assignments.",
    concepts: ["array methods", "grouping", "derived state", "edge cases"],
    files: ["taskBoard.js"],
    startingCode: `function summarizeBoard(tasks) {
  // Return an object with:
  // total: number of tasks
  // done: number of tasks with status "done"
  // blocked: number of tasks with status "blocked"
  // nextTask: title of the first "todo" task, or null
}

module.exports = { summarizeBoard };`,
    instructions: [
      "Inspect each task's status field.",
      "Count done and blocked tasks separately.",
      "Find the first todo task in the same order as the input array.",
      "Return null for nextTask when there is no todo task.",
    ],
    rubric: [
      "Preserves task order for nextTask.",
      "Works for empty task lists.",
      "Keeps the result object shape stable.",
    ],
    tests: [
      {
        name: "exports a summarizeBoard function",
        run(submission) {
          assertEqual(typeof submission.summarizeBoard, "function", "summarizeBoard should be exported");
        },
      },
      {
        name: "counts task statuses and finds the next todo",
        run(submission) {
          const tasks = [
            { title: "Write brief", status: "done" },
            { title: "Build editor", status: "todo" },
            { title: "Fix deploy", status: "blocked" },
            { title: "Polish UI", status: "todo" },
          ];

          assertDeepEqual(
            submission.summarizeBoard(tasks),
            {
              total: 4,
              done: 1,
              blocked: 1,
              nextTask: "Build editor",
            },
            "Board summary is incorrect",
          );
        },
      },
      {
        name: "handles a board with no todo tasks",
        run(submission) {
          const tasks = [
            { title: "Ship", status: "done" },
            { title: "Review", status: "blocked" },
          ];

          assertEqual(submission.summarizeBoard(tasks).nextTask, null, "nextTask should be null without todos");
        },
      },
    ],
  },
];
