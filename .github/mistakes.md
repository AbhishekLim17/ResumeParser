# Project Mistakes Log

## Purpose
Track errors and lessons learned during development to avoid repetition.

---

## 2026-01-01 - Initial Project Setup

**Context:**
First NLP-based product development - Resume Parser application

**Lessons Learned:**

### 1. Git PATH Configuration
**Problem:**
- Git was installed but not accessible in PowerShell
- Commands failed with "command not recognized" error

**Solution:**
- Added Git to PATH via PowerShell profile
- Command: `$env:Path += ';C:\Program Files\Git\cmd'`

**Lesson:**
- Always verify tools are in system PATH after installation
- Create persistent PATH entries in PowerShell profile
- Test commands after installation

### 2. Project Structure Planning
**Success:**
- Started with clear architecture plan before coding
- Separated concerns (NLP, parsing, matching, API)
- Created modular, testable components

**Lesson:**
- Planning before coding leads to cleaner implementation
- Modular structure makes testing and debugging easier
- Clear separation of NLP concepts aids understanding

### 3. Simple is Better
**Success:**
- Kept code simple and focused on core concepts
- Avoided over-engineering
- Clear, educational implementation

**Lesson:**
- For academic projects, clarity > complexity
- Every NLP concept should be easily identifiable
- Simple code is easier to explain and demonstrate

---

**Related Files:**
- All project files
- .github/temp-todo.md (tracking)
- PROJECT_SUMMARY.md (documentation)
