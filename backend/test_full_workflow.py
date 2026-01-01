"""
Full Workflow Test - Debug matching issues
"""

import sys
sys.path.append('.')

from nlp_processor import NLPProcessor
from resume_parser import ResumeParser
from job_analyzer import JobAnalyzer
from matcher import ResumeMatcher

# Initialize components
nlp = NLPProcessor()
parser = ResumeParser(nlp)
analyzer = JobAnalyzer(nlp)
matcher = ResumeMatcher()

print("=" * 60)
print("FULL WORKFLOW TEST")
print("=" * 60)

# Test 1: Parse sample resume
print("\n1. PARSING SAMPLE RESUME...")
resume_data = parser.parse("../sample_resume.txt")

print(f"\n📄 Extracted Skills: {resume_data.get('skills', [])}")
print(f"🔑 Extracted Keywords: {resume_data.get('keywords', [])}")
print(f"📧 Email: {resume_data.get('email', 'Not found')}")
print(f"📞 Phone: {resume_data.get('phone', 'Not found')}")
print(f"⏰ Experience: {resume_data.get('experience', 'Not found')}")

# Test 2: Analyze job description
print("\n" + "=" * 60)
print("2. ANALYZING JOB DESCRIPTION...")
job_desc = "Looking for a Senior Python Developer with 5+ years of experience. Must have expertise in Machine Learning, NLP, and FastAPI."

job_data = analyzer.analyze(job_desc)
print(f"\n💼 Required Skills: {job_data['skills']}")
print(f"🎯 Keywords: {job_data['keywords']}")
print(f"📋 Roles: {job_data['roles']}")
print(f"⏰ Required Experience: {job_data['experience']}")

# Test 3: Match resume against job
print("\n" + "=" * 60)
print("3. MATCHING RESUME TO JOB...")

required_skills = job_data['skills'] + job_data['keywords']
print(f"\n🎯 Total Required Skills: {required_skills}")

match_result = matcher.match(resume_data, required_skills)

print(f"\n📊 MATCH SCORE: {match_result['score']}%")
print(f"\n✅ Matched Skills ({len(match_result['matched_skills'])}):")
for skill in match_result['matched_skills']:
    print(f"  • {skill}")

print(f"\n❌ Missing Skills ({len(match_result['missing_skills'])}):")
for skill in match_result['missing_skills']:
    print(f"  • {skill}")

print(f"\n📝 Match Details:")
for detail in match_result['match_details']:
    print(f"  Required: '{detail['required']}' → Found: '{detail['found']}' (Similarity: {detail['similarity']})")

# Test 4: Test specific "python" matching
print("\n" + "=" * 60)
print("4. SPECIFIC PYTHON MATCHING TEST...")

all_resume_terms = resume_data.get('skills', []) + resume_data.get('keywords', [])
print(f"\nAll resume terms: {all_resume_terms}")

matched, best_match, similarity = matcher.fuzzy_match_skill('python', all_resume_terms)
print(f"\nLooking for 'python':")
print(f"  Matched: {matched}")
print(f"  Best Match: {best_match}")
print(f"  Similarity: {similarity}")
print(f"  Threshold: {matcher.threshold}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
