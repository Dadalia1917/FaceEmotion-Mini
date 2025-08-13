/**
 * 查研阅色主页面逻辑
 * @description 人脸表情识别功能实现
 */

// 服务器配置 - 根据Flask服务启动信息更新
const SERVER_CONFIG = {
  baseUrl: 'http://198.18.0.1:5000',  // ✅ 已更新为服务器实际IP
  endpoints: {
    inference: '/inference'
  },
  timeout: 30000  // 增加超时时间到30秒
}

// 💡 获取您的IP地址：
// 1. 启动Flask服务，查看控制台显示的IP
// 2. 或运行: python flask/serever/get_ip.py

// 表情识别映射配置
const EMOTION_MAPPING = {
  'Neutral': { cn: '中性', color: '#909399', icon: '😐' },
  'Happy': { cn: '开心', color: '#67C23A', icon: '😊' },
  'Sad': { cn: '悲伤', color: '#909399', icon: '😢' },
  'Surprised': { cn: '惊讶', color: '#E6A23C', icon: '😲' },
  'Angry': { cn: '生气', color: '#F56C6C', icon: '😠' },
  'Fearful': { cn: '害怕', color: '#909399', icon: '😨' },
  'Disgusted': { cn: '厌恶', color: '#909399', icon: '🤢' }
}

// 文件大小限制 (4MB)
const MAX_FILE_SIZE = 4 * 1024 * 1024

