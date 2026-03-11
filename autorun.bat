@echo off
title Triumph and Tragedy I - Pearl and Trident
echo [Triumph and Tragedy] Auto-run is starting ..
:main
node --max-old-space-size=8192 main.js
timeout /t 30
echo [Triumph and Tragedy] Crashed! Restarting ..
goto main
