# FaceEmotion Mini - "查研阅色"人脸表情识别小程序

<div align="center">

![Logo](images/smile.jpg)

**一款基于深度学习的人脸表情识别微信小程序**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![WeChat](https://img.shields.io/badge/platform-WeChat_Mini_Program-brightgreen.svg)](https://developers.weixin.qq.com/miniprogram/dev/)

[功能特性](#功能特性) • [技术架构](#技术架构) • [快速开始](#快速开始) • [项目结构](#项目结构) • [部署说明](#部署说明)

</div>

## 📋 项目简介

"查研阅色"是一款创新的人脸表情识别微信小程序，采用先进的深度学习技术，能够实时识别和分析人脸表情，为用户提供便捷的表情分析服务。

### ✨ 功能特性

- 🎯 **实时表情识别** - 支持7种基本表情的准确识别
- 📱 **多媒体支持** - 支持图片拍摄、相册选择和视频分析
- 🤖 **AI智能分析** - 基于YOLO和深度学习模型的高精度识别
- 🎨 **现代化UI** - 简洁美观的用户界面设计
- 📊 **结果可视化** - 直观的检测框和表情标注显示
- 💾 **数据统计** - 用户使用数据统计和历史记录

### 🎭 支持的表情类型

| 表情 | 英文 | 图标 | 描述 |
|------|------|------|------|
| 中性 | Neutral | 😐 | 面无表情的平静状态 |
| 开心 | Happy | 😊 | 愉悦、高兴的表情 |
| 悲伤 | Sad | 😢 | 沮丧、难过的表情 |
| 惊讶 | Surprised | 😲 | 意外、震惊的表情 |
| 生气 | Angry | 😠 | 愤怒、不满的表情 |
| 害怕 | Fearful | 😨 | 恐惧、担心的表情 |
| 厌恶 | Disgusted | 🤢 | 反感、讨厌的表情 |

## 🏗️ 技术架构

### 前端架构
- **框架**: 微信小程序原生框架
- **UI组件**: ColorUI组件库
- **开发语言**: JavaScript + WXML + WXSS
- **状态管理**: 页面级状态管理

### 后端架构
- **Web框架**: Flask (Python)
- **AI模型**: YOLOv8 + 自定义表情分类器
- **图像处理**: OpenCV + NumPy
- **API设计**: RESTful API

### 模型说明
- **人脸检测**: YOLOv8n-face (轻量级人脸检测模型)
- **表情分类**: 基于CNN的7类表情分类器
- **模型大小**: ~20MB (优化后)
- **推理速度**: < 500ms (单张图片)

## 🚀 快速开始

### 环境要求

**小程序端:**
- 微信开发者工具
- Node.js 14.0+
- 微信小程序开发账号

**服务端:**
```bash
Python 3.8+
Flask 2.0+
OpenCV 4.0+
ultralytics 8.0+
numpy
flask-cors
```

### 安装部署

#### 1. 克隆项目
```bash
git clone https://github.com/Dadalia1917/FaceEmotion-Mini.git
cd FaceEmotion-Mini
```

#### 2. 服务端部署
```bash
# 进入服务端目录
cd flask/serever

# 安装依赖
pip install -r requirements.txt

# 启动服务（推荐使用启动脚本）
python start_server.py

# 或直接运行
python app.py
```

#### 3. 小程序端配置
```bash
# 使用微信开发者工具打开项目根目录
# 修改 pages/index/index.js 中的服务器地址
const SERVER_CONFIG = {
  baseUrl: 'http://your-server-ip:5000',  # 修改为你的服务器地址
  // ...
}
```

#### 4. 模型文件
```bash
# 下载预训练模型文件并放入 flask/serever/model/ 目录
- yolov8n-face.pt      # 人脸检测模型
- expression_cls.pt    # 表情分类模型
```

## 📁 项目结构

```
FaceEmotion-Mini/
├── 📱 小程序端
│   ├── app.js                 # 应用入口
│   ├── app.json              # 全局配置
│   ├── app.wxss              # 全局样式
│   ├── pages/                # 页面目录
│   │   ├── index/            # 主页面
│   │   └── mine/             # 个人中心
│   ├── colorui/              # UI组件库
│   ├── images/               # 静态资源
│   └── project.config.json   # 项目配置
│
├── 🖥️ 服务端
│   └── flask/serever/
│       ├── app.py            # Flask主应用
│       ├── Config.py         # 配置文件
│       ├── detect_tools.py   # 检测工具
│       ├── model/            # AI模型目录
│       └── Font/             # 字体文件
│
├── 📚 文档
│   ├── README.md            # 项目说明
│   ├── CHANGELOG.md         # 更新日志
│   └── LICENSE              # 开源协议
│
└── 🔧 配置文件
    ├── .gitignore           # Git忽略文件
    └── requirements.txt     # Python依赖
```

## 🎯 核心功能展示

### 图片表情识别
1. 用户选择图片或拍照
2. 图片上传至服务端
3. AI模型进行人脸检测和表情分析
4. 返回标注结果和表情信息

### 视频表情分析
1. 支持视频文件上传
2. 关键帧提取和分析
3. 表情变化趋势统计

### 用户数据管理
- 识别历史记录
- 使用统计信息
- 个人设置管理

## 🔧 开发说明

### 自定义配置
```javascript
// 服务器配置
const SERVER_CONFIG = {
  baseUrl: 'http://localhost:5000',
  endpoints: {
    inference: '/inference',
    health: '/health'
  },
  timeout: 10000
}

// 表情映射配置
const EMOTION_MAPPING = {
  'Happy': { cn: '开心', color: '#67C23A', icon: '😊' },
  // 可根据需要自定义更多表情
}
```

### API接口说明

#### POST /inference
表情识别接口
```json
// 请求
{
  "image": "data:image/jpeg;base64,..."
}

// 响应
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
  "image": "data:image/jpeg;base64,...",
  "processing_time": 0.35
}
```

#### GET /health
健康检查接口
```json
{
  "status": "healthy",
  "service": "FaceEmotion API",
  "version": "1.0.0"
}
```

## 🚀 部署说明

### 生产环境部署

#### Docker 部署 (推荐)
```dockerfile
FROM python:3.8-slim

WORKDIR /app
COPY flask/serever/ .

RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python", "app.py"]
```

#### 云服务器部署
```bash
# 使用 Gunicorn 部署
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### 小程序发布
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 在微信公众平台提交审核
4. 审核通过后发布

### 性能优化建议

1. **模型优化**
   - 使用模型量化技术减小模型大小
   - 采用TensorRT等推理加速框架

2. **缓存策略**
   - Redis缓存常用结果
   - CDN加速静态资源

3. **负载均衡**
   - 使用Nginx进行负载均衡
   - 多实例部署提升并发能力

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发流程
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 代码规范
- JavaScript: 遵循 ESLint 规范
- Python: 遵循 PEP 8 规范
- 提交信息: 使用语义化提交规范

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [YOLOv8](https://github.com/ultralytics/ultralytics) - 优秀的目标检测框架
- [ColorUI](https://github.com/weilanwl/ColorUI) - 精美的小程序UI组件库
- [Flask](https://flask.palletsprojects.com/) - 轻量级Python Web框架
- [OpenCV](https://opencv.org/) - 强大的计算机视觉库

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 📧 邮箱: [2955611455@qq.com](mailto:your-email@example.com)
- 🐙 GitHub: [https://github.com/Dadalia1917](https://github.com/yourusername)
- 📱 微信: zjx15251637949

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐ Star！**

Made with ❤️ by 查研阅色开发团队

</div>
