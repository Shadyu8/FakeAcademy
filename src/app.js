import { assignments } from "./curriculum.js";
import { evaluateSubmission } from "./testEngine.js";

const state = {
  activeAssignmentId: assignments[0]?.id,
  activeTab: "instructions",
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
  elements.codeEditor.value = assignment.startingCode;
  elements.resultSummary.textContent = "Run the checks when your implementation is ready.";
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
  elements.codeEditor.value = getActiveAssignment().startingCode;
  elements.resultSummary.textContent = "Skeleton restored.";
  elements.resultList.innerHTML = "";
});

elements.runTests.addEventListener("click", () => {
  const result = evaluateSubmission(elements.codeEditor.value, getActiveAssignment().tests);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
