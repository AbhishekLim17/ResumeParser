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

## 2026-01-01 - Resume Matching Issue & File Format Support

**Problem:**
- User reported "python in document but no match found"
- Job analyzer extracted non-skill keywords ("looking", "must", "year")
- Only PDF and TXT files supported
- Backend server not restarting properly (port 8000 already in use)

**Root Cause Analysis:**
1. Job analyzer's `extract_keywords()` was extracting ALL keywords without filtering
2. Non-skill words like "looking", "must", "year" being treated as required skills
3. This inflated the denominator in match percentage calculation
4. Match score: 13 matched out of 17 total = 76.47% (should be 92.86%)
5. Limited file format support (no DOCX, images)

**Solution:**
1. Added exclude_words filter in job_analyzer.py:
   - Filters out: looking, must, year, years, required, need, seeking, candidate, should, strong, excellent, good, work, working, team, ability, knowledge, position, job
   - Applied after NLP keyword extraction
   - Reduced false required skills

2. Lowered similarity threshold matcher.py:
   - Changed from 0.8 to 0.75 for better fuzzy matching
   - Allows slight variations in skill names

3. Added comprehensive file format support:
   - DOCX: Using python-docx library
   - Images (JPG, PNG): Using pytesseract OCR + Pillow
   - Enhanced PDF and TXT parsing
   - Updated UI to accept all formats

4. Backend restart fix:
   - Killed existing Python processes: `Get-Process | Where-Object {$_.ProcessName -eq "python"} | Stop-Process -Force`
   - Started fresh server to apply code changes

**Test Results:**
- Before fix: 76.47% match score
- After fix: 92.86% match score  
- Python detection: 100% similarity ✅
- All NLP concepts working correctly ✅

**Lesson:**
- **Keyword filtering is critical** - Not all extracted keywords are relevant skills
- **Lower threshold can help** - 0.75-0.8 is sweet spot for fuzzy matching
- **Test the full pipeline** - Backend tests passed but browser didn't work because server wasn't restarted
- **Multiple file formats** - Real-world resumes come in various formats (PDF, DOCX, images)
- **Kill old processes** - Always ensure old servers are stopped before starting new ones

**Related Files:**
- backend/job_analyzer.py (lines 98-130)
- backend/matcher.py (line 40)
- backend/resume_parser.py (added DOCX and OCR support)
- frontend/app/dashboard/page.tsx (updated file accept types)

---

**Related Files:**
- All project files
- .github/temp-todo.md (tracking)
- PROJECT_SUMMARY.md (documentation)
