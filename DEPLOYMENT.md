# Deployment Guide

## Backend Deployment (Render)

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `resume-parser-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### Step 3: Environment Variables
Add these in Render dashboard:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key

### Step 4: Deploy
Click "Create Web Service" and wait for deployment

Your API will be available at: `https://resume-parser-api.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to Frontend
```bash
cd frontend
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? (your account)
- Link to existing project? `N`
- Project name? `resume-parser`
- Directory? `./`
- Override settings? `N`

### Step 4: Add Environment Variables
In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)

### Step 5: Redeploy
```bash
vercel --prod
```

---

## Supabase Configuration

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for provisioning

### Step 2: Enable Auth Providers
1. Authentication → Providers
2. Enable Email
3. Enable Google (configure OAuth)

### Step 3: Get Credentials
1. Settings → API
2. Copy:
   - Project URL
   - anon/public key

### Step 4: Configure Redirect URLs
Add these URLs in Authentication → URL Configuration:
- `http://localhost:3000` (development)
- `https://your-vercel-app.vercel.app` (production)

---

## Testing Deployment

### Test Backend
```bash
curl https://your-render-url.onrender.com/
```

Should return:
```json
{
  "status": "active",
  "message": "Resume Parser API is running",
  "version": "1.0.0"
}
```

### Test Frontend
1. Visit your Vercel URL
2. Sign up with email
3. Try uploading a resume
4. Check matching results

---

## Troubleshooting

### Backend Issues
- Check Render logs: Dashboard → Logs
- Verify environment variables
- Ensure all dependencies in `requirements.txt`

### Frontend Issues
- Check Vercel deployment logs
- Verify environment variables
- Check browser console for errors

### CORS Issues
Update `main.py` CORS settings with your Vercel URL:
```python
allow_origins=["https://your-app.vercel.app"]
```

---

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Supabase project created
- [ ] Auth providers configured
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Redirect URLs added
- [ ] Tested end-to-end workflow
- [ ] README updated with live URLs

---

**Your app is now live! 🎉**
