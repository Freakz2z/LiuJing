@echo off
chcp 65001 > nul
echo 正在停止所有服务...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul
echo 所有服务已停止
pause