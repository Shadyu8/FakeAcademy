# FakeAcademy

FakeAcademy is a portfolio project for project-based coding practice. Students pick a language-specific assignment, edit a starter file in the browser, run checks, and keep their progress locally between sessions.

The first version is intentionally small: it proves the core loop before adding accounts, backend grading, submissions, or larger Odin Project-style projects.

## Features

- Assignment sidebar grouped by Python, C++, and JavaScript
- A first shared Tic Tac Toe project across all three languages
- Project difficulty, time estimate, and progress state
- Instructions, file notes, and rubric tabs for each project
- Browser-based starter-code editor
- Behavioral checks for JavaScript submissions
- Static contract checks for Python and C++ submissions in the browser-only MVP
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
- Add backend runners for Python and C++ behavioral tests
- Add project pages with richer requirements and visual previews
- Store submissions with a backend API
