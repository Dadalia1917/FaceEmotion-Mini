#!/usr/bin/env python3
"""
查研阅色表情识别服务启动脚本
@description 便于部署和管理的服务启动脚本
@author 查研阅色开发团队
@version 1.0.0
"""

import os
import sys
import socket
import logging
from app import app, initialize_models

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_port_available(host, port):
    """检查端口是否可用"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((host, port))
        sock.close()
        return result != 0
    except Exception as e:
        logger.error(f"端口检查失败: {e}")
        return False

def get_local_ip():
    """获取本机IP地址"""
    try:
        # 连接到一个远程地址来获取本机IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return '127.0.0.1'

def main():
    """主启动函数"""
    
    # 服务器配置 - 自动获取IP
    local_ip = get_local_ip()
    SERVER_HOST = '0.0.0.0'  # 监听所有网络接口
    SERVER_PORT = 5000
    
    print("="*60)
    print("🎭 查研阅色人脸表情识别服务")
    print("="*60)
    
    # 显示网络信息
    print(f"📍 本机IP地址: {local_ip}")
    print(f"🌐 服务器监听: {SERVER_HOST}:{SERVER_PORT} (所有网络接口)")
    
    # 检查端口 - 检查本机IP的端口
    if not check_port_available(local_ip, SERVER_PORT):
        logger.error(f"❌ 端口 {SERVER_PORT} 已被占用，请检查或更换端口")
        sys.exit(1)
    
    # 检查模型文件
    model_files = [
        'model/yolov8n-face.pt',
        'model/expression_cls.pt'
    ]
    
    missing_models = []
    for model_file in model_files:
        if not os.path.exists(model_file):
            missing_models.append(model_file)
    
    if missing_models:
        logger.error("❌ 缺少模型文件:")
        for model in missing_models:
            logger.error(f"   - {model}")
        logger.error("请将模型文件放入 model/ 目录")
        sys.exit(1)
    
    print(f"✅ 模型文件检查完成")
    
    try:
        # 初始化模型
        print("🤖 正在加载AI模型...")
        initialize_models()
        print("✅ AI模型加载完成")
        
        # 显示API信息
        print("\n📡 API接口信息:")
        print(f"   表情识别: http://{local_ip}:{SERVER_PORT}/inference")
        print(f"   健康检查: http://{local_ip}:{SERVER_PORT}/health")
        
        print("\n📱 小程序配置:")
        print(f"   请将小程序中的SERVER_CONFIG.baseUrl设置为: http://{local_ip}:{SERVER_PORT}")
        print(f"   修改文件: pages/index/index.js")
        
        print("\n🚀 服务启动中...")
        print("   按 Ctrl+C 停止服务")
        print("="*60)
        
        # 启动Flask服务
        app.run(
            host=SERVER_HOST,
            port=SERVER_PORT,
            debug=False,
            threaded=True,
            use_reloader=False
        )
        
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
    except Exception as e:
        logger.error(f"❌ 服务启动失败: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
