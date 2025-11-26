// Token调试页面
const app = getApp();
const AuthManager = require('../../utils/auth.js');
const platform = require('../../utils/platform.js');

Page({
  data: {
    platformInfo: '',
    globalDataToken: '',
    authManagerToken: '',
    getUserTokenResult: '',
    logs: [],
    loading: false
  },

  onLoad: function () {
    this.initDebugInfo();
  },

  initDebugInfo: function() {
    this.addLog('Token调试页面加载完成');
    
    const platformInfo = {
      platform: platform.getPlatform(),
      isWeixin: platform.isWeixin(),
      isH5: platform.isH5(),
      isApp: platform.isApp()
    };

    this.setData({
      platformInfo: JSON.stringify(platformInfo, null, 2),
      globalDataToken: app.globalData.token || '未设置'
    });

    this.addLog(`平台检测完成: ${platformInfo.platform}`);
  },

  addLog: function(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logs = this.data.logs;
    logs.push(`[${timestamp}] ${message}`);
    
    if (logs.length > 30) {
      logs.shift();
    }
    
    this.setData({
      logs: logs
    });
  },

  // 测试AuthManager
  testAuthManager: async function() {
    this.setData({ loading: true });
    this.addLog('开始测试AuthManager.getAuthToken()...');
    
    try {
      const token = await AuthManager.getAuthToken();
      this.addLog(`AuthManager成功返回token: ${token ? token.substring(0, 30) + '...' : 'null'}`);
      
      this.setData({
        authManagerToken: token || '获取失败'
      });
      
    } catch (error) {
      this.addLog(`AuthManager异常: ${error.message}`);
      this.setData({
        authManagerToken: `异常: ${error.message}`
      });
    }
    
    this.setData({ loading: false });
  },

  // 测试getUserToken
  testGetUserToken: function() {
    this.addLog('开始测试app.getUserToken()...');
    
    app.getUserToken((token) => {
      if (token) {
        this.addLog(`getUserToken成功返回token: ${token.substring(0, 30) + '...'}`);
        
        this.setData({
          getUserTokenResult: token,
          globalDataToken: app.globalData.token || '未设置'
        });
        
      } else {
        this.addLog('getUserToken返回null');
        this.setData({
          getUserTokenResult: '获取失败'
        });
      }
    });
  },

  // 手动设置token
  setTokenManually: function() {
    const mockToken = `debug_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    app.globalData.token = mockToken;
    
    this.addLog(`手动设置token: ${mockToken.substring(0, 30)}...`);
    
    this.setData({
      globalDataToken: app.globalData.token
    });
  },

  // 清除token
  clearToken: function() {
    AuthManager.clearAuth();
    app.globalData.token = null;
    
    this.addLog('已清除所有token');
    
    this.setData({
      globalDataToken: '已清除',
      authManagerToken: '已清除',
      getUserTokenResult: '已清除'
    });
  },

  // 测试API调用
  testApiCall: function() {
    if (!app.globalData.token) {
      this.addLog('没有token，无法测试API');
      return;
    }

    this.addLog('开始测试API调用...');
    
    wx.request({
      url: 'http://192.168.2.105:5000/main/boxes?token=' + app.globalData.token,
      method: 'GET',
      success: (res) => {
        this.addLog(`API调用成功: ${JSON.stringify(res.data).substring(0, 100)}...`);
      },
      fail: (error) => {
        this.addLog(`API调用失败: ${error.errMsg}`);
      }
    });
  },

  // 清空日志
  clearLogs: function() {
    this.setData({
      logs: []
    });
    this.addLog('日志已清空');
  },

  onShareAppMessage: function() {
    return {
      title: 'Token调试工具',
      path: '/pages/token-debug/index'
    };
  }
});