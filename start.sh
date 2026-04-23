#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}      榴镜 Web 应用启动脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查并安装依赖函数
check_install() {
    local dir=$1
    local name=$2
    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}正在安装 $name 依赖...${NC}"
        cd "$dir" && npm install
        cd "$SCRIPT_DIR"
    fi
}

# 安装依赖
echo -e "${YELLOW}[1/3] 检查并安装依赖...${NC}"
check_install "server" "服务端"
check_install "client" "用户端"
check_install "admin" "管理后台"
echo -e "${GREEN}依赖检查完成${NC}"
echo ""

# 启动后端
echo -e "${YELLOW}[2/3] 启动后端服务 (端口 3000)...${NC}"
cd "$SCRIPT_DIR/server"
node app.js &
SERVER_PID=$!
echo -e "${GREEN}后端已启动 (PID: $SERVER_PID)${NC}"
echo ""

# 等待后端启动
sleep 2

# 启动用户端
echo -e "${YELLOW}[3/3] 启动用户端 (端口 5173)...${NC}"
cd "$SCRIPT_DIR/client"
npm run dev &
CLIENT_PID=$!
echo -e "${GREEN}用户端已启动 (PID: $CLIENT_PID)${NC}"
echo ""

# 启动管理后台
echo -e "${YELLOW}[3/3] 启动管理后台 (端口 5174)...${NC}"
cd "$SCRIPT_DIR/admin"
npm run dev &
ADMIN_PID=$!
echo -e "${GREEN}管理后台已启动 (PID: $ADMIN_PID)${NC}"
echo ""

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}所有服务已启动！${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "用户端:   ${BLUE}http://localhost:5173${NC}"
echo -e "管理后台: ${BLUE}http://localhost:5174${NC}"
echo -e "后端API:  ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "管理员账号: ${YELLOW}admin${NC}"
echo -e "管理员密码: ${YELLOW}CHANGE_ME${NC}"
echo ""
echo -e "按 Ctrl+C 停止所有服务"
echo ""

# 捕获 Ctrl+C 信号，停止所有进程
trap "echo '正在停止所有服务...'; kill $SERVER_PID $CLIENT_PID $ADMIN_PID 2>/dev/null; exit" SIGINT SIGTERM

# 保持脚本运行
wait