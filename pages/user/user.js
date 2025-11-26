
const app = getApp();
var Api = require('../../utils/api.js');
Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        count:null
    },

  exit: function(){
    console.log('退出登录');
    // 清除全局用户信息
    app.globalData.userInfo = null;
    app.globalData.token = null;
    app.globalData.openid = null;
    
    // 清除本地存储
    wx.clearStorageSync();
    
    // 更新页面状态
    this.setData({
      hasUserInfo: false,
      userInfo: {},
      count: null
    });
    
    wx.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 1500
    });
  },

    onLoad: function () {
        console.log('用户页面加载，当前用户信息状态:', app.globalData.userInfo);
        
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        } else if (this.data.canIUse) {
            // 兼容旧版本，等待用户授权
            app.userInfoReadyCallback = res => {
                console.log('用户授权回调:', res.userInfo);
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
            }
        } else {
            // 直接获取用户信息
            wx.getUserInfo({
                success: res => {
                    console.log('直接获取用户信息:', res.userInfo);
                    app.globalData.userInfo = res.userInfo;
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    });
                },
                fail: err => {
                    console.error('获取用户信息失败:', err);
                }
            });
        }
    },
    getUserInfo: function (e) {
        console.log('获取用户信息:', e.detail.userInfo);
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
        
        // 登录成功后获取用户统计信息
        this.getCountMethods();
        
        // 提示登录成功
        wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
        });
    },

    getCountMethods:function(){
      var that = this;
      wx.request({
        url: Api.getCount() + app.globalData.token,
          success(res) {
            if(res.data.code=='200'){
              that.setData({
                count:res.data.count
              })
              // wx.setStorage({
              //   key:"count",
              //   data:res.data.count
              //  })
            }
          }
      })
    },

    onShow(){
        var that = this;
        
        // 检查全局用户信息状态
        if (app.globalData.userInfo && !this.data.hasUserInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
        
        this.getCountMethods()
    },

       // 单击
  mytap: function(e){
    console.log('成功点击');
    wx.showModal({
        title: '成功点击',
        content: '成功点击',
        showCancel: false,
      })
  },

  showQrcode() {
    wx.previewImage({
      urls: ['https://cdn.jamkung.com/card/user/1/202007/23/140522_25.png'],
      current: 'https://cdn.jamkung.com/card/user/1/202007/23/140522_25.png' // 当前显示图片的http链接      
    })
  },

    /**
   * 分享网页
   */
  onShareAppMessage: function () {
    return {
      title: '记忆手卡',
      desc: '让你记住每一个知识点',
      path: '/pages/user/user'
    }
 },

})
