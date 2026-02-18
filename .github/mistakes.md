# Project Mistakes Log

## Purpose
Track errors and lessons learned during development to avoid repetition.

---

## 2026-02-18 - Incorrect Skill Extraction (Names, Locations, Contact Info as Skills)

**Problem:**
- Resume Library showing names, locations, and contact info as "skills"
- Example bad output: sarah, mitchell, francisco, email, phone, 555, professional, experience, summary, highly, skilled
- Only actual skills like javascript, node.js, postgresql were correct
- Poor user experience - meaningless "skills" displayed

**Root Cause:**
- `extract_skills()` in resume_parser.py used frequency-based approach
- Extracted top 30 most frequent words from entire resume text
- Added ANY word appearing 2+ times in the document
- Only filtered 15 basic stopwords (the, and, for, with, etc.)
- No validation that extracted words were actually technical skills
- Result: Names, job titles, locations, section headers all treated as "skills"

**Why This Happened:**
- Over-reliance on NLP frequency analysis without domain knowledge
- Assumed frequent words = important skills (wrong assumption)
- Insufficient stopword filtering
- No technical skills validation

**Solution:**
- Created `known_skills` database with 100+ actual technical terms:
  - Programming languages (python, java, javascript, typescript, etc.)
  - Frameworks (react, angular, django, flask, etc.)
  - Databases (mysql, postgresql, mongodb, etc.)
  - Cloud/DevOps (aws, azure, docker, kubernetes, etc.)
  - Tools (git, jira, postman, etc.)
- Added comprehensive stopwords list (150+ words):
  - Personal info (name, email, phone, address, com, gmail)
  - Resume sections (summary, experience, education, skills)
  - Generic words (professional, technical, work, working)
  - Locations (san, francisco, california, usa)
  - Job titles (senior, junior, manager, developer, engineer)
  - Action verbs (developed, built, created, designed)
  - Numbers and dates (year, months, one, two, three)
- Changed approach: Match text against known_skills database instead of frequency
- Extract technical patterns (Node.js, C++, TypeScript)
- Filter all non-skill words before returning results

**Lesson:**
- Frequency-based NLP is NOT suitable for skill extraction without validation
- Domain knowledge (known technical skills) is essential
- Always validate NLP output against known valid values
- Comprehensive stopword filtering is critical for resume parsing
- Test with real resumes to catch bad extractions early
- Skills extraction needs both NLP AND domain-specific knowledge
- Never assume high-frequency words are meaningful without context

**Related Files:**
- backend/resume_parser.py (lines 206-280)

**Testing:**
- Deploy to production
- Re-parse existing resumes OR upload new resume
- Verify only actual technical skills are displayed
- Expected: javascript, node.js, postgresql, aws, react, typescript, sql
- Expected: NO names, locations, contact info, section headers

---

## 2026-02-18 - Indefinite Loading on Resume Library, Match History, Analytics

**Problem:**
- Resume Library, Match History, and Analytics tabs stuck in loading state for ~60 seconds
- Users saw "Loading resumes..." spinner for over a minute
- Eventually would timeout but with poor user experience
- No clear feedback about what was happening

**Root Cause:**
- Backend deployed on Render free tier which has cold starts (30-60s sleep time)
- API fetch calls to `/api/resumes`, `/api/matches`, `/api/job-searches`, `/api/dashboard/stats` had NO timeout configuration
- Browser default timeout (60-90s) was being hit
- Error messages were generic and didn't explain cold start behavior
- Match endpoint had proper 90s timeout, but other endpoints didn't

**Solution:**
- Added 90-second timeout with AbortController to all three load functions:
  - `loadResumes()` - now has timeout + controller
  - `loadHistory()` - now has timeout + controller for both API calls
  - `loadStats()` - now has timeout + controller
- Improved error handling with specific messages:
  - AbortError: Explains cold start and suggests retry
  - Failed to fetch: Explains connection/startup issues
  - Other errors: Provides tip about cold starts
- Matched the pattern used in `handleMatch()` which already had proper timeout
- Users can now retry by simply clicking the tab again

**Lesson:**
- ALWAYS add timeouts to ALL API calls, not just some
- Render free tier cold starts must be accounted for in UX
- Error messages should explain WHY something failed and HOW to fix it
- Consistent timeout patterns across all fetch calls prevents missed cases
- Never assume backend will respond quickly - always handle async timeouts
- User experience: Show informative messages about platform limitations (cold starts)

**Related Files:**
- frontend/app/dashboard/page.tsx (lines 220-330)

---

## 2026-01-04 - Universal Testing & GitHub Deployment

**Problem:**
- ImportError when running universal tests (wrong function name)
- TypeError in matching tests (returned dict instead of score)

**Solution:**
- Updated test imports to use `ResumeParser` class instead of `parse_resume` function
- Fixed matcher API calls to extract `score` from returned dict
- Adjusted test thresholds for edge cases (50% vs >50%)

**Lesson:**
- Always verify API signatures before writing tests
- Check return types (dict vs primitive values)
- Use >= instead of > for boundary conditions

**Related Files:**
- test_universal.py

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

## 2026-01-08 - API Data Format Mismatch & TXT File Reading Issues

**Problem:**
- Frontend throwing `TypeError: N.map is not a function`
- Resume Library and Match History tabs showing errors
- TXT files not being read properly
- Application loading slowly
- Match Results tab had complex UI (user wanted old simple design)

**Root Cause:**
1. Backend APIs returning wrapped objects: `{ resumes: [...] }`, `{ job_searches: [...] }`, `{ matches: [...] }`
2. Frontend expecting direct arrays: `[...]`
3. TXT file extraction only trying UTF-8 encoding
4. Match Results UI was too complex
5. Database service required credentials, blocking basic functionality

**Solution:**
1. Modified backend API endpoints to return arrays directly:
   - `/api/resumes` - returns array instead of `{ resumes: [] }`
   - `/api/job-searches` - returns array instead of `{ job_searches: [] }`
   - `/api/matches` - returns array instead of `{ matches: [] }`
   
2. Enhanced TXT file reading with multiple encoding fallbacks:
   - UTF-8, UTF-16, Latin-1, CP1252, ISO-8859-1
   - Final fallback with errors='ignore'
   
3. Restored old, simpler Match Results UI design:
   - Removed two-column grid layout
   - Simplified to single-column cards
   - Added rank display
   - Made email/phone display conditional
   
4. Made database service optional:
   - Basic matching works without database
   - Database-dependent features return 503 error with clear message
   - Allows testing and development without Supabase credentials

**Lesson:**
- **Always check API response format** - Frontend and backend must agree on data structure
- **Test with real data** - Different encodings exist, handle them gracefully
- **Keep UIs simple** - Complex isn't always better, listen to user feedback
- **Make dependencies optional** - Core features should work without external services
- **Provide clear error messages** - Tell users why something isn't working

**Related Files:**
- backend/main.py (API endpoints, database init)
- backend/resume_parser.py (TXT extraction with encoding fallbacks)
- frontend/app/dashboard/page.tsx (Match Results UI)

---

**Related Files:**
- All project files
- .github/temp-todo.md (tracking)
- PROJECT_SUMMARY.md (documentation)
