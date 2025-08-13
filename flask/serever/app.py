"""
EmotiSync 服务器端API
@description 基于深度学习的人脸表情识别服务
@author EmotiSync Team
@version 1.0.0
"""

from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
from ultralytics import YOLO
from flask_cors import CORS
import Config
import logging
import os
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用实例
app = Flask(__name__)
CORS(app, 
     origins=["*"],  # 在生产环境中应该限制具体域名
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# 应用配置
app.config.update({
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB文件大小限制
    'JSON_AS_ASCII': False,  # 支持中文JSON响应
    'SECRET_KEY': 'emotisync_server_2024'
})

# 模型配置
MODEL_CONFIG = {
    'face_detection_model': "model/yolov8n-face.pt",
    'expression_classification_model': "model/expression_cls.pt",
    'confidence_threshold': 0.5,
    'max_faces': 10
}

# 全局模型实例
face_detector = None
expression_classifier = None

def initialize_models():
    """初始化AI模型"""
    global face_detector, expression_classifier
    
    try:
        logger.info("开始加载AI模型...")
        
        # 检查模型文件是否存在
        if not os.path.exists(MODEL_CONFIG['face_detection_model']):
            raise FileNotFoundError(f"人脸检测模型文件不存在: {MODEL_CONFIG['face_detection_model']}")
        
        if not os.path.exists(MODEL_CONFIG['expression_classification_model']):
            raise FileNotFoundError(f"表情识别模型文件不存在: {MODEL_CONFIG['expression_classification_model']}")
        
        # 加载模型
        face_detector = YOLO(MODEL_CONFIG['face_detection_model'])
        expression_classifier = YOLO(MODEL_CONFIG['expression_classification_model'])
        
        logger.info("AI模型加载成功")
        
    except Exception as e:
        logger.error(f"模型加载失败: {str(e)}")
        raise RuntimeError(f"模型初始化失败: {e}")

def detect_faces_in_image(input_image):
    """
    在图像中检测人脸
    @param input_image: 输入的图像数组
    @return: (标注后的图像, 人脸图像列表, 人脸位置列表)
    """
    try:
        # 复制图像避免修改原图
        processed_image = input_image.copy()
        
        # 使用人脸检测模型
        detection_results = face_detector(
            processed_image, 
            conf=MODEL_CONFIG['confidence_threshold'],
            verbose=False
        )
        
        face_crops = []
        face_positions = []
        
        # 处理检测结果
        if len(detection_results[0].boxes.data) > 0:
            face_boxes = detection_results[0].boxes.xyxy.tolist()
            
            # 限制最大人脸数量
            if len(face_boxes) > MODEL_CONFIG['max_faces']:
                face_boxes = face_boxes[:MODEL_CONFIG['max_faces']]
                logger.warning(f"检测到{len(face_boxes)}张人脸，已限制为{MODEL_CONFIG['max_faces']}张")
            
            for box_coords in face_boxes:
                # 转换坐标为整数
                x1, y1, x2, y2 = map(int, box_coords)
                face_positions.append([x1, y1, x2, y2])
                
                # 提取人脸区域
                face_crop = processed_image[y1:y2, x1:x2]
                face_crops.append(face_crop)
                
                # 在原图上绘制检测框
                cv2.rectangle(
                    processed_image, 
                    (x1, y1), (x2, y2), 
                    (46, 204, 113), 3  # 绿色检测框
                )
        
        logger.info(f"成功检测到 {len(face_crops)} 张人脸")
        return processed_image, face_crops, face_positions
        
    except Exception as e:
        logger.error(f"人脸检测过程出错: {str(e)}")
        raise

def classify_facial_expression(face_image):
    """
    对人脸图像进行表情分类
    @param face_image: 人脸图像
    @return: (表情标签, 置信度)
    """
    try:
        # 转换为灰度图像
        gray_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        # 转换为RGB格式（模型要求）
        rgb_face = cv2.cvtColor(gray_face, cv2.COLOR_GRAY2RGB)
        
        # 表情分类
        classification_results = expression_classifier(rgb_face, verbose=False)
        probabilities = classification_results[0].probs.data.tolist()
        
        # 获取最高概率的表情
        emotion_index = np.argmax(probabilities)
        emotion_label = Config.names[emotion_index]
        confidence_score = probabilities[emotion_index]
        
        return emotion_label, confidence_score
        
    except Exception as e:
        logger.error(f"表情分类过程出错: {str(e)}")
        raise

def process_image_data(base64_image):
    """
    处理Base64图像数据
    @param base64_image: Base64格式的图像字符串
    @return: OpenCV图像数组
    """
    try:
        # 解码Base64数据
        if ',' in base64_image:
            image_data = base64.b64decode(base64_image.split(',')[1])
        else:
            image_data = base64.b64decode(base64_image)
        
        # 转换为numpy数组
        np_array = np.frombuffer(image_data, np.uint8)
        
        # 解码为OpenCV图像
        opencv_image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        
        if opencv_image is None:
            raise ValueError("图像解码失败，可能是无效的图像格式")
        
        return opencv_image
        
    except Exception as e:
        logger.error(f"图像数据处理失败: {str(e)}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'service': 'EmotiSync API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/inference', methods=['POST', 'OPTIONS'])
def emotion_recognition_api():
    """表情识别主接口"""
    
    if request.method == 'OPTIONS':
        # 处理预检请求
        return '', 200
    
    start_time = datetime.now()
    
    try:
        # 验证请求数据
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'code': 'INVALID_REQUEST'
            }), 400
        
        if 'image' not in request_data:
            return jsonify({
                'success': False,
                'error': '缺少图像数据',
                'code': 'MISSING_IMAGE'
            }), 400
        
        logger.info("开始处理表情识别请求")
        
        # 处理图像数据
        input_image = process_image_data(request_data['image'])
        
        # 人脸检测
        annotated_image, face_crops, face_positions = detect_faces_in_image(input_image)
        
        # 表情分类结果
        recognition_results = []
        
        if face_crops:
            for idx, face_crop in enumerate(face_crops):
                emotion_label, confidence = classify_facial_expression(face_crop)
                
                # 在图像上标注表情结果
                x1, y1, x2, y2 = face_positions[idx]
                cv2.putText(
                    annotated_image, 
                    f"{emotion_label}", 
                    (x1, y1 - 15), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.8, 
                    (46, 204, 113), 2
                )
                
                # 记录结果
                recognition_results.append({
                    'box': face_positions[idx],
                    'expression': emotion_label,
                    'confidence': round(confidence, 4)
                })
        
        # 编码处理后的图像
        encode_success, image_buffer = cv2.imencode('.jpg', annotated_image)
        if not encode_success:
            raise RuntimeError("图像编码失败")
        
        result_image_b64 = base64.b64encode(image_buffer).decode('utf-8')
        
        # 计算处理时间
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # 构建响应
        response = {
            'success': True,
            'faces': recognition_results,
            'total_faces': len(recognition_results),
            'image': f"data:image/jpeg;base64,{result_image_b64}",
            'processing_time': round(processing_time, 3),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"表情识别完成，检测到{len(recognition_results)}张人脸，耗时{processing_time:.3f}秒")
        
        # 添加CORS头部确保跨域兼容
        response_obj = jsonify(response)
        response_obj.headers.add('Access-Control-Allow-Origin', '*')
        response_obj.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response_obj.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        
        return response_obj
        
    except Exception as e:
        error_msg = f"表情识别处理失败: {str(e)}"
        logger.error(error_msg)
        
        return jsonify({
            'success': False,
            'error': error_msg,
            'code': 'PROCESSING_ERROR',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(413)
def file_too_large(e):
    """文件大小超限处理"""
    return jsonify({
        'success': False,
        'error': '上传文件过大，请选择小于16MB的文件',
        'code': 'FILE_TOO_LARGE'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    """内部服务器错误处理"""
    return jsonify({
        'success': False,
        'error': '服务器内部错误',
        'code': 'INTERNAL_ERROR'
    }), 500

def get_local_ip():
    """获取本机IP地址"""
    import socket
    try:
        # 创建UDP socket连接到外部地址获取本机IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return '127.0.0.1'

if __name__ == '__main__':
    try:
        # 初始化模型
        initialize_models()
        
        # 自动获取本机IP地址
        local_ip = get_local_ip()
        SERVER_HOST = '0.0.0.0'  # 监听所有网络接口
        SERVER_PORT = 5000
        
        # 启动服务
        logger.info(f"查研阅色表情识别服务启动中...")
        logger.info(f"本机IP地址: {local_ip}")
        logger.info(f"服务监听: {SERVER_HOST}:{SERVER_PORT} (所有网络接口)")
        logger.info(f"")
        logger.info(f"🌐 小程序请使用以下地址:")
        logger.info(f"   API基地址: http://{local_ip}:{SERVER_PORT}")
        logger.info(f"   表情识别: http://{local_ip}:{SERVER_PORT}/inference")
        logger.info(f"   健康检查: http://{local_ip}:{SERVER_PORT}/health")
        logger.info(f"")
        logger.info(f"📱 请将小程序中的SERVER_CONFIG.baseUrl修改为: http://{local_ip}:{SERVER_PORT}")
        
        app.run(
            host=SERVER_HOST,
            port=SERVER_PORT,
            debug=False,
            threaded=True,
            use_reloader=False
        )
    except Exception as e:
        logger.error(f"服务启动失败: {str(e)}")
        exit(1)
