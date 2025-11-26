// 强制Token设置页面
const app = getApp();
const SimpleAuth = require('../../utils/simple-auth.js');

Page({
  data: {
    currentToken: '',
    newToken: '',
    successMessage: ''
  },

  onLoad: function () {
    this.checkCurrentToken();
  },

  checkCurrentToken: function() {
    const currentToken = app.globalData.token || SimpleAuth.getTokenFromStorage() || '未设置';
    
    this.setData({
      currentToken: currentToken,
      successMessage: ''
    });
    
    console.log('当前token状态:', currentToken);
  },

  // 生成并设置新token
  generateAndSetToken: function() {
    console.log('开始生成新token...');
    
    const newToken = SimpleAuth.generateMockToken();
    
    // 1. 设置到globalData
    app.globalData.token = newToken;
    
    // 2. 保存到本地存储
    SimpleAuth.saveTokenToStorage(newToken);
    
    this.setData({
      newToken: newToken,
      currentToken: newToken,
      successMessage: '✅ Token已成功生成并设置！'
    });
    
    console.log('新token已设置:', newToken);
    
    // 显示成功提示
    wx.showToast({
      title: 'Token设置成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 手动输入token
  inputToken: function(e) {
    this.setData({
      newToken: e.detail.value
    });
  },

  // 设置手动输入的token
  setManualToken: function() {
    const manualToken = this.data.newToken.trim();
    
    if (!manualToken) {
      wx.showToast({
        title: '请输入Token',
        icon: 'none'
      });
      return;
    }
    
    // 设置token
    app.globalData.token = manualToken;
    SimpleAuth.saveTokenToStorage(manualToken);
    
    this.setData({
      currentToken: manualToken,
      successMessage: '✅ 手动Token设置成功！'
    });
    
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    });
    
    console.log('手动token已设置:', manualToken);
  },

  // 复制当前token
  copyCurrentToken: function() {
    const token = this.data.currentToken;
    
    if (token && token !== '未设置') {
      wx.setClipboardData({
        data: token,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    } else {
      wx.showToast({
        title: '没有可复制的Token',
        icon: 'none'
      });
    }
  },

  // 清除所有token
  clearAllTokens: function() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有Token吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除所有token
          app.globalData.token = null;
          SimpleAuth.clearTokenFromStorage();
          
          this.setData({
            currentToken: '未设置',
            newToken: '',
            successMessage: '✅ 所有Token已清除！'
          });
          
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 测试API请求
  testApiRequest: function() {
    const token = this.data.currentToken;
    
    if (!token || token === '未设置') {
      wx.showToast({
        title: '请先设置Token',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '测试中...'
    });
    
    wx.request({
      url: 'http://192.168.2.105:5000/main/boxes?token=' + token,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        
        console.log('API测试成功:', res);
        
        this.setData({
          successMessage: `✅ API测试成功！返回数据: ${JSON.stringify(res.data).substring(0, 50)}...`
        });
        
        wx.showToast({
          title: 'API测试成功',
          icon: 'success'
        });
      },
      fail: (error) => {
        wx.hideLoading();
        
        console.error('API测试失败:', error);
        
        this.setData({
          successMessage: `❌ API测试失败: ${error.errMsg}`
        });
        
        wx.showToast({
          title: 'API测试失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到卡集页面测试
  goToBoxPage: function() {
    if (!this.data.currentToken || this.data.currentToken === '未设置') {
      wx.showToast({
        title: '请先设置Token',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/box/getBoxes/index'
    });
  },

  onShareAppMessage: function() {
    return {
      title: '强制Token设置',
      path: '/pages/force-token/index'
    };
  }
});