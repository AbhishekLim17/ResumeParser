# ⚡ Quick Deployment Guide

## 🎯 Deploy in 3 Steps

### Step 1: Deploy Backend to Render (5 minutes)

1. Visit https://render.com/ and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub: `AbhishekLim17/ResumeParser`
4. Settings:
   - **Name**: `resume-parser-backend`
   - **Region**: Oregon
   - **Branch**: main
   - **Build Command**: Auto-detected from `render.yaml`
   - **Start Command**: Auto-detected from `render.yaml`
5. Click **"Create Web Service"**
6. ⏳ Wait 5-10 minutes for build
7. 📋 **Copy your backend URL**: `https://resume-parser-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel (3 minutes)

1. Visit https://vercel.com/ and sign in
2. Click **"Add New"** → **"Project"**
3. Import: `AbhishekLim17/ResumeParser`
4. Settings:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

6. Click **"Deploy"**
7. ⏳ Wait 2-3 minutes
8. 🎉 **Your app is live!**: `https://resume-parser-xxx.vercel.app`

---

### Step 3: Update Backend CORS (1 minute)

1. Go to `backend/main.py`
2. Update line with your Vercel URL:
   ```python
   allow_origins=["https://your-vercel-app.vercel.app"]
   ```
3. Commit and push:
   ```bash
   git add backend/main.py
   git commit -m "Update CORS for production"
   git push origin main
   ```
4. Render will auto-redeploy in 2 minutes

---

## ✅ Test Your Deployment

1. Visit your Vercel URL
2. Click **"Quick Start"**
3. Enter keywords: `python, tester`
4. Upload a test resume
5. Click **"Match Resumes"**
6. ✨ Should see results with NLP matching!

---

## 🐛 Common Issues

### Backend sleeping (Render free tier)
- First request takes ~30 seconds
- Add loading message: "Waking up backend..."
- Normal behavior for free tier

### CORS errors
- Check frontend URL is exact in `allow_origins`
- No trailing slash
- Must include `https://`

### Environment variable errors
- All env vars must start with `NEXT_PUBLIC_`
- Re-deploy frontend after adding env vars

---

## 🚀 Auto-Deployments

Both platforms auto-deploy on git push:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

- **Render**: Rebuilds backend in ~5 min
- **Vercel**: Rebuilds frontend in ~2 min

---

## 📊 Monitoring

**Render Dashboard**: View logs, metrics, build status
**Vercel Dashboard**: View deployments, analytics, logs

**Free Tier Limits:**
- ✅ Render: 750 hours/month (plenty for demos)
- ✅ Vercel: 100GB bandwidth/month
- ⚠️ Backend sleeps after 15 min inactivity

---

## 🎓 Assignment Submission

Include these URLs in your report:
- **Live Demo**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.onrender.com`
- **GitHub Repo**: `https://github.com/AbhishekLim17/ResumeParser`

**Demonstrates:**
- ✅ Tokenization (NLTK word_tokenize)
- ✅ Lemmatization (WordNetLemmatizer)
- ✅ Levenshtein Distance (custom implementation)
- ✅ Pure NLP (no hardcoded skills)

---

## 🆘 Need Help?

1. Check deployment logs in dashboard
2. Verify environment variables
3. Test locally first: `npm run dev` (frontend), `uvicorn main:app` (backend)

**All set! 🎉**
