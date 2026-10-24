@echo off
title RUNAR local server (7788)
cd /d "%~dp0"
echo ============================================================
echo  RUNAR labs:  http://localhost:7788/v2/tree-lab-index.html
echo  Screenshot helper on 7799 . state helper on 7798 (Claude consultation).
echo  Leave this window OPEN. Close it to stop the server.
echo ============================================================
start "RUNAR savepng helper (7799)" cmd /c node "%~dp0_savepng.js"
start "RUNAR savestate helper (7798)" cmd /c node "%~dp0_savestate.js"
python -m http.server 7788
