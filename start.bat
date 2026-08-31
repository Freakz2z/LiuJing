@echo off
chcp 65001 > nul
echo ======================================
echo       榴镜 Web 应用启动脚本
echo ======================================
echo.

cd /d "%~dp0"

echo [1/3] 检查并安装依赖...
if not exist "server\node_modules" (
    echo 正在安装服务端依赖...
    cd server && call npm install && cd ..
)
if not exist "client\node_modules" (
    echo 正在安装用户端依赖...
    cd client && call npm install && cd ..
)
if not exist "admin\node_modules" (
    echo 正在安装管理后台依赖...
    cd admin && call npm install && cd ..
)
echo 依赖检查完成
echo.

echo [2/3] 启动后端服务 (端口 3000)...
cd server
start "Liujing Server" cmd /k "node app.js"
cd ..

timeout /t 2 /nobreak > nul

echo [3/3] 启动用户端和管理后台...
cd client
start "Liujing Client" cmd /k "npm run dev"
cd ..

cd admin
start "Liujing Admin" cmd /k "npm run dev"
cd ..

echo.
echo ======================================
echo 所有服务已启动！
echo ======================================
echo.
echo 用户端:   http://localhost:5173
echo 管理后台: http://localhost:5174
echo 后端API:  http://localhost:3000
echo.
echo 管理员账号: 请使用数据库中自行设置的账号
echo 管理员密码: 不会在启动脚本中提供默认值
echo.
echo 关闭此窗口不会停止服务
echo 如需停止，请运行 stop.bat 或手动结束进程
pause
