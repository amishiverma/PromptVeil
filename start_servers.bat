@echo off
cd /d d:\PromptVeil\backend
start "" venv\Scripts\python.exe -m uvicorn main:app --port 8000
cd /d d:\PromptVeil\frontend
start "" npm run dev -- --port 5173
echo Servers started in separate windows.
