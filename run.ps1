# JAN SETU - Launcher Script for Windows PowerShell
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "JAN SETU - Citizen Application Readiness & Accountability Platform" -ForegroundColor Green
Write-Host "Karnataka GovTech Solution (INNOVEX Season 02)" -ForegroundColor Cyan
Write-Host "======================================================================"

Write-Host "`n[1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload"

Write-Host "[2/2] Starting React Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "`nJAN SETU is live!" -ForegroundColor Green
Write-Host "  - Frontend Portal: http://127.0.0.1:5173"
Write-Host "  - Backend API Docs: http://127.0.0.1:8000/docs"
