// 配置检查页面
const appidConfig = require('../../utils/appid-config.js');

Page({
  data: {
    configStatus: {},
    currentPlatform: 'mp-weixin',
    showForm: false,
    newAppId: ''
  },

  onLoad: function (options) {
    this.checkConfig();
  },

  onShow: function () {
    this.checkConfig();
  },

  // 检查配置状态
  checkConfig: function() {
    const status = appidConfig.getConfigStatus();
    
    this.setData({
      configStatus: status
    });
    
    console.log('配置状态:', status);
  },

  // 显示配置表单
  showConfigForm: function() {
    this.setData({
      showForm: true
    });
  },

  // 隐藏配置表单
  hideConfigForm: function() {
    this.setData({
      showForm: false,
      newAppId: ''
    });
  },

  // AppID输入
  onAppIdInput: function(e) {
    this.setData({
      newAppId: e.detail.value
    });
  },

  // 保存AppID配置
  saveAppId: function() {
    const { newAppId, currentPlatform } = this.data;
    
    if (!newAppid) {
      wx.showToast({
        title: '请输入AppID',
        icon: 'error'
      });
      return;
    }
    
    if (!appidConfig.validateAppId(newAppId)) {
      wx.showToast({
        title: 'AppID格式不正确',
        icon: 'error'
      });
      return;
    }
    
    appidConfig.setAppId(currentPlatform, newAppId);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    this.hideConfigForm();
    this.checkConfig();
  },

  // 复制AppID
  copyAppId: function(e) {
    const appid = e.currentTarget.dataset.appid;
    
    // #ifdef MP-WEIXIN
    wx.setClipboardData({
      data: appid,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
    // #endif
    
    // #ifdef H5
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appid).then(() => {
        alert('已复制到剪贴板');
      });
    }
    // #endif
  },

  // 获取配置帮助
  showHelp: function() {
    wx.showModal({
      title: 'AppID配置说明',
      content: '1. 登录微信公众平台\n2. 进入小程序管理\n3. 查看小程序信息\n4. 复制AppID到这里\n\n注意：只有开发者才能修改AppID',
      showCancel: false
    });
  },

  // 重新加载项目
  reloadProject: function() {
    wx.showModal({
      title: '重新加载项目',
      content: '是否重新加载项目以应用新的AppID配置？',
      success: (res) => {
        if (res.confirm) {
          // 微信开发者工具不支持程序化重载，需要手动操作
          wx.showToast({
            title: '请手动重载项目',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 分享配置
  onShareAppMessage: function() {
    return {
      title: '小程序配置管理',
      path: '/pages/config/index'
    };
  }
});