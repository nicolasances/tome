---
name: generate-module-content
description: Generates the content of a Tome Language Learning Module, within a CEFR level.
---

# Generate Module Content

## Overview

Starting from a curriculum that provides the list of modules of the language course, generate content for the requested module.

## When to Use

- The user requests the creation of content for a **given module** in the curriculum.

**Trigger Phrases:**
- "Generate content for module A2-12"
- "Generate module A2-06"

## Prerequisites

- You have read `nicolasances/tome/docs/specs/language-learning/idea.md` - This document is **important** for you to understand the context and core concepts.
- You have read `nicolasances/tome/docs/specs/language-learning/default-modules.md` - This document is **important** for you to have an overview of the whole curriculum (course). 
- You **MUST** have been told which module to generate content for (e.g. A2-01). The module **must** be in the list of modules in `nicolasances/tome/docs/specs/language-learning/default-modules.md`.

## The Workflow

You will follow three phases. Do not advance to the next phase until the current one is validated.

```
GENERATE VOCABULARY ITEMS > GENERATE GRAMMAR CONCEPTS > GENERATE EXERCISES 
```

---

### Phase 1: Generate Vocabulary Items

- Generate 

---

### Phase 2: Generate Grammar Concepts

---

### Phase 3: Generate Exercises

--- 

In this phase you will: 

1. **Understand the idea.** You will: 
- Read and understand the idea documented in GitHub
- Analyze the code base, reading the relevant repos and files to understand the current state of the codebase and how the new feature fits in. 
- Identify gaps and ambiguities, unclear requirements, assumptions, and **ask clarifying questions** until you have a crystal-clear understanding of the problem, the proposed solution, and the assumptions. 

Always check-in with the user: 
- Whenever there are architectural decisions to be made
- Whenever there are multiple ways to implement the solution that are substantially different from each other
- Whenever you identify a new assumption
- Whenever you find ambiguous or unclear requirements

**Output**: Restate the idea in your own words, list the assumptions you're making and any choices that have been made.

Ask the user to confirm that your understanding is correct before proceeding to the next phase. This is a critical checkpoint to ensure alignment before any work gets done.

### Phase 2: Breakdown

Break down the proposed idea into a clear, structured list of **independent** subfeatures (tasks) that will be then used by a coding agent. 
Rules to follow when breaking down the feature into subfeatures (tasks): 
- **Single repo**. Each task should target a single repo (project). Tasks should not span multiple repositories.
- **Short**. Each task should be completable in a single focused session.
- **Explicit acceptance criteria**. Each task should have clear acceptance criteria that define what "done" looks like for that task.
- **Clear dependencies**. If a task depends on another task, that dependency should be explicitly stated. 

Each task should follow this template:

```markdown
# [Task Title]
[Short description of the task]. 
[Repo it belongs to].
[Link to the parent issue in the `nicolasances/toto` repo].

**Why**: [Brief explanation of why this task is necessary for the overall feature].

**What**: [Detailed description of what needs to be done in this task. Use checklists where possible, they are more readable].

## Implementation details
### Architectural decisions
- [Decision 1]
- [Decision 2]

### Technical Decisions and Design
- [Technical decision 1]
- [Technical decision 2]
- [Design choice 1]
- [Design choice 2]

## Acceptance Criteria
- [ ] [First acceptance criterion]
- [ ] [Second acceptance criterion]
- [ ] [Third acceptance criterion]

## Out of Scope
- [ ] [First out of scope item]
- [ ] [Second out of scope item]
```

Once you have a comprehensive list of changes, organize them into a coherent implementation plan. Identify dependencies (what needs to be built before what) and group related changes together.

Once that is done **ask the user to review the plan and tasks**. 
**Do not proceed** to the next phase until you have an explicit confirmation from the user that the plan looks good. This is a critical checkpoint to ensure alignment before any code gets written.

### Phase 3: GitHub Issue

For each task, create a corresponding GitHub issue in the **right repo**. Each task corresponds only to a single repo, so the issue should be generated on that repo. Each task should be a separate issue. 
The issue title should be a concise summary of the task, and the body should include:
- A detailed description of the task
- The acceptance criteria
- What is out of scope or left out of this task (to prevent scope creep)
- Any relevant links (design mockups, related issues, documentation)

Each GitHub issue: 
- **must** be tagged with the "task" label.
- **must** be assigned to the "Toto" project.
- **must** be linked to the original idea issue (the one you started from). The original idea issue should be the **parent** issue, and the task issues should be linked as **child** issues.
- **must** be created in the repo that the task corresponds to.

## Red Flags

- Starting anything without a clear, refined idea documented in a GitHub issue
- Writing any code
- Changing anything in any repo 