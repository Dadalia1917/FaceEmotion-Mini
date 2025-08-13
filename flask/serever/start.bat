@echo off
chcp 65001 >nul
title 查研阅色表情识别服务

echo.
echo ===============================================
echo 🎭 查研阅色人脸表情识别服务启动工具
echo ===============================================
echo.

echo 📍 正在检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 未安装或未添加到PATH
    echo    请安装Python 3.8+并添加到系统PATH
    pause
    exit /b 1
)

echo ✅ Python 环境正常

echo.
echo 📍 正在获取网络配置...
python get_ip.py

echo.
echo ===============================================
echo 🚀 启动服务器...
echo ===============================================
echo.

python app.py

echo.
echo ===============================================
echo 👋 服务已停止
echo ===============================================
pause
