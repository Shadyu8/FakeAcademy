import { assignments } from "./curriculum.js";
import { evaluateSubmission } from "./testEngine.js";

const state = {
  activeAssignmentId: assignments[0]?.id,
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

function getActiveAssignment() {
  return assignments.find((assignment) => assignment.id === state.activeAssignmentId) || assignments[0];
}

function renderAssignmentList() {
  elements.trackCount.textContent = `${assignments.length} projects`;
  elements.assignmentList.innerHTML = assignments
    .map(
      (assignment, index) => `
        <button class="assignment-item ${assignment.id === state.activeAssignmentId ? "is-active" : ""}" type="button" data-assignment-id="${assignment.id}">
          <span class="assignment-index">${String(index + 1).padStart(2, "0")}</span>
          <span>
            <strong>${assignment.title}</strong>
            <small>${assignment.level} · ${assignment.duration}</small>
            <em class="assignment-status">${getAssignmentStatusLabel(assignment.id)}</em>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderMeta(assignment) {
  elements.projectMeta.innerHTML = [
    { label: "Time", value: assignment.duration },
    { label: "Concepts", value: assignment.concepts.join(", ") },
    { label: "File", value: assignment.files[0] },
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

  state.activeAssignmentId = item.dataset.assignmentId;
  state.activeTab = "instructions";
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === state.activeTab));
  renderAssignment();
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
  const result = evaluateSubmission(elements.codeEditor.value, assignment.tests);
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

function getSavedCode(assignment) {
  return state.progress.codeByAssignment[assignment.id] || assignment.startingCode;
}

function getAssignmentStatusLabel(assignmentId) {
  const status = state.progress.statusByAssignment[assignmentId];
  const hasDraft = Boolean(state.progress.codeByAssignment[assignmentId]);

  if (status === "passed") return "Completed";
  if (status === "attempted") return "Checks attempted";
  if (status === "changed") return "Draft changed";
  if (hasDraft) return "Draft saved";
  return "Not started";
}

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

function saveProgress() {
  localStorage.setItem("fakeacademy-progress-v1", JSON.stringify(state.progress));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
