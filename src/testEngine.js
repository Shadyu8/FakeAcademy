/**
 * Checks that two simple values are exactly the same.
 *
 * @param {*} actual The value the student's code created.
 * @param {*} expected The value the lesson expects.
 * @param {string} message A short explanation shown when the check fails.
 * @returns {void} Nothing when the check passes.
 */
export function assertEqual(actual, expected, message = "Values should match") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}. Expected ${formatValue(expected)}, received ${formatValue(actual)}.`);
  }
}

/**
 * Checks that two objects or arrays contain the same data.
 *
 * @param {*} actual The object or array the student's code created.
 * @param {*} expected The object or array the lesson expects.
 * @param {string} message A short explanation shown when the check fails.
 * @returns {void} Nothing when the check passes.
 */
export function assertDeepEqual(actual, expected, message = "Objects should match") {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}. Expected ${expectedJson}, received ${actualJson}.`);
  }
}

/**
 * Checks that a piece of text contains another piece of text.
 *
 * @param {*} value The full text to search through.
 * @param {string} expected The text that should be found.
 * @param {string} message A short explanation shown when the check fails.
 * @returns {void} Nothing when the check passes.
 */
export function assertIncludes(value, expected, message = "Text should include expected content") {
  if (!String(value).includes(expected)) {
    throw new Error(`${message}. Expected to find ${formatValue(expected)}.`);
  }
}

/**
 * Runs the checks for one student answer and reports which checks passed.
 *
 * @param {string} code The code typed by the student.
 * @param {Array<{name: string, run: Function}>} tests The checks for the selected assignment.
 * @param {{mode?: string}} options Says whether to run JavaScript or only inspect the text.
 * @returns {{status: string, passed: number, total: number, logs: string[], results: Array}} A summary for the results panel.
 */
export function evaluateSubmission(code, tests, options = {}) {
  const logs = [];
  const module = { exports: {} };
  const mode = options.mode || "javascript";

  if (mode === "javascript") {
    try {
      const execute = new Function(
        "module",
        "exports",
        "console",
        `"use strict";\n${code}`,
      );

      execute(module, module.exports, {
        log: (...args) => logs.push(args.map(formatValue).join(" ")),
      });
    } catch (error) {
      return {
        status: "failed",
        passed: 0,
        total: tests.length,
        logs,
        results: [
          {
            name: "Code runs without syntax or runtime errors",
            status: "failed",
            message: getErrorMessage(error),
          },
        ],
      };
    }
  }

  const results = tests.map((test) => {
    try {
      test.run(module.exports, { code, logs, mode });
      return {
        name: test.name,
        status: "passed",
        message: "Passed",
      };
    } catch (error) {
      return {
        name: test.name,
        status: "failed",
        message: getErrorMessage(error),
      };
    }
  });

  const passed = results.filter((result) => result.status === "passed").length;

  return {
    status: passed === tests.length ? "passed" : "failed",
    passed,
    total: tests.length,
    logs,
    results,
  };
}

/**
 * Turns any thrown problem into a readable message.
 *
 * @param {*} error The problem caught while running a check.
 * @returns {string} A message that can be shown in the UI.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Formats values so failed checks are easier to understand.
 *
 * @param {*} value The value to show in a failure message.
 * @returns {string} Human-readable text for that value.
 */
function formatValue(value) {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "function") return "[Function]";
  return JSON.stringify(value);
}
