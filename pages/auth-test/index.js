// 多端认证测试页面
const AuthManager = require('../../utils/auth.js');
const platform = require('../../utils/platform.js');
const app = getApp();

Page({
  data: {
    platformInfo: '',
    token: '',
    logs: []
  },

  onLoad: function () {
    this.initPlatformInfo();
    this.initLogs();
  },

  initPlatformInfo: function() {
    const platformInfo = {
      platform: platform.getPlatform(),
      isWeixin: platform.isWeixin(),
      isH5: platform.isH5(),
      isApp: platform.isApp()
    };

    this.setData({
      platformInfo: JSON.stringify(platformInfo, null, 2)
    });

    console.log('平台信息:', platformInfo);
  },

  initLogs: function() {
    this.addLog('页面加载完成');
  },

  addLog: function(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logs = this.data.logs;
    logs.push(`[${timestamp}] ${message}`);
    
    // 保持最多20条日志
    if (logs.length > 20) {
      logs.shift();
    }
    
    this.setData({
      logs: logs
    });
  },

  // 测试获取token
  testGetToken: function() {
    this.addLog('开始测试获取token...');
    
    app.getUserToken((token) => {
      if (token) {
        this.addLog(`获取token成功: ${token}`);
        this.setData({
          token: token
        });
      } else {
        this.addLog('获取token失败');
      }
    });
  },

  // 直接测试AuthManager
  testAuthManager: async function() {
    this.addLog('直接测试AuthManager...');
    
    try {
      const token = await AuthManager.getAuthToken();
      this.addLog(`AuthManager获取token成功: ${token}`);
      this.setData({
        token: token
      });
    } catch (error) {
      this.addLog(`AuthManager获取token失败: ${error.message}`);
    }
  },

  // 测试平台检测
  testPlatformDetection: function() {
    const platformInfo = platform.getPlatform();
    this.addLog(`平台检测结果: ${platformInfo}`);
    
    if (platform.isWeixin()) {
      this.addLog('检测到微信小程序环境');
    } else if (platform.isH5()) {
      this.addLog('检测到H5环境');
    } else if (platform.isApp()) {
      this.addLog('检测到App环境');
    } else {
      this.addLog('未知环境');
    }
  },

  // 测试wx.login（仅在微信环境）
  testWxLogin: function() {
    if (typeof wx !== 'undefined' && typeof wx.login === 'function') {
      this.addLog('测试wx.login...');
      
      wx.login({
        success: (res) => {
          if (res.code) {
            this.addLog(`wx.login成功，code: ${res.code}`);
          } else {
            this.addLog('wx.login失败，未获取到code');
          }
        },
        fail: (error) => {
          this.addLog(`wx.login失败: ${error.errMsg}`);
        }
      });
    } else {
      this.addLog('当前环境不支持wx.login');
    }
  },

  // 清除认证信息
  clearAuth: function() {
    AuthManager.clearAuth();
    app.globalData.token = null;
    
    this.setData({
      token: ''
    });
    
    this.addLog('已清除认证信息');
  },

  // 清空日志
  clearLogs: function() {
    this.setData({
      logs: []
    });
    this.addLog('日志已清空');
  },

  // 复制token
  copyToken: function() {
    if (this.data.token) {
      // #ifdef MP-WEIXIN
      wx.setClipboardData({
        data: this.data.token,
        success: () => {
          this.addLog('token已复制到剪贴板');
        }
      });
      // #endif
      
      // #ifdef H5
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.data.token).then(() => {
          this.addLog('token已复制到剪贴板');
        });
      }
      // #endif
    } else {
      this.addLog('没有可复制的token');
    }
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: '多端认证测试',
      path: '/pages/auth-test/index'
    };
  }
});