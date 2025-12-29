#!/bin/bash
ollama serve &
cd ~/Documents/tars-case/backend && source venv/bin/activate && uvicorn open_webui.main:app --host 0.0.0.0 --port 8080 &
sleep 5
cd ~/Documents/tars-case && npm run dev &
sleep 3
echo "STELLAR running at http://localhost:5173"
wait
