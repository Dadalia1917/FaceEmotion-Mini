#!/usr/bin/env python3
"""
获取本机IP地址工具
@description 帮助用户快速获取本机IP地址用于配置小程序
"""

import socket
import platform

def get_all_ips():
    """获取所有网络接口的IP地址"""
    hostname = socket.gethostname()
    local_ips = []
    
    try:
        # 获取所有IP地址
        for info in socket.getaddrinfo(hostname, None):
            ip = info[4][0]
            if ip not in local_ips and not ip.startswith('127.'):
                local_ips.append(ip)
    except Exception:
        pass
    
    return local_ips

def get_primary_ip():
    """获取主要的IP地址"""
    try:
        # 通过连接外部地址获取本机对外IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        primary_ip = s.getsockname()[0]
        s.close()
        return primary_ip
    except Exception:
        return '127.0.0.1'

def main():
    print("="*50)
    print("🌐 网络配置信息")
    print("="*50)
    
    # 显示系统信息
    print(f"💻 操作系统: {platform.system()} {platform.release()}")
    print(f"🖥️  主机名: {socket.gethostname()}")
    
    # 获取主要IP
    primary_ip = get_primary_ip()
    print(f"📍 主要IP地址: {primary_ip}")
    
    # 获取所有IP
    all_ips = get_all_ips()
    if all_ips:
        print(f"🌐 所有IP地址:")
        for i, ip in enumerate(all_ips, 1):
            marker = " ⭐ (推荐)" if ip == primary_ip else ""
            print(f"   {i}. {ip}{marker}")
    
    print("\n" + "="*50)
    print("📱 小程序配置")
    print("="*50)
    print(f"请将以下配置复制到小程序中:")
    print()
    print("📂 文件: pages/index/index.js")
    print("🔧 修改SERVER_CONFIG:")
    print()
    print("const SERVER_CONFIG = {")
    print(f"  baseUrl: 'http://{primary_ip}:5000',")
    print("  endpoints: {")
    print("    inference: '/inference'")
    print("  },")
    print("  timeout: 30000")
    print("}")
    print()
    print("="*50)
    print("✅ 复制上述配置到小程序即可使用")

if __name__ == '__main__':
    main()
