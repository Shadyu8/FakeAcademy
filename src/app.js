import { assignments } from "./curriculum.js";
import { evaluateSubmission } from "./testEngine.js";

const state = {
  activeAssignmentId: getInitialAssignmentId(),
  activeTab: "instructions",
  progress: loadProgress(),
};

const elements = {
  trackCount: document.querySelector("#track-count"),
  assignmentList: document.querySelector("#assignment-list"),
  assignmentPath: document.querySelector("#assignment-path"),
  assignmentTitle: document.querySelector("#assignment-title"),
  assignmentLevel: document.querySelector("#assignment-level"),
  assignmentSummary: document.querySelector("#assignment-summary"),
  projectMeta: document.querySelector("#project-meta"),
  tabPanel: document.querySelector("#tab-panel"),
  tabs: document.querySelectorAll(".tab"),
  activeFile: document.querySelector("#active-file"),
  editorTitle: document.querySelector("#editor-title"),
  codeEditor: document.querySelector("#code-editor"),
  resetCode: document.querySelector("#reset-code"),
  runTests: document.querySelector("#run-tests"),
  resultSummary: document.querySelector("#result-summary"),
  resultList: document.querySelector("#result-list"),
};

/**
 * Finds the assignment currently selected in the sidebar.
 *
 * @returns {object} The active assignment, or the first assignment as a fallback.
 */
function getActiveAssignment() {
  return assignments.find((assignment) => assignment.id === state.activeAssignmentId) || assignments[0];
}

/**
 * Draws the sidebar list and groups projects under their language.
 *
 * @returns {void} Updates the page directly.
 */
function renderAssignmentList() {
  elements.trackCount.textContent = `${assignments.length} projects`;
  elements.assignmentList.innerHTML = getAssignmentsByLanguage()
    .map(
      ([language, languageAssignments]) => `
        <section class="language-group" aria-label="${language} assignments">
          <h2>${language}</h2>
          ${languageAssignments
            .map((assignment) => {
              const index = assignments.findIndex((candidate) => candidate.id === assignment.id);

              return `
                <button class="assignment-item ${assignment.id === state.activeAssignmentId ? "is-active" : ""}" type="button" data-assignment-id="${assignment.id}">
                  <span class="assignment-index">${String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>${assignment.title}</strong>
                    <small>${assignment.level} · ${assignment.duration}</small>
                    <em class="assignment-status">${getAssignmentStatusLabel(assignment.id)}</em>
                  </span>
                </button>
              `;
            })
            .join("")}
        </section>
      `,
    )
    .join("");
}

/**
 * Shows the small facts under the project summary.
 *
 * @param {object} assignment The assignment currently being viewed.
 * @returns {void} Updates the page directly.
 */
function renderMeta(assignment) {
  elements.projectMeta.innerHTML = [
    { label: "Language", value: assignment.language },
    { label: "Time", value: assignment.duration },
    { label: "Concepts", value: assignment.concepts.join(", ") },
    { label: "Checks", value: assignment.checkMode === "javascript" ? "Behavioral" : "Static contract" },
  ]
    .map(
      (item) => `
        <div>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </div>
      `,
    )
    .join("");
}

/**
 * Shows instructions, files, or rubric for the current project tab.
 *
 * @param {object} assignment The assignment currently being viewed.
 * @returns {void} Updates the page directly.
 */
function renderTabPanel(assignment) {
  const listByTab = {
    instructions: assignment.instructions,
    files: assignment.files.map((file) => `${file} is the starter file you complete in the editor.`),
    rubric: assignment.rubric,
  };

  elements.tabPanel.innerHTML = `
    <ol>
      ${listByTab[state.activeTab].map((item) => `<li>${item}</li>`).join("")}
    </ol>
  `;
}

/**
 * Refreshes the whole main workspace for the selected assignment.
 *
 * @returns {void} Updates the page directly.
 */
function renderAssignment() {
  const assignment = getActiveAssignment();

  elements.assignmentPath.textContent = assignment.path;
  elements.assignmentTitle.textContent = assignment.title;
  elements.assignmentLevel.textContent = assignment.level;
  elements.assignmentSummary.textContent = assignment.summary;
  elements.activeFile.textContent = assignment.files[0];
  elements.editorTitle.textContent = "Skeleton file";
  elements.codeEditor.value = getSavedCode(assignment);
  elements.resultSummary.textContent =
    state.progress.statusByAssignment[assignment.id] === "passed"
      ? "Completed. You can keep improving the solution and rerun checks."
      : "Run the checks when your implementation is ready.";
  elements.resultList.innerHTML = "";

  renderAssignmentList();
  renderMeta(assignment);
  renderTabPanel(assignment);
}

elements.assignmentList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-assignment-id]");
  if (!item) return;

  selectAssignment(item.dataset.assignmentId, true);
});

