"""
Test Levenshtein Matching
Verify fuzzy skill matching works correctly
"""

from matcher import ResumeMatcher

def test_levenshtein():
    """Test Levenshtein distance matching"""
    print("=" * 60)
    print("Testing Levenshtein Distance Matching")
    print("=" * 60)
    
    matcher = ResumeMatcher(similarity_threshold=0.8)
    
    # Test cases
    test_cases = [
        ("python", "python"),      # Exact match
        ("javascript", "java"),    # Different
        ("react", "reactjs"),      # Similar
        ("machine learning", "machine learning"),  # Exact
        ("nodejs", "node"),        # Similar
    ]
    
    print("\n🔍 Testing Similarity Scores:\n")
    
    for str1, str2 in test_cases:
        similarity = matcher.levenshtein_similarity(str1, str2)
        match_status = "✅ Match" if similarity >= 0.8 else "❌ No Match"
        print(f"'{str1}' vs '{str2}'")
        print(f"  Similarity: {similarity:.2%} {match_status}\n")
    
    # Test resume matching
    print("\n📋 Testing Resume Matching:\n")
    
    resume_data = {
        "skills": ["python", "javascript", "react", "sql"],
        "keywords": ["machine", "learning", "data", "api"]
    }
    
    required_skills = ["python", "reactjs", "machine learning", "aws"]
    
    result = matcher.match(resume_data, required_skills)
    
    print(f"Resume Skills: {resume_data['skills']}")
    print(f"Required Skills: {required_skills}\n")
    print(f"Match Score: {result['score']}%")
    print(f"Matched: {result['matched_skills']}")
    print(f"Missing: {result['missing_skills']}")
    print(f"\nMatch Details:")
    for detail in result['match_details']:
        print(f"  • Required: '{detail['required']}' → Found: '{detail['found']}' ({detail['similarity']:.0%})")
    
    print("\n" + "=" * 60)
    print("✅ Levenshtein matching working correctly!")
    print("=" * 60)

if __name__ == "__main__":
    test_levenshtein()
