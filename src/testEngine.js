export function assertEqual(actual, expected, message = "Values should match") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}. Expected ${formatValue(expected)}, received ${formatValue(actual)}.`);
  }
}

export function assertDeepEqual(actual, expected, message = "Objects should match") {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}. Expected ${expectedJson}, received ${actualJson}.`);
  }
}

export function assertIncludes(value, expected, message = "Text should include expected content") {
  if (!String(value).includes(expected)) {
    throw new Error(`${message}. Expected to find ${formatValue(expected)}.`);
  }
}

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

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function formatValue(value) {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "function") return "[Function]";
  return JSON.stringify(value);
}
