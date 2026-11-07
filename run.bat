@echo off
echo ======================================================================
echo JAN SETU - Citizen Application Readiness & Accountability Platform
echo Karnataka GovTech Solution (INNOVEX Season 02)
echo ======================================================================

echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "JAN SETU Backend (FastAPI)" cmd /k ".\venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload"

echo [2/2] Starting Vite React Frontend on http://127.0.0.1:5173 ...
cd frontend
start "JAN SETU Frontend (Vite)" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers are launching!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Portal:  http://127.0.0.1:5173
echo ======================================================================
