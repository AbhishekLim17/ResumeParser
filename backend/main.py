"""
Resume Parser Backend - FastAPI Application
Simple and clean implementation for NLP-based resume screening
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from dotenv import load_dotenv

from nlp_processor import NLPProcessor
from resume_parser import ResumeParser
from job_analyzer import JobAnalyzer
from matcher import ResumeMatcher

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Resume Parser API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize NLP components
nlp_processor = NLPProcessor()
resume_parser = ResumeParser(nlp_processor)
job_analyzer = JobAnalyzer(nlp_processor)
matcher = ResumeMatcher()


# Pydantic models
class JobInput(BaseModel):
    description: Optional[str] = None
    keywords: Optional[List[str]] = None


class MatchResponse(BaseModel):
    filename: str
    score: float
    matched_skills: List[str]
    extracted_data: dict


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "message": "Resume Parser API is running",
        "version": "1.0.0"
    }


@app.post("/api/analyze-job")
async def analyze_job(job_input: JobInput):
    """
    Analyze job description and extract skills, roles, experience
    Uses NLP techniques: tokenization, lemmatization, stopword removal
    """
    try:
        if job_input.description:
            analysis = job_analyzer.analyze(job_input.description)
            return {
                "success": True,
                "extracted_skills": analysis['skills'],
                "roles": analysis['roles'],
                "experience": analysis['experience'],
                "keywords": analysis['keywords']
            }
        elif job_input.keywords:
            return {
                "success": True,
                "extracted_skills": [],
                "roles": [],
                "experience": None,
                "keywords": job_input.keywords
            }
        else:
            raise HTTPException(400, "Provide either description or keywords")
    
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@app.post("/api/parse-resumes")
async def parse_resumes(files: List[UploadFile] = File(...)):
    """
    Parse uploaded resumes and extract information
    Supports PDF and TXT formats
    """
    results = []
    
    for file in files:
        try:
            # Save temporarily
            temp_path = f"temp_{file.filename}"
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            
            # Parse resume
            parsed_data = resume_parser.parse(temp_path)
            results.append({
                "filename": file.filename,
                "success": True,
                "data": parsed_data
            })
            
            # Cleanup
            os.remove(temp_path)
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {"results": results}


@app.post("/api/match", response_model=List[MatchResponse])
async def match_resumes(
    job_input: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Match resumes against job requirements
    Returns ranked candidates with match scores
    Uses Levenshtein distance for skill matching
    """
    try:
        # Parse job_input JSON
        job_data = json.loads(job_input)
        
        # Analyze job
        if job_data.get('description'):
            job_analysis = job_analyzer.analyze(job_data['description'])
            required_skills = job_analysis['skills'] + job_analysis['keywords']
        else:
            required_skills = job_data.get('keywords', [])
        
        # Parse all resumes
        candidates = []
        for file in files:
            temp_path = f"temp_{file.filename}"
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            
            print(f"\n{'='*60}")
            print(f"Processing file: {file.filename}")
            print(f"File size: {len(content)} bytes")
            print(f"{'='*60}")
            
            # Parse and match
            try:
                resume_data = resume_parser.parse(temp_path)
                print(f"Resume data: {resume_data}")
                
                # Check if parsing was successful
                if 'error' in resume_data:
                    print(f"ERROR: {resume_data['error']}")
                    candidates.append({
                        "filename": file.filename,
                        "score": 0.0,
                        "matched_skills": [],
                        "extracted_data": {
                            "error": resume_data['error'],
                            "skills": [],
                            "keywords": []
                        }
                    })
                    continue
                
                match_result = matcher.match(resume_data, required_skills)
                print(f"Match result: {match_result}")
                
                candidates.append({
                    "filename": file.filename,
                    "score": match_result['score'],
                    "matched_skills": match_result['matched_skills'],
                    "extracted_data": resume_data
                })
            except Exception as e:
                error_msg = str(e)
                print(f"ERROR processing {file.filename}: {error_msg}")
                candidates.append({
                    "filename": file.filename,
                    "score": 0.0,
                    "matched_skills": [],
                    "extracted_data": {
                        "error": error_msg,
                        "skills": [],
                        "keywords": []
                    }
                })
            
            os.remove(temp_path)
        
        # Sort by score (highest first)
        candidates.sort(key=lambda x: x['score'], reverse=True)
        
        return candidates
    
    except Exception as e:
        raise HTTPException(500, f"Matching failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
