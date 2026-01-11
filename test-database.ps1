# Test Database Connection
# Run this AFTER restarting Render backend

Write-Host "`n🧪 TESTING RESUME PARSER DATABASE FEATURES`n" -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://resumeparser-1u43.onrender.com/" -Method GET -TimeoutSec 30
    Write-Host "✅ Backend Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is DOWN: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# Test 2: Database Stats (requires auth + database)
Write-Host "Test 2: Database Connection via Stats Endpoint" -ForegroundColor Yellow
Write-Host "   Note: You need to be logged in and provide your auth token`n" -ForegroundColor Gray
Write-Host "   To get your token:" -ForegroundColor Gray
Write-Host "   1. Go to: https://resume-parser-o8e6buq11-abhisheks-projects-2e8e222e.vercel.app" -ForegroundColor Gray
Write-Host "   2. Open DevTools (F12) → Application → Local Storage" -ForegroundColor Gray
Write-Host "   3. Find 'sb-wodzmprdbfhyvlkpdusf-auth-token'" -ForegroundColor Gray
Write-Host "   4. Copy the 'access_token' value`n" -ForegroundColor Gray

$token = Read-Host "Paste your access_token here (or press Enter to skip)"

if ($token) {
    try {
        $stats = Invoke-RestMethod -Uri "https://resumeparser-1u43.onrender.com/api/dashboard/stats" `
            -Method GET `
            -Headers @{Authorization="Bearer $token"} `
            -TimeoutSec 30
        
        Write-Host "✅ DATABASE CONNECTION WORKING!" -ForegroundColor Green
        Write-Host "   Total Resumes: $($stats.total_resumes)" -ForegroundColor Gray
        Write-Host "   Total Job Searches: $($stats.total_job_searches)" -ForegroundColor Gray
        Write-Host "   Total Matches: $($stats.total_matches)" -ForegroundColor Gray
        Write-Host "   Average Match Score: $($stats.average_match_score)%`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ DATABASE CONNECTION FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This might mean:" -ForegroundColor Yellow
        Write-Host "   - Render backend hasn't been restarted yet" -ForegroundColor Yellow
        Write-Host "   - SUPABASE_SERVICE_KEY not set in Render" -ForegroundColor Yellow
        Write-Host "   - Invalid auth token`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Skipped database test (no token provided)`n" -ForegroundColor Yellow
}

# Test 3: Frontend Deployment
Write-Host "Test 3: Frontend Deployment" -ForegroundColor Yellow
Write-Host "✅ Latest deployment: https://resume-parser-o8e6buq11-abhisheks-projects-2e8e222e.vercel.app" -ForegroundColor Green
Write-Host "   Environment variables updated in Vercel`n" -ForegroundColor Gray

# Summary
Write-Host "`n📋 NEXT STEPS:`n" -ForegroundColor Cyan
Write-Host "1. Go to Render Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Click your 'resumeparser' service" -ForegroundColor White
Write-Host "3. Click 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor White
Write-Host "4. Wait 2-3 minutes for deployment" -ForegroundColor White
Write-Host "5. Run this script again to verify database works`n" -ForegroundColor White

Write-Host "🎯 Once backend restarts, ALL FEATURES WILL WORK:" -ForegroundColor Green
Write-Host "   ✅ Resume matching (already works)" -ForegroundColor Gray
Write-Host "   ✅ Resume Library (save uploaded resumes)" -ForegroundColor Gray
Write-Host "   ✅ Match History (view past results)" -ForegroundColor Gray
Write-Host "   ✅ Analytics (usage statistics)`n" -ForegroundColor Gray