window.addEventListener("hashchange", () => {
  selectAssignment(getInitialAssignmentId(), false);
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.activeTab = tab.dataset.tab;
    elements.tabs.forEach((candidate) => candidate.classList.toggle("is-active", candidate === tab));
    renderTabPanel(getActiveAssignment());
  });
});

elements.resetCode.addEventListener("click", () => {
  const assignment = getActiveAssignment();
  elements.codeEditor.value = assignment.startingCode;
  delete state.progress.codeByAssignment[assignment.id];
  delete state.progress.statusByAssignment[assignment.id];
  saveProgress();
  renderAssignmentList();
  elements.resultSummary.textContent = "Skeleton restored.";
  elements.resultList.innerHTML = "";
});

elements.codeEditor.addEventListener("input", () => {
  const assignment = getActiveAssignment();
  state.progress.codeByAssignment[assignment.id] = elements.codeEditor.value;
  if (state.progress.statusByAssignment[assignment.id] === "passed") {
    state.progress.statusByAssignment[assignment.id] = "changed";
  }
  saveProgress();
  renderAssignmentList();
});

elements.runTests.addEventListener("click", () => {
  const assignment = getActiveAssignment();
  const result = evaluateSubmission(elements.codeEditor.value, assignment.tests, {
    mode: assignment.checkMode,
  });
  state.progress.statusByAssignment[assignment.id] = result.status === "passed" ? "passed" : "attempted";
  state.progress.codeByAssignment[assignment.id] = elements.codeEditor.value;
  saveProgress();
  renderAssignmentList();

  elements.resultSummary.textContent = `${result.passed}/${result.total} checks passed`;
  elements.resultList.innerHTML = result.results
    .map(
      (item) => `
        <div class="result-item is-${item.status}">
          <span>${item.status === "passed" ? "Pass" : "Fail"}</span>
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <p>${escapeHtml(item.message)}</p>
          </div>
        </div>
      `,
    )
    .join("");
});

renderAssignment();

/**
 * Reads the assignment id from the URL hash when it matches a real assignment.
 *
 * @returns {string} The assignment id to open first.
 */
function getInitialAssignmentId() {
  const idFromHash = window.location.hash.replace("#", "");
  return assignments.some((assignment) => assignment.id === idFromHash) ? idFromHash : assignments[0]?.id;
}

/**
 * Changes the active assignment and optionally updates the page URL.
 *
 * @param {string} assignmentId The assignment the student selected.
 * @param {boolean} updateUrl Whether the browser URL should point to this assignment.
 * @returns {void} Updates state and redraws the workspace.
 */
function selectAssignment(assignmentId, updateUrl) {
  if (!assignments.some((assignment) => assignment.id === assignmentId)) return;

  state.activeAssignmentId = assignmentId;
  state.activeTab = "instructions";
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === state.activeTab));

  if (updateUrl) {
    window.history.replaceState(null, "", `#${assignmentId}`);
  }

  renderAssignment();
}

/**
 * Gets a student's saved draft, or the starter code if no draft exists.
 *
 * @param {object} assignment The assignment currently being viewed.
 * @returns {string} Code to place in the editor.
 */
function getSavedCode(assignment) {
  return state.progress.codeByAssignment[assignment.id] || assignment.startingCode;
}

/**
 * Converts saved progress into a short label for the sidebar.
 *
 * @param {string} assignmentId The unique id for an assignment.
 * @returns {string} A plain progress label, like "Completed" or "Not started".
 */
function getAssignmentStatusLabel(assignmentId) {
  const status = state.progress.statusByAssignment[assignmentId];
  const hasDraft = Boolean(state.progress.codeByAssignment[assignmentId]);

  if (status === "passed") return "Completed";
  if (status === "attempted") return "Checks attempted";
  if (status === "changed") return "Draft changed";
  if (hasDraft) return "Draft saved";
  return "Not started";
}

/**
 * Groups all assignments by their programming language.
 *
 * @returns {Array<[string, object[]]>} Language names paired with their assignments.
 */
function getAssignmentsByLanguage() {
  return Object.entries(
    assignments.reduce((groups, assignment) => {
      groups[assignment.language] ||= [];
      groups[assignment.language].push(assignment);
      return groups;
    }, {}),
  );
}

/**
 * Reads saved drafts and check status from this browser.
 *
 * @returns {{codeByAssignment: object, statusByAssignment: object}} Saved student progress.
 */
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem("fakeacademy-progress-v1"));
    return {
      codeByAssignment: saved?.codeByAssignment || {},
      statusByAssignment: saved?.statusByAssignment || {},
    };
  } catch {
    return {
      codeByAssignment: {},
      statusByAssignment: {},
    };
  }
}

/**
 * Saves drafts and check status in this browser.
 *
 * @returns {void} Writes progress to localStorage.
 */
function saveProgress() {
  localStorage.setItem("fakeacademy-progress-v1", JSON.stringify(state.progress));
}

/**
 * Makes text safe to place inside HTML result cards.
 *
 * @param {*} value The text or value that will be shown on the page.
 * @returns {string} Text with unsafe HTML characters replaced.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
