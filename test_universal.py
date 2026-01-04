"""
Universal Resume Parser Test Suite
Tests parser with resumes from diverse industries and roles:
- Technology (Data Scientist)
- Marketing (Marketing Manager)
- Engineering (Mechanical Engineer)
- Healthcare (Registered Nurse)
- Finance (Financial Analyst)
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from resume_parser import ResumeParser
from nlp_processor import NLPProcessor
from matcher import ResumeMatcher


class UniversalTester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.test_dir = 'test-resumes'
        self.nlp = NLPProcessor()
        self.parser = ResumeParser(self.nlp)
        self.matcher = ResumeMatcher()
        
    def log_test(self, test_name, passed, details=""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"     {details}")
        
        if passed:
            self.passed += 1
        else:
            self.failed += 1
        
    def test_parse_resume(self, filename, expected_role, expected_skills):
        """Test parsing a single resume and verify key information"""
        print(f"\n{'='*70}")
        print(f"Testing: {filename}")
        print(f"{'='*70}")
        
        filepath = os.path.join(self.test_dir, filename)
        
        # Parse resume
        result = self.parser.parse(filepath)
        
        # Test 1: File parsed successfully
        self.log_test(
            f"Parse {filename}",
            result is not None,
            f"Result: {type(result)}"
        )
        
        if result is None:
            return False
        
        # Test 2: Email extracted
        has_email = result.get('email') is not None
        self.log_test(
            "Email extraction",
            has_email,
            f"Email: {result.get('email', 'None')}"
        )
        
        # Test 3: Phone extracted
        has_phone = result.get('phone') is not None
        self.log_test(
            "Phone extraction",
            has_phone,
            f"Phone: {result.get('phone', 'None')}"
        )
        
        # Test 4: Skills extracted
        skills = result.get('skills', [])
        has_skills = len(skills) > 0
        self.log_test(
            "Skills extraction",
            has_skills,
            f"Found {len(skills)} skills"
        )
        
        # Test 5: Expected skills found (at least 50% match)
        if expected_skills:
            found_count = sum(1 for skill in expected_skills if any(
                skill.lower() in s.lower() or s.lower() in skill.lower() 
                for s in skills
            ))
            match_rate = (found_count / len(expected_skills)) * 100
            self.log_test(
                f"Expected skills match",
                match_rate >= 50,
                f"Matched {found_count}/{len(expected_skills)} ({match_rate:.0f}%): {', '.join(expected_skills[:5])}"
            )
        
        # Test 6: Keywords extracted
        keywords = result.get('keywords', [])
        has_keywords = len(keywords) > 0
        self.log_test(
            "Keyword extraction",
            has_keywords,
            f"Found {len(keywords)} keywords: {', '.join(keywords[:10])}"
        )
        
        # Test 7: Experience detected (years)
        experience = result.get('experience', 'Not found')
        has_experience = experience != 'Not found'
        self.log_test(
            "Experience extraction",
            has_experience,
            f"Experience: {experience}"
        )
        
        return True
    
    def test_data_scientist(self):
        """Test Data Scientist resume"""
        expected_skills = ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'AWS', 'pandas']
        
        # Test TXT
        self.test_parse_resume(
            'emily_rodriguez_data_scientist.txt',
            'Data Scientist',
            expected_skills
        )
        
        # Test DOCX
        self.test_parse_resume(
            'emily_rodriguez_data_scientist.docx',
            'Data Scientist',
            expected_skills
        )
        
        # Test PDF
        self.test_parse_resume(
            'emily_rodriguez_data_scientist.pdf',
            'Data Scientist',
            expected_skills
        )
    
    def test_marketing_manager(self):
        """Test Marketing Manager resume"""
        expected_skills = ['SEO', 'Google Analytics', 'Social Media', 'HubSpot', 'Content Marketing']
        
        # Test TXT
        self.test_parse_resume(
            'david_thompson_marketing_manager.txt',
            'Marketing Manager',
            expected_skills
        )
        
        # Test DOCX
        self.test_parse_resume(
            'david_thompson_marketing_manager.docx',
            'Marketing Manager',
            expected_skills
        )
        
        # Test PDF
        self.test_parse_resume(
            'david_thompson_marketing_manager.pdf',
            'Marketing Manager',
            expected_skills
        )
    
    def test_mechanical_engineer(self):
        """Test Mechanical Engineer resume"""
        expected_skills = ['SolidWorks', 'AutoCAD', 'ANSYS', 'CAD', 'HVAC', 'FEA']
        
        # Test TXT
        self.test_parse_resume(
            'james_wilson_mechanical_engineer.txt',
            'Mechanical Engineer',
            expected_skills
        )
        
        # Test DOCX
        self.test_parse_resume(
            'james_wilson_mechanical_engineer.docx',
            'Mechanical Engineer',
            expected_skills
        )
        
        # Test PDF
        self.test_parse_resume(
            'james_wilson_mechanical_engineer.pdf',
            'Mechanical Engineer',
            expected_skills
        )
    
    def test_nurse(self):
        """Test Registered Nurse resume"""
        expected_skills = ['Emergency', 'Patient Care', 'ICU', 'BLS', 'ACLS', 'Medication']
        
        # Test TXT
        self.test_parse_resume(
            'sarah_johnson_nurse.txt',
            'Registered Nurse',
            expected_skills
        )
        
        # Test DOCX
        self.test_parse_resume(
            'sarah_johnson_nurse.docx',
            'Registered Nurse',
            expected_skills
        )
        
        # Test PDF
        self.test_parse_resume(
            'sarah_johnson_nurse.pdf',
            'Registered Nurse',
            expected_skills
        )
    
    def test_financial_analyst(self):
        """Test Financial Analyst resume"""
        expected_skills = ['Financial Modeling', 'Bloomberg', 'Excel', 'CFA', 'Valuation', 'Python']
        
        # Test TXT
        self.test_parse_resume(
            'robert_chen_financial_analyst.txt',
            'Financial Analyst',
            expected_skills
        )
        
        # Test DOCX
        self.test_parse_resume(
            'robert_chen_financial_analyst.docx',
            'Financial Analyst',
            expected_skills
        )
        
        # Test PDF
        self.test_parse_resume(
            'robert_chen_financial_analyst.pdf',
            'Financial Analyst',
            expected_skills
        )
    
    def test_cross_industry_matching(self):
        """Test matching resumes to job descriptions across industries"""
        print(f"\n{'='*70}")
        print("Cross-Industry Matching Tests")
        print(f"{'='*70}")
        
        # Test 1: Tech resume to tech job
        tech_resume = os.path.join(self.test_dir, 'emily_rodriguez_data_scientist.txt')
        tech_job_skills = ['Python', 'Machine Learning', 'TensorFlow']
        tech_result = self.parser.parse(tech_resume)
        tech_match = self.matcher.match(tech_result, tech_job_skills)
        
        self.log_test(
            "Tech resume → Tech job match",
            tech_match['score'] > 60,
            f"Match score: {tech_match['score']}%"
        )
        
        # Test 2: Healthcare resume to healthcare job
        nurse_resume = os.path.join(self.test_dir, 'sarah_johnson_nurse.txt')
        nurse_job_skills = ['ICU', 'ACLS', 'Emergency', 'Patient Care']
        nurse_result = self.parser.parse(nurse_resume)
        nurse_match = self.matcher.match(nurse_result, nurse_job_skills)
        
        self.log_test(
            "Healthcare resume → Healthcare job match",
            nurse_match['score'] >= 50,
            f"Match score: {nurse_match['score']}%"
        )
        
        # Test 3: Finance resume to finance job
        finance_resume = os.path.join(self.test_dir, 'robert_chen_financial_analyst.txt')
        finance_job_skills = ['CFA', 'Excel', 'Bloomberg', 'Financial Modeling']
        finance_result = self.parser.parse(finance_resume)
        finance_match = self.matcher.match(finance_result, finance_job_skills)
        
        self.log_test(
            "Finance resume → Finance job match",
            finance_match['score'] >= 50,
            f"Match score: {finance_match['score']}%"
        )
        
        # Test 4: Mismatch - Tech resume to nurse job (should be low)
        mismatch = self.matcher.match(tech_result, nurse_job_skills)
        
        self.log_test(
            "Mismatch detection (Tech → Healthcare)",
            mismatch['score'] < 30,
            f"Match score: {mismatch['score']}% (correctly low)"
        )
    
    def run_all_tests(self):
        """Run all universal tests"""
        print("\n" + "="*70)
        print("UNIVERSAL RESUME PARSER TEST SUITE")
        print("Testing diverse industries: Tech, Marketing, Engineering, Healthcare, Finance")
        print("="*70)
        
        # Test each industry
        print("\n🔬 Testing Data Scientist Resumes")
        self.test_data_scientist()
        
        print("\n📊 Testing Marketing Manager Resumes")
        self.test_marketing_manager()
        
        print("\n⚙️ Testing Mechanical Engineer Resumes")
        self.test_mechanical_engineer()
        
        print("\n⚕️ Testing Healthcare Nurse Resumes")
        self.test_nurse()
        
        print("\n💰 Testing Financial Analyst Resumes")
        self.test_financial_analyst()
        
        # Test cross-industry matching
        self.test_cross_industry_matching()
        
        # Final summary
        total = self.passed + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0
        
        print("\n" + "="*70)
        print("FINAL TEST RESULTS")
        print("="*70)
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"Pass Rate: {pass_rate:.1f}%")
        
        if self.failed == 0:
            print("\n🎉 ALL TESTS PASSED! Parser is universally compatible!")
            print("="*70)
            return True
        else:
            print(f"\n⚠️ {self.failed} tests failed. Review output above.")
            print("="*70)
            return False


if __name__ == "__main__":
    tester = UniversalTester()
    success = tester.run_all_tests()
    
    # Exit with proper code
    sys.exit(0 if success else 1)
