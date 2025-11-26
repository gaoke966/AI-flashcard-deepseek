// 多端适配示例页面
const platform = require('../../utils/platform.js');
const app = getApp();

Page({
  data: {
    platformInfo: '',
    platformName: '',
    features: []
  },

  onLoad: function (options) {
    this.initPlatformInfo();
  },

  initPlatformInfo: function() {
    const currentPlatform = platform.getPlatform();
    let platformName = '';
    let features = [];

    // #ifdef MP-WEIXIN
    platformName = '微信小程序';
    features = ['微信支付', '微信登录', '微信分享', '微信客服'];
    // #endif

    // #ifdef MP-ALIPAY
    platformName = '支付宝小程序';
    features = ['支付宝支付', '芝麻信用', '花呗分期'];
    // #endif

    // #ifdef MP-BAIDU
    platformName = '百度小程序';
    features = ['百度搜索', '百度地图', '百度语音'];
    // #endif

    // #ifdef MP-TOUTIAO
    platformName = '字节跳动小程序';
    features = ['抖音分享', '今日头条', '西瓜视频'];
    // #endif

    // #ifdef MP-QQ
    platformName = 'QQ小程序';
    features = ['QQ登录', 'QQ分享', 'QQ支付'];
    // #endif

    // #ifdef H5
    platformName = 'H5网页';
    features = ['浏览器兼容', '响应式设计', 'SEO优化'];
    // #endif

    // #ifdef APP-PLUS
    platformName = 'App应用';
    features = ['原生功能', '离线使用', '推送通知'];
    // #endif

    this.setData({
      platformInfo: `当前平台: ${currentPlatform}`,
      platformName: platformName,
      features: features
    });

    console.log('Platform Info:', {
      platform: currentPlatform,
      name: platformName,
      features: features
    });
  },

  // 测试平台API
  testPlatformAPI: function() {
    const api = platform.getPlatformApi();
    
    api.showToast({
      title: `${this.data.platformName} API测试成功`,
      icon: 'success'
    });
  },

  // 测试网络请求
  testNetworkRequest: function() {
    const api = platform.getPlatformApi();
    
    // 这里应该使用统一的API调用方式
    const requestMethod = typeof api.request === 'function' ? api.request : wx.request;
    
    requestMethod({
      url: 'https://httpbin.org/get',
      method: 'GET',
      success: (res) => {
        console.log('网络请求成功:', res);
        api.showToast({
          title: '网络请求成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('网络请求失败:', err);
        api.showToast({
          title: '网络请求失败',
          icon: 'error'
        });
      }
    });
  },

  // 分享功能测试
  onShareAppMessage: function() {
    return {
      title: `记忆手卡 - ${this.data.platformName}`,
      path: '/pages/platform/index',
      // #ifdef MP-WEIXIN
      imageUrl: '/images/share.png'
      // #endif
    };
  }
});