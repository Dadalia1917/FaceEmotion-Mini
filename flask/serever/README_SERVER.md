# 🖥️ 查研阅色表情识别服务端

## 📋 服务说明

本服务提供基于深度学习的人脸表情识别API，支持7种基本表情的准确识别。

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）

```bash
cd flask/serever
python start_server.py
```

启动脚本会自动：
- ✅ 检查端口可用性
- ✅ 验证模型文件
- ✅ 显示网络配置信息
- ✅ 提供详细的启动日志

### 方法二：直接运行

```bash
cd flask/serever
python app.py
```

## 🔧 配置说明

### 服务器配置

服务器已配置为固定IP地址，便于小程序调用：

- **IP地址**: `192.168.1.3`
- **端口**: `5000`
- **协议**: `HTTP`

### 小程序配置

确保小程序中的服务器配置正确：

```javascript
// pages/index/index.js
const SERVER_CONFIG = {
  baseUrl: 'http://192.168.1.3:5000',  // ✅ 已配置固定IP
  endpoints: {
    inference: '/inference'
  },
  timeout: 30000
}
```

## 📡 API接口

### 1. 表情识别

**URL**: `POST /inference`

**请求示例**:
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**响应示例**:
```json
{
  "success": true,
  "faces": [
    {
      "box": [x1, y1, x2, y2],
      "expression": "Happy",
      "confidence": 0.95
    }
  ],
  "total_faces": 1,
  "processing_time": 0.35,
  "timestamp": "2024-12-19T..."
}
```

### 2. 健康检查

**URL**: `GET /health`

**响应示例**:
```json
{
  "status": "healthy",
  "service": "FaceEmotion API",
  "version": "1.0.0",
  "timestamp": "2024-12-19T..."
}
```

## 🗂️ 文件结构

```
flask/serever/
├── app.py              # Flask主应用
├── start_server.py     # 启动脚本（推荐使用）
├── Config.py           # 配置文件
├── config.ini         # 服务器配置
├── detect_tools.py    # 检测工具
├── requirements.txt   # 依赖包
├── model/            # AI模型目录
│   ├── yolov8n-face.pt
│   └── expression_cls.pt
└── Font/             # 字体文件
    └── platech.ttf
```

## 🔧 故障排除

### 1. 端口占用
```bash
# 查看端口占用
netstat -ano | findstr :5000

# Windows杀死进程
taskkill /PID <进程ID> /F

# Linux/Mac杀死进程
kill -9 <进程ID>
```

### 2. 模型文件缺失
```bash
# 确保以下文件存在
model/yolov8n-face.pt      # 人脸检测模型
model/expression_cls.pt    # 表情分类模型
```

### 3. IP地址配置
```python
# 如需修改IP地址，编辑 app.py
SERVER_HOST = '你的IP地址'  # 修改为实际IP
```

### 4. 依赖安装问题
```bash
# 升级pip
python -m pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt

# 如果安装失败，尝试清华源
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
```

## 📊 性能监控

### 服务状态检查
```bash
# 检查服务是否运行
curl http://192.168.1.3:5000/health

# 测试表情识别API
curl -X POST http://192.168.1.3:5000/inference \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'
```

### 日志监控

服务启动后会在控制台显示详细日志：
- 请求处理日志
- 错误信息
- 性能统计

## 🔒 安全注意事项

1. **生产环境部署**
   - 不要在生产环境使用Flask内置服务器
   - 推荐使用Gunicorn + Nginx

2. **网络安全**
   - 配置防火墙规则
   - 使用HTTPS协议（生产环境）

3. **文件权限**
   - 确保模型文件只读权限
   - 限制上传文件大小

## 🆘 技术支持

如果遇到问题，请检查：

1. ✅ Python版本 (3.8+)
2. ✅ 依赖包安装完整
3. ✅ 模型文件存在
4. ✅ 端口未被占用
5. ✅ 网络连接正常

---

*最后更新：2024-12-19*