Page({
    data: {
        previewImagePath: '../../images/smile.jpg',
        detectionResults: null,
        emotionSummary: '',
        hasResult: false,
        faceCount: 0
    },

    /**
     * 生命周期函数 - 页面加载
     */
    onLoad() {
        this.initializePage()
    },

    /**
     * 初始化页面数据
     */
    initializePage() {
        console.log('查研阅色主页面初始化')
        console.log('服务器配置:', SERVER_CONFIG)
        
        this.setData({
            previewImagePath: '../../images/smile.jpg',
            // 添加测试数据以显示效果（和图二一样）
            emotionSummary: '中性',
            hasResult: true
        })
        
        // 页面加载时测试服务器连接
        setTimeout(() => {
            this.testServerConnection()
        }, 1000)
    },

    /**
     * 选择图片或视频进行识别
     */
    onSelectMedia() {
        this.launchMediaPicker(['image', 'video'])
    },

    /**
     * 专门选择视频文件
     */
    onSelectVideo() {
        this.launchMediaPicker(['video'])
    },

    /**
     * 启用相机拍照
     */
    onLaunchCamera() {
        const self = this
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['camera'],
            success: (res) => {
                const selectedFile = res.tempFiles[0]
                console.log('相机拍照文件信息:', {
                    size: selectedFile.size,
                    path: selectedFile.tempFilePath
                })
                
                if (selectedFile.size > MAX_FILE_SIZE) {
                    self.showMessage('文件大小超过限制 (4MB)', 'error')
                    return
                }
                
                // 压缩图片后再处理
                self.compressAndProcess(selectedFile.tempFilePath)
            },
            fail: (error) => {
                console.error('相机启动失败:', error)
                self.showMessage('相机启动失败', 'error')
            }
        })
    },

    /**
     * 压缩并处理图片
     */
    compressAndProcess(filePath) {
        const self = this
        
        console.log('开始压缩图片:', filePath)
        
        wx.compressImage({
            src: filePath,
            quality: 80,  // 压缩质量80%
            success: (res) => {
                console.log('图片压缩成功:', {
                    originalPath: filePath,
                    compressedPath: res.tempFilePath
                })
                self.processSelectedMedia(res.tempFilePath, 'image/jpeg')
            },
            fail: (error) => {
                console.error('图片压缩失败:', error)
                // 压缩失败时使用原图片
                self.processSelectedMedia(filePath, 'image/png')
            }
        })
    },

    /**
     * 启动媒体选择器
     * @param {Array} mediaTypes 媒体类型数组
     * @param {Array} sourceTypes 来源类型数组
     */
    launchMediaPicker(mediaTypes, sourceTypes = ['album', 'camera']) {
        const self = this
        
        wx.chooseMedia({
            count: 1,
            mediaType: mediaTypes,
            sourceType: sourceTypes,
            success: (res) => {
                const selectedFile = res.tempFiles[0]
                
                console.log('选择文件信息:', {
                    type: selectedFile.type,
                    size: selectedFile.size,
                    path: selectedFile.tempFilePath
                })
                
                // 文件大小验证
                if (selectedFile.size > MAX_FILE_SIZE) {
                    self.showMessage('文件大小超过限制 (4MB)', 'error')
                    return
                }
                
                // 根据文件类型分发处理
                if (selectedFile.type === 'video') {
                    self.processVideoFile(selectedFile.tempFilePath)
                } else {
                    // 图片先压缩再处理
                    self.compressAndProcess(selectedFile.tempFilePath)
                }
            },
            fail: (error) => {
                console.error('媒体选择失败:', error)
                self.showMessage('媒体选择失败', 'error')
            }
        })
    },

    /**
     * 处理选中的媒体文件
     * @param {String} filePath 文件路径
     * @param {String} mimeType MIME类型
     */
    processSelectedMedia(filePath, mimeType) {
        const self = this
        
        try {
            // 转换文件为Base64格式
            const fileBase64 = wx.getFileSystemManager().readFileSync(filePath, 'base64')
            const base64DataUri = `data:${mimeType};base64,${fileBase64}`
            
            // 更新UI状态
            self.setData({ isProcessing: true })
            self.showMessage('正在分析表情...', 'loading')
            
            // 发送识别请求
            self.sendRecognitionRequest({
                image: base64DataUri
            }, 'image')
            
        } catch (error) {
            console.error('文件处理失败:', error)
            self.showMessage('文件处理失败', 'error')
        }
    },

    /**
     * 处理视频文件
     * @param {String} filePath 视频文件路径
     */
    processVideoFile(filePath) {
        const self = this
        
        try {
            // 转换视频文件为Base64
            const videoBase64 = wx.getFileSystemManager().readFileSync(filePath, 'base64')
            const base64DataUri = `data:video/mp4;base64,${videoBase64}`
            
            // 更新UI状态
            self.setData({ isProcessing: true })
            self.showMessage('正在分析视频表情...', 'loading')
            
            // 发送视频识别请求
            self.sendRecognitionRequest({
                video: base64DataUri
            }, 'video')
            
        } catch (error) {
            console.error('视频处理失败:', error)
            self.showMessage('视频处理失败', 'error')
        }
    },

    /**
     * 测试服务器连接
     */
    testServerConnection() {
        const self = this
        const healthUrl = `${SERVER_CONFIG.baseUrl}/health`
        
        console.log('正在测试服务器连接:', healthUrl)
        
        wx.request({
            url: healthUrl,
            method: 'GET',
            timeout: 5000,
            success: (response) => {
                console.log('✅ 服务器连接正常:', response.data)
                wx.showToast({
                    title: '服务器连接正常',
                    icon: 'success'
                })
            },
            fail: (error) => {
                console.error('❌ 服务器连接失败:', error)
                wx.showModal({
                    title: '服务器连接失败',
                    content: `无法连接到服务器\nURL: ${healthUrl}\n错误: ${error.errMsg}`,
                    showCancel: false,
                    confirmText: '知道了'
                })
            }
        })
    },

    /**
     * 发送识别请求到服务器
     * @param {Object} requestData 请求数据
     * @param {String} mediaType 媒体类型
     */
    sendRecognitionRequest(requestData, mediaType) {
        const self = this
        const requestUrl = `${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.endpoints.inference}`
        
        console.log('发送表情识别请求:', {
            url: requestUrl,
            dataSize: JSON.stringify(requestData).length,
            timeout: SERVER_CONFIG.timeout
        })
        
        wx.request({
            url: requestUrl,
            data: JSON.stringify(requestData),
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            timeout: SERVER_CONFIG.timeout,
            success: (response) => {
                console.log('API响应成功:', JSON.stringify(response.data, null, 2))
                self.handleRecognitionSuccess(response.data, mediaType)
            },
            fail: (error) => {
                console.error('识别请求失败:', JSON.stringify(error, null, 2))
                console.error('请求详情:', {
                    url: requestUrl,
                    method: 'POST',
                    timeout: SERVER_CONFIG.timeout
                })
                self.handleRecognitionFailure(error)
            },
            complete: () => {
                wx.hideLoading()
                console.log('API请求完成')
            }
        })
    },

    /**
     * 处理识别成功的响应
     * @param {Object} responseData 响应数据
     * @param {String} mediaType 媒体类型
     */
    handleRecognitionSuccess(responseData, mediaType) {
        const self = this
        
        // 检查响应是否成功
        if (responseData && responseData.success === false) {
            // 服务器返回错误
            self.showMessage(responseData.error || '处理失败', 'error')
            return
        }
        
        if (responseData && responseData.faces && responseData.faces.length > 0) {
            // 处理表情识别结果
            const emotionResults = self.processEmotionResults(responseData.faces)
            
            // 更新页面数据
            self.setData({
                detectionResults: responseData.faces,
                emotionSummary: emotionResults.summary,
                faceCount: responseData.faces.length,
                previewImagePath: responseData.image || self.data.previewImagePath,
                hasResult: true
            })
            
            // 显示成功信息
            self.showMessage(`✅ 检测到${responseData.faces.length}张人脸`, 'success')
            
            // 绘制检测框
            self.renderDetectionResults()
        } else {
            self.showMessage('未检测到人脸，请尝试更清晰的图片', 'none')
        }
    },

    /**
     * 处理识别失败的情况
     * @param {Object} error 错误信息
     */
    handleRecognitionFailure(error) {
        console.error('表情识别失败:', JSON.stringify(error, null, 2))
        
        let errorMessage = '表情识别失败'
        
        // 根据错误类型给出具体提示
        if (error.errMsg) {
            if (error.errMsg.includes('timeout')) {
                errorMessage = '请求超时，请检查网络连接或稍后重试'
            } else if (error.errMsg.includes('request:fail')) {
                errorMessage = '网络连接失败，请检查服务器状态'
            } else if (error.errMsg.includes('404')) {
                errorMessage = '服务接口不存在'
            } else if (error.errMsg.includes('500')) {
                errorMessage = '服务器内部错误'
            }
        }
        
        this.showMessage(errorMessage, 'error')
    },

    /**
     * 处理表情识别结果
     * @param {Array} faces 人脸数组
     * @return {Object} 处理后的结果
     */
    processEmotionResults(faces) {
        const emotionList = faces.map((face, index) => {
            const emotionInfo = EMOTION_MAPPING[face.expression] || {
                cn: face.expression,
                color: '#909399',
                icon: '😐'
            }
            return emotionInfo.cn
        })
        
        return {
            summary: emotionList.join(', '),
            detailed: faces.map((face, index) => ({
                index: index + 1,
                emotion: EMOTION_MAPPING[face.expression] || { cn: face.expression },
                confidence: face.confidence || 0,
                position: face.box
            }))
        }
    },

    /**
     * 渲染检测结果到画布
     */
    renderDetectionResults() {
        const canvasId = 'emotionCanvas'
        const ctx = wx.createCanvasContext(canvasId, this)
        const imagePath = this.data.previewImagePath
        
        // 绘制原始图片
        ctx.drawImage(imagePath, 0, 0, 300, 300)
        
        // 绘制检测框和标签
        if (this.data.detectionResults) {
            this.data.detectionResults.forEach((face, index) => {
                const { box, expression } = face
                const emotionInfo = EMOTION_MAPPING[expression] || { cn: expression, color: '#67C23A' }
                
                // 设置检测框样式
                ctx.setStrokeStyle(emotionInfo.color)
                ctx.setLineWidth(2)
                ctx.strokeRect(box[0], box[1], box[2] - box[0], box[3] - box[1])
                
                // 绘制表情标签
                ctx.setFillStyle(emotionInfo.color)
                ctx.setFontSize(14)
                ctx.fillText(`${emotionInfo.cn}`, box[0], box[1] - 5)
            })
        }
        
        ctx.draw()
    },

    /**
     * 显示消息提示
     * @param {String} message 消息内容
     * @param {String} type 消息类型: success, error, loading, none
     */
    showMessage(message, type = 'none') {
        const iconMap = {
            success: 'success',
            error: 'error', 
            loading: 'loading',
            none: 'none'
        }
        
        if (type === 'loading') {
            wx.showLoading({ title: message, mask: true })
        } else {
            wx.showToast({
                title: message,
                icon: iconMap[type] || 'none',
                duration: 2000,
                mask: true
            })
        }
    }
});
