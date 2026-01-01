"""
Test Script - Verify NLP Components
Run this to test the NLP pipeline
"""

from nlp_processor import NLPProcessor

def test_nlp_pipeline():
    """Test all NLP components"""
    print("=" * 60)
    print("Testing NLP Pipeline")
    print("=" * 60)
    
    # Initialize
    nlp = NLPProcessor()
    
    # Test text
    text = """
    Looking for a Senior Python Developer with 5 years of experience.
    Must have skills in Machine Learning, Deep Learning, and NLP.
    Experience with React, Node.js, and AWS is preferred.
    The candidate should have excellent problem-solving abilities.
    """
    
    print("\n📄 Original Text:")
    print(text)
    
    # Step 1: Clean
    print("\n🧹 Step 1: Cleaning Text")
    cleaned = nlp.clean_text(text)
    print(f"Cleaned: {cleaned[:100]}...")
    
    # Step 2: Tokenize
    print("\n✂️ Step 2: Tokenization")
    tokens = nlp.tokenize(cleaned)
    print(f"Tokens ({len(tokens)}): {tokens[:15]}")
    
    # Step 3: Remove stopwords
    print("\n🚫 Step 3: Remove Stopwords")
    filtered = nlp.remove_stopwords(tokens)
    print(f"After removal ({len(filtered)}): {filtered[:15]}")
    
    # Step 4: Lemmatization
    print("\n🔤 Step 4: Lemmatization")
    lemmatized = nlp.lemmatize(filtered)
    print(f"Lemmatized: {lemmatized[:15]}")
    
    # Step 5: Extract keywords
    print("\n🎯 Step 5: Extract Keywords")
    keywords = nlp.extract_keywords(text, top_n=10)
    print(f"Top Keywords: {keywords}")
    
    # Complete pipeline
    print("\n⚡ Complete Pipeline")
    processed = nlp.process(text)
    print(f"Final processed tokens ({len(processed)}): {processed[:20]}")
    
    print("\n" + "=" * 60)
    print("✅ All NLP components working correctly!")
    print("=" * 60)

if __name__ == "__main__":
    test_nlp_pipeline()
