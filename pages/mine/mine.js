/**
 * 查研阅色个人中心页面
 * @description 用户信息管理和应用设置
 */

const app = getApp()

Page({
  data: {
    // 应用统计信息
    appStats: {
      recognitionCount: 0,
      totalFaces: 0,
      lastUseTime: null
    },
    
    // 用户信息
    userProfile: {},
    hasUserInfo: false,
    isUserInfoLoading: false,
    
    // 应用版本信息
    appVersion: '1.0.0',
    buildTime: '2024-12-19'
  },

  /**
   * 页面加载时初始化
   */
  onLoad() {
    this.initializeUserCenter()
  },

  /**
   * 页面显示时刷新数据
   */
  onShow() {
    this.refreshAppStatistics()
  },

  /**
   * 初始化个人中心
   */
  initializeUserCenter() {
    console.log('查研阅色个人中心初始化')
    
    // 加载用户统计数据
    this.loadUserStatistics()
    
    // 检查用户信息
    this.checkUserInfoStatus()
  },

  /**
   * 获取用户个人信息
   */
  onGetUserProfile() {
    const self = this
    
    if (self.data.isUserInfoLoading) {
      return
    }
    
    self.setData({ isUserInfoLoading: true })
    
    wx.getUserProfile({
      desc: '查研阅色需要您的用户信息来提供个性化服务',
      lang: 'zh_CN',
      success: (res) => {
        console.log('用户信息获取成功:', JSON.stringify(res.userInfo, null, 2))
        
        self.setData({
          userProfile: res.userInfo,
          hasUserInfo: true,
          isUserInfoLoading: false
        })
        
        // 保存用户信息到本地
        self.saveUserProfile(res.userInfo)
        
        wx.showToast({
          title: '信息获取成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (error) => {
        console.error('用户信息获取失败:', JSON.stringify(error, null, 2))
        self.setData({ isUserInfoLoading: false })
        
        wx.showToast({
          title: '获取信息失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * 检查用户信息状态
   */
  checkUserInfoStatus() {
    try {
      const savedUserInfo = wx.getStorageSync('chayanYuese_user_profile')
      if (savedUserInfo) {
        this.setData({
          userProfile: savedUserInfo,
          hasUserInfo: true
        })
      }
    } catch (error) {
      console.error('读取用户信息失败:', error)
    }
  },

  /**
   * 保存用户信息到本地
   */
  saveUserProfile(userInfo) {
    try {
      wx.setStorageSync('chayanYuese_user_profile', userInfo)
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  },

  /**
   * 加载用户统计数据
   */
  loadUserStatistics() {
    try {
      const logs = wx.getStorageSync('chayanYuese_logs') || []
      const recognitionLogs = logs.filter(log => log.action === 'face_recognition')
      
      this.setData({
        'appStats.recognitionCount': recognitionLogs.length,
        'appStats.lastUseTime': logs.length > 0 ? logs[0].timestamp : null
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  },

  /**
   * 刷新应用统计信息
   */
  refreshAppStatistics() {
    this.loadUserStatistics()
  },

  /**
   * 导航到关于页面
   */
  onNavigateToAbout() {
    wx.navigateTo({
      url: '/pages/mine/about/about'
    })
  },

  /**
   * 清除用户数据
   */
  onClearUserData() {
    const self = this
    
    wx.showModal({
      title: '确认清除',
      content: '此操作将清除所有用户数据，确定继续？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            self.setData({
              userProfile: {},
              hasUserInfo: false,
              'appStats.recognitionCount': 0,
              'appStats.totalFaces': 0,
              'appStats.lastUseTime': null
            })
            
            wx.showToast({
              title: '数据已清除',
              icon: 'success'
            })
          } catch (error) {
            console.error('清除数据失败:', error)
            wx.showToast({
              title: '清除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})
