/**
 * 查研阅色 - 微信小程序入口文件
 * @description 人脸表情识别小程序应用核心配置
 * @author 查研阅色开发团队
 * @version 1.0.0
 */

App({
  onLaunch() {
    console.log('查研阅色应用启动')
    
    // 初始化应用日志记录
    this.initializeAppLogs()
    
    // 配置系统适配参数
    this.configureSystemAdaptation()
  },

  onShow() {
    console.log('查研阅色应用显示')
  },

  onHide() {
    console.log('查研阅色应用隐藏')
  },

  /**
   * 初始化应用日志系统
   */
  initializeAppLogs() {
    try {
      const appLogs = wx.getStorageSync('chayanYuese_logs') || []
      appLogs.unshift({
        timestamp: Date.now(),
        action: 'app_launch',
        version: '1.0.0'
      })
      
      // 仅保留最近50条日志
      if (appLogs.length > 50) {
        appLogs.splice(50)
      }
      
      wx.setStorageSync('chayanYuese_logs', appLogs)
    } catch (error) {
      console.error('日志初始化失败:', JSON.stringify(error, null, 2))
    }
  },

  /**
   * 配置系统UI适配参数
   */
  configureSystemAdaptation() {
    const self = this
    wx.getSystemInfo({
      success: (systemInfo) => {
        // 为了兼容cu-custom组件，保留原有的数据结构
        self.globalData.StatusBar = systemInfo.statusBarHeight
        
        // 获取胶囊按钮信息进行自定义导航栏适配
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
        if (menuButtonInfo) {
          self.globalData.Custom = menuButtonInfo
          self.globalData.CustomBar = menuButtonInfo.bottom + menuButtonInfo.top - systemInfo.statusBarHeight
        } else {
          // 默认导航栏高度
          self.globalData.CustomBar = systemInfo.statusBarHeight + 44
        }
        
        // 同时保存详细设备信息（新结构）
        self.globalData.deviceInfo = {
          statusBarHeight: systemInfo.statusBarHeight,
          screenWidth: systemInfo.screenWidth,
          screenHeight: systemInfo.screenHeight,
          platform: systemInfo.platform
        }
        
        self.globalData.navigationBarInfo = {
          capsuleInfo: menuButtonInfo,
          customNavHeight: self.globalData.CustomBar
        }
      },
      fail: (error) => {
        console.error('系统信息获取失败:', JSON.stringify(error, null, 2))
      }
    })
  },

  globalData: {
    // 用户信息
    userInfo: null,
    
    // 设备信息
    deviceInfo: {},
    
    // 导航栏信息
    navigationBarInfo: {},
    
    // 应用配置
    appConfig: {
      version: '1.0.0',
      name: '查研阅色',
      description: '智能人脸表情识别系统'
    }
  }
})
