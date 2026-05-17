import test from "node:test";
import assert from "node:assert/strict";

import { evaluateSubmission } from "../src/testEngine.js";

test("evaluateSubmission returns passing results for valid CommonJS-style code", () => {
  const result = evaluateSubmission(
    `function add(a, b) {
      return a + b;
    }

    module.exports = { add };`,
    [
      {
        name: "adds numbers",
        run(submission) {
          assert.equal(submission.add(2, 3), 5);
        },
      },
    ],
  );

  assert.equal(result.status, "passed");
  assert.equal(result.passed, 1);
  assert.equal(result.total, 1);
});

test("evaluateSubmission reports assertion failures without stopping all checks", () => {
  const result = evaluateSubmission(
    `module.exports = {
      value: 1,
    };`,
    [
      {
        name: "fails",
        run(submission) {
          assert.equal(submission.value, 2);
        },
      },
      {
        name: "passes",
        run(submission) {
          assert.equal(submission.value, 1);
        },
      },
    ],
  );

  assert.equal(result.status, "failed");
  assert.equal(result.passed, 1);
  assert.equal(result.total, 2);
  assert.equal(result.results[0].status, "failed");
  assert.equal(result.results[1].status, "passed");
});

test("evaluateSubmission reports syntax errors as a failed run", () => {
  const result = evaluateSubmission("function nope(", [
    {
      name: "never runs",
      run() {
        throw new Error("should not run");
      },
    },
  ]);

  assert.equal(result.status, "failed");
  assert.equal(result.passed, 0);
  assert.equal(result.results[0].name, "Code runs without syntax or runtime errors");
});

test("evaluateSubmission can run static checks without executing the submission", () => {
  const result = evaluateSubmission("def get_winner(board):\n    pass", [
    {
      name: "defines get_winner",
      run(_submission, context) {
        assert.match(context.code, /def\s+get_winner/);
      },
    },
  ], {
    mode: "static",
  });

  assert.equal(result.status, "passed");
});
