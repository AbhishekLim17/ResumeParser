# Quick Start Guide

## 🚀 Run the Application Locally

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
python main.py
```
✅ Backend running at: http://localhost:8000

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Frontend running at: http://localhost:3000

### Step 3: Test the Application
1. Visit http://localhost:3000
2. Sign up with your email
3. Enter a job description or keywords
4. Upload a resume (use `sample_resume.txt`)
5. Click "Match Resumes"
6. View ranked results!

---

## 📋 Configuration Status

✅ **Backend Environment**
- Supabase URL: Configured
- Supabase Key: Configured
- CORS: Enabled for localhost:3000

✅ **Frontend Environment**
- Supabase URL: Configured
- Supabase Anon Key: Configured
- API URL: http://localhost:8000

✅ **Supabase Project**
- Project Created
- Email Auth: Ready
- Google Auth: Optional (configure in Supabase dashboard)

---

## 🎯 Testing Workflow

1. **Sign Up/Login**
   - Use any email address
   - Check email for confirmation link

2. **Job Description Test**
   ```
   Looking for a Senior Python Developer with 5+ years of experience.
   Must have expertise in Machine Learning, NLP, and FastAPI.
   Experience with React and AWS is preferred.
   ```

3. **Upload Resume**
   - Use `sample_resume.txt` from project root
   - Or create your own test resume

4. **Check Results**
   - See match percentage
   - View matched skills
   - See candidate ranking

---

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt

# Check if port 8000 is free
netstat -ano | findstr :8000
```

### Frontend Won't Start
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### Auth Not Working
- Check Supabase credentials in `.env` files
- Verify email confirmation link in inbox
- Enable Email provider in Supabase dashboard

---

## 📊 What to Expect

**Processing Time:**
- Resume parsing: ~0.5-1 second per file
- Matching: Near-instant
- Results: Ranked by match score

**Match Score Examples:**
- 80-100%: Excellent match
- 60-79%: Good match
- 40-59%: Moderate match
- 0-39%: Poor match

---

**Everything is configured and ready to run! 🎉**
