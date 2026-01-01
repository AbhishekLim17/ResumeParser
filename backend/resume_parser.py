"""
Resume Parser - Extract information from resumes
Supports: PDF, TXT, DOCX, and Images (JPG, PNG) with OCR
Uses NLP processing and pattern matching
"""

import re
import os
from typing import Dict, List
import PyPDF2
from docx import Document

try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: pytesseract or PIL not available. Image support disabled.")

from nlp_processor import NLPProcessor


class ResumeParser:
    """
    Parse resumes and extract structured information
    Supports: PDF, TXT, DOCX, JPG, PNG
    """
    
    def __init__(self, nlp_processor: NLPProcessor):
        """Initialize with NLP processor"""
        self.nlp = nlp_processor
        
        # Common tech skills (expanded list)
        self.common_skills = {
            'python', 'java', 'javascript', 'react', 'node', 'sql', 'mongodb',
            'machine learning', 'deep learning', 'nlp', 'data science',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'api', 'rest',
            'html', 'css', 'typescript', 'angular', 'vue', 'flask', 'django',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit', 'fastapi',
            'spring', 'hibernate', 'mysql', 'postgresql', 'redis', 'kafka',
            'spark', 'hadoop', 'jenkins', 'ci/cd', 'agile', 'scrum',
            # Testing skills
            'testing', 'tester', 'qa', 'quality assurance', 'automation',
            'selenium', 'junit', 'testng', 'pytest', 'jest', 'mocha',
            'manual testing', 'functional testing', 'regression testing',
            'integration testing', 'unit testing', 'smoke testing'
        }
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
        except Exception as e:
            print(f"PDF extraction error: {e}")
        return text
    
    def extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"TXT extraction error: {e}")
            return ""
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file including tables"""
        try:
            doc = Document(file_path)
            text = []
            
            # Extract from paragraphs
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text.append(paragraph.text)
            
            # Extract from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text.append(cell.text)
            
            extracted_text = '\n'.join(text)
            print(f"DOCX: Extracted {len(extracted_text)} characters from {len(doc.paragraphs)} paragraphs and {len(doc.tables)} tables")
            
            if not extracted_text:
                print("WARNING: No text extracted from DOCX file!")
                raise ValueError("Empty document - no text content found")
            
            return extracted_text
            
        except Exception as e:
            error_msg = f"DOCX extraction failed: {type(e).__name__}: {str(e)}"
            print(error_msg)
            raise ValueError(error_msg)
    
    def extract_text_from_image(self, file_path: str) -> str:
        """Extract text from image using OCR"""
        if not OCR_AVAILABLE:
            return "OCR not available. Install pytesseract and PIL."
        
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"OCR extraction error: {e}")
            return ""
    
    def extract_text(self, file_path: str) -> str:
        """Extract text based on file type"""
        file_lower = file_path.lower()
        
        if file_lower.endswith('.pdf'):
            return self.extract_text_from_pdf(file_path)
        elif file_lower.endswith('.txt'):
            return self.extract_text_from_txt(file_path)
        elif file_lower.endswith('.docx'):
            return self.extract_text_from_docx(file_path)
        elif file_lower.endswith('.doc'):
            # Old .doc format not supported - provide clear error
            raise ValueError(
                "Old .doc format (Word 97-2003) is not supported. "
                "Please save your resume as .docx format: "
                "Open file in Word → File → Save As → Word Document (*.docx)"
            )
        elif file_lower.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
            if not OCR_AVAILABLE:
                raise ValueError("Image support requires pytesseract installation")
            return self.extract_text_from_image(file_path)
        else:
            raise ValueError(
                f"Unsupported file format. "
                f"Supported formats: PDF, TXT, DOCX (not .doc), JPG, PNG"
            )
    
    def extract_email(self, text: str) -> str:
        """Extract email using regex"""
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(pattern, text)
        return match.group(0) if match else ""
    
    def extract_phone(self, text: str) -> str:
        """Extract phone number using regex"""
        patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\d{10}',
            r'\d{3}[-.\s]\d{3}[-.\s]\d{4}'
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return ""
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from resume text
        Uses NLP processing + pattern matching
        """
        # Process text with NLP
        processed_tokens = self.nlp.process(text.lower())
        
        # Find skills in processed text
        found_skills = []
        
        # Check for exact matches
        for skill in self.common_skills:
            skill_tokens = skill.split()
            if len(skill_tokens) == 1:
                if skill in processed_tokens:
                    found_skills.append(skill)
            else:
                # Multi-word skills
                if skill in text.lower():
                    found_skills.append(skill)
        
        return list(set(found_skills))
    
    def extract_experience(self, text: str) -> str:
        """
        Extract years of experience
        Looks for patterns like "5 years experience", "3+ years"
        """
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience',
            r'experience\s*:?\s*(\d+)\+?\s*(?:years?|yrs?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return f"{match.group(1)} years"
        
        return "Not specified"
    
    def parse(self, file_path: str) -> Dict:
        """
        Parse resume and extract all information
        
        Returns:
            Dictionary with extracted data:
            - email, phone, skills, experience, keywords
        """
        try:
            # Extract text
            text = self.extract_text(file_path)
            
            if not text:
                return {"error": "Could not extract text from file"}
            
            # Extract information
            email = self.extract_email(text)
            phone = self.extract_phone(text)
            skills = self.extract_skills(text)
            experience = self.extract_experience(text)
            
            # Extract keywords using NLP
            keywords = self.nlp.extract_keywords(text, top_n=15)
            
            return {
                "email": email,
                "phone": phone,
                "skills": skills,
                "experience": experience,
                "keywords": keywords,
                "raw_text": text[:500]  # First 500 chars for reference
            }
        
        except Exception as e:
            return {"error": str(e)}
