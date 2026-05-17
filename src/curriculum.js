import { assertDeepEqual, assertEqual, assertIncludes } from "./testEngine.js";

const ticTacToeInstructions = [
  "Represent the board as nine cells, using empty values for open spaces and X or O for played moves.",
  "Create a board, place moves by position, reject moves outside the board, and reject moves on occupied cells.",
  "Detect wins across rows, columns, and diagonals.",
  "Detect a draw only when the board is full and no player has won.",
  "Keep the core game logic separate from printing or user input so it can be tested.",
];

const ticTacToeRubric = [
  "Board state is predictable and easy to inspect.",
  "Move validation handles invalid positions and occupied cells.",
  "Winner detection covers all eight winning lines.",
  "Draw detection does not hide a final winning move.",
  "Functions are small enough to reuse in a command-line or browser version later.",
];

const ticTacToeConcepts = ["game state", "arrays", "validation", "conditionals", "pure logic"];

export const assignments = [
  {
    id: "tic-tac-toe-python",
    title: "Tic Tac Toe",
    language: "Python",
    path: "Games / Python",
    level: "Starter",
    duration: "90-120 min",
    summary:
      "Build the reusable game logic for Tic Tac Toe in Python. This version focuses on clean functions before adding a command-line interface.",
    concepts: ticTacToeConcepts,
    files: ["tic_tac_toe.py"],
    checkMode: "static",
    startingCode: `EMPTY = " "


def create_board():
    # Return a list with nine EMPTY cells.
    pass


def make_move(board, position, player):
    # Return True when the move is placed.
    # Return False when position is invalid or already taken.
    pass


def get_winner(board):
    # Return "X", "O", or None.
    pass


def is_draw(board):
    # Return True only when the board is full and there is no winner.
    pass`,
    instructions: ticTacToeInstructions,
    rubric: ticTacToeRubric,
    tests: [
      {
        name: "defines the required Python functions",
        run(_submission, { code }) {
          ["def create_board", "def make_move", "def get_winner", "def is_draw"].forEach((signature) => {
            assertIncludes(code, signature, `${signature} should exist`);
          });
        },
      },
      {
        name: "keeps Tic Tac Toe symbols explicit",
        run(_submission, { code }) {
          assertIncludes(code, '"X"', "The X player symbol should be represented");
          assertIncludes(code, '"O"', "The O player symbol should be represented");
        },
      },
      {
        name: "includes win and draw logic hooks",
        run(_submission, { code }) {
          assertIncludes(code, "winning", "Store or iterate over winning line combinations");
          assertIncludes(code, "None", "Use None when there is no winner");
        },
      },
    ],
  },
  {
    id: "tic-tac-toe-cpp",
    title: "Tic Tac Toe",
    language: "C++",
    path: "Games / C++",
    level: "Starter",
    duration: "90-120 min",
    summary:
      "Build the reusable game logic for Tic Tac Toe in C++. This version prepares the rules for a later terminal game loop.",
    concepts: ticTacToeConcepts,
    files: ["tic_tac_toe.cpp"],
    checkMode: "static",
    startingCode: `#include <string>
#include <vector>

using Board = std::vector<char>;

Board createBoard() {
  // Return a board with nine empty cells.
}

bool makeMove(Board& board, int position, char player) {
  // Return true when the move is placed.
  // Return false when position is invalid or already taken.
}

char getWinner(const Board& board) {
  // Return 'X', 'O', or ' ' when there is no winner.
}

bool isDraw(const Board& board) {
  // Return true only when the board is full and there is no winner.
}`,
    instructions: ticTacToeInstructions,
    rubric: ticTacToeRubric,
    tests: [
      {
        name: "defines the required C++ functions",
        run(_submission, { code }) {
          ["createBoard", "makeMove", "getWinner", "isDraw"].forEach((name) => {
            assertIncludes(code, name, `${name} should exist`);
          });
        },
      },
      {
        name: "uses an indexed board structure",
        run(_submission, { code }) {
          assertIncludes(code, "std::vector", "Use std::vector for the board");
          assertIncludes(code, "Board", "Keep a clear Board type alias");
        },
      },
      {
        name: "keeps Tic Tac Toe symbols explicit",
        run(_submission, { code }) {
          assertIncludes(code, "'X'", "The X player symbol should be represented");
          assertIncludes(code, "'O'", "The O player symbol should be represented");
        },
      },
    ],
  },
  {
    id: "tic-tac-toe-javascript",
    title: "Tic Tac Toe",
    language: "JavaScript",
    path: "Games / JavaScript",
    level: "Starter",
    duration: "90-120 min",
    summary:
      "Build the reusable game logic for Tic Tac Toe in JavaScript. This version already runs behavioral checks in the browser.",
    concepts: ticTacToeConcepts,
    files: ["ticTacToe.js"],
    checkMode: "javascript",
    startingCode: `function createBoard() {
  // Return an array with nine empty cells.
}

function makeMove(board, position, player) {
  // Return true when the move is placed.
  // Return false when position is invalid or already taken.
}

function getWinner(board) {
  // Return "X", "O", or null.
}

function isDraw(board) {
  // Return true only when the board is full and there is no winner.
}

module.exports = {
  createBoard,
  makeMove,
  getWinner,
  isDraw,
};`,
    instructions: ticTacToeInstructions,
    rubric: ticTacToeRubric,
    tests: [
      {
        name: "exports the required game functions",
        run(submission) {
          ["createBoard", "makeMove", "getWinner", "isDraw"].forEach((name) => {
            assertEqual(typeof submission[name], "function", `${name} should be exported`);
          });
        },
      },
      {
        name: "creates a nine-cell empty board",
        run(submission) {
          assertDeepEqual(
            submission.createBoard(),
            ["", "", "", "", "", "", "", "", ""],
            "createBoard should return nine empty string cells",
          );
        },
      },
      {
        name: "places valid moves and rejects invalid moves",
        run(submission) {
          const board = submission.createBoard();

          assertEqual(submission.makeMove(board, 0, "X"), true, "First move should be accepted");
          assertEqual(board[0], "X", "Accepted move should update the board");
          assertEqual(submission.makeMove(board, 0, "O"), false, "Occupied cells should be rejected");
          assertEqual(submission.makeMove(board, 9, "O"), false, "Out-of-range positions should be rejected");
        },
      },
      {
        name: "detects row, column, and diagonal winners",
        run(submission) {
          assertEqual(submission.getWinner(["X", "X", "X", "", "", "", "", "", ""]), "X", "Top row win failed");
          assertEqual(submission.getWinner(["O", "", "", "O", "", "", "O", "", ""]), "O", "Left column win failed");
          assertEqual(submission.getWinner(["X", "", "", "", "X", "", "", "", "X"]), "X", "Diagonal win failed");
        },
      },
      {
        name: "detects draws without hiding winners",
        run(submission) {
          assertEqual(submission.isDraw(["X", "O", "X", "X", "O", "O", "O", "X", "X"]), true, "Full non-winning board should be a draw");
          assertEqual(submission.isDraw(["X", "X", "X", "O", "O", "", "", "", ""]), false, "Winning boards should not be draws");
        },
      },
    ],
  },
];
