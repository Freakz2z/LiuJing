#!/bin/bash

echo "正在停止所有服务..."

# 停止所有 node 和 npm 进程
pkill -f "node app.js" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "所有服务已停止"