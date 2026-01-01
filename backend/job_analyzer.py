"""
Job Description Analyzer
Extracts skills, roles, and requirements from job descriptions
"""

import re
from typing import Dict, List
from nlp_processor import NLPProcessor


class JobAnalyzer:
    """
    Analyze job descriptions to extract requirements
    Uses NLP techniques to identify skills, roles, experience
    """
    
    def __init__(self, nlp_processor: NLPProcessor):
        """Initialize with NLP processor"""
        self.nlp = nlp_processor
        
        # Common job roles
        self.roles = {
            'developer', 'engineer', 'architect', 'manager', 'analyst',
            'scientist', 'designer', 'consultant', 'specialist', 'lead',
            'senior', 'junior', 'intern', 'director', 'coordinator'
        }
        
        # Common tech skills
        self.tech_skills = {
            'python', 'java', 'javascript', 'react', 'node', 'sql', 'mongodb',
            'machine learning', 'deep learning', 'nlp', 'data science',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'api', 'rest',
            'html', 'css', 'typescript', 'angular', 'vue', 'flask', 'django',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit', 'fastapi',
            'spring', 'hibernate', 'mysql', 'postgresql', 'redis', 'kafka'
        }
    
    def extract_roles(self, text: str) -> List[str]:
        """Extract job roles from description"""
        found_roles = []
        text_lower = text.lower()
        
        for role in self.roles:
            if role in text_lower:
                found_roles.append(role)
        
        return list(set(found_roles))
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract required skills from job description
        Uses NLP processing and pattern matching
        """
        found_skills = []
        text_lower = text.lower()
        
        # Check for tech skills
        for skill in self.tech_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        # Extract from "Skills:" section if present
        skills_section = re.search(
            r'(?:skills?|requirements?|qualifications?)[\s:]+([^\n]+)',
            text_lower,
            re.IGNORECASE
        )
        
        if skills_section:
            section_text = skills_section.group(1)
            # Extract skills from this section
            for skill in self.tech_skills:
                if skill in section_text:
                    found_skills.append(skill)
        
        return list(set(found_skills))
    
    def extract_experience(self, text: str) -> str:
        """
        Extract required years of experience
        Looks for patterns like "5 years experience", "3+ years"
        """
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience',
            r'(\d+)-(\d+)\s*(?:years?|yrs?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                if len(match.groups()) > 1:
                    return f"{match.group(1)}-{match.group(2)} years"
                return f"{match.group(1)} years"
        
        return "Not specified"
    
    def analyze(self, description: str) -> Dict:
        """
        Analyze job description and extract all requirements
        
        Args:
            description: Job description text
        
        Returns:
            Dictionary with:
            - roles: List of job roles mentioned
            - skills: List of required skills
            - experience: Required experience
            - keywords: Important keywords extracted
        """
        # Extract components
        roles = self.extract_roles(description)
        skills = self.extract_skills(description)
        experience = self.extract_experience(description)
        
        # Extract keywords using NLP and filter out common non-skill words
        all_keywords = self.nlp.extract_keywords(description, top_n=20)
        
        # Common words to exclude from keywords (but NOT testing/tester/developer)
        exclude_words = {
            'looking', 'must', 'year', 'years', 'required', 'need', 'seeking',
            'candidate', 'should', 'strong', 'excellent', 'good', 'work',
            'working', 'team', 'ability', 'knowledge', 'position', 'job'
        }
        
        # Filter keywords - keep only relevant ones
        keywords = [kw for kw in all_keywords if kw.lower() not in exclude_words]
        
        return {
            "roles": roles,
            "skills": skills,
            "experience": experience,
            "keywords": keywords[:10]  # Top 10 filtered keywords
        }
