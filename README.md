# FakeAcademy

FakeAcademy is a portfolio project for project-based coding practice. Students pick an assignment, edit a starter file in the browser, run automated checks, and keep their progress locally between sessions.

The first version is intentionally small: it proves the core loop before adding accounts, backend grading, submissions, or larger Odin Project-style projects.

## Features

- Assignment sidebar with project difficulty, time estimate, and progress state
- Instructions, file notes, and rubric tabs for each project
- Browser-based starter-code editor
- Automated checks for CommonJS-style student submissions
- Local draft persistence with completion status
- Dependency-free local server and Node test suite

## Run Locally

```bash
npm start
```

Open `http://localhost:4173`.

## Test

```bash
npm test
```

## Roadmap

- Add multi-file assignments and a file tree
- Run submissions in a Web Worker sandbox
- Add project pages with richer requirements and visual previews
- Store submissions with a backend API
- Add teacher-authored test suites and hidden checks
