//app.js
var Api = require('/utils/api.js');
const NetworkManager = require('/utils/network.js');
const AuthManager = require('/utils/auth.js');
const SimpleAuth = require('/utils/simple-auth.js');

// !function(){
//   var PageTmp = Page;
 
//   Page =function (pageConfig) {
     
//     // 设置全局默认分享
//     pageConfig = Object.assign({
//       onShareAppMessage:function () {
//         return {
//           title:'记忆手卡a',
//           desc: '让你记住每一个知识点',
//           path:'/pages/user/user',
//           imageUrl:'https://cdn.jamkung.com/cards/yg.jpg',
//         };
//       }
//     },pageConfig);
 
//     PageTmp(pageConfig);
//   };
// }();


App({
  onLaunch: function() {
    console.log('=== App onLaunch 开始 ===');
    
    // 自动修复token（在多端模式下重要）
    this.autoFixToken();
    
    // wx.login({
    //   success: res => {
    //     if (res.code) {
    //       wx.request({
    //         url: Api.getOpenidToken() + res.code,
    //         success: function(res) {
    //           if (res.data.openid) {
    //             var app = getApp();
                
    //             app.globalData.openid = res.data.openid;
    //             var openid_token = res.data.openid_token;

    //             wx.request({
    //               url: Api.getToken() + openid_token,
    //               success: function(res) {
    //                 console.log(res)
    //                 if (res.data.code=='200') {
    //                   app.globalData.token = res.data.token;
    //                   console.log("用户的真实token " +  app.globalData.token);
    //                   wx.hideLoading()
    //                 }
    //               },
    //               fail: function() {
    //                 wx.showModal({
    //                   title: '提示',
    //                   content: '加载失败,请检查网络状态,重新启动小程序',
    //                   showCancel: false,
    //                   success: function(res) {
    //                     wx.navigateBack({
    //                       delta: 1
    //                     })
    //                   }
    //                 })
    //               }
    //             })
    //             wx.hideLoading()
                
    //           }
    //         },
    //         fail: function() {
    //           wx.showModal({
    //             title: '提示',
    //             content: '加载失败,请检查网络状态,重新启动小程序',
    //             showCancel: false,
    //             success: function(res) {
    //               wx.navigateBack({
    //                 delta: 1
    //               })
    //             }
    //           })
    //         }
    //       })
    //     }
    //   }
    // })

    // 多端兼容的加载提示
    const platform = require('/utils/platform.js');
    const api = platform.getPlatformApi();
    
    if (typeof api.showLoading === 'function') {
      api.showLoading({
        title: "正在加载...",
        mask: true
      });
    } else {
      console.log('正在加载...');
    }

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })

    // 多端兼容的设置获取 - 在多端模式下跳过用户信息获取
    try {
      const platform = require('/utils/platform.js');
      const api = platform.getPlatformApi();
      
      // 在多端模式下，getSetting API可能不可用，直接跳过
      if (platform.isWeixin() && typeof api.getSetting === 'function') {
        // 仅在微信环境下尝试获取用户信息
        api.getSetting({
          success: res => {
            if (res.authSetting && res.authSetting['scope.userInfo']) {
              if (typeof api.getUserInfo === 'function') {
                api.getUserInfo({
                  success: res => {
                    this.globalData.userInfo = res.userInfo
                    if (this.userInfoReadyCallback) {
                      this.userInfoReadyCallback(res)
                    }
                  }
                })
              }
            }
          },
          fail: () => {
            console.log('getSetting失败，跳过用户信息获取')
          }
        })
      } else {
        console.log('非微信环境或getSetting不可用，跳过用户信息获取')
      }
    } catch (error) {
      console.log('用户信息获取过程出错，跳过:', error.message)
    }

    // 隐藏加载提示
    if (typeof api.hideLoading === 'function') {
      api.hideLoading();
    }
  },

  /**
   * 获取用户Token - 使用新的认证管理器
   */
  getUserToken: function(cb) {
    var that = this;
    
    console.log("=== getUserToken被调用 ===");
    console.log("当前globalData.token:", this.globalData.token);
    
    if (this.globalData.token) {
      console.log("已有token，直接返回:", this.globalData.token.substring(0, 20) + '...');
      cb(this.globalData.token);
      return;
    }

    console.log("没有token，开始获取...");
    
    // 优先使用简化认证
    SimpleAuth.getSimpleToken().then(token => {
      if (token) {
        this.globalData.token = token;
        console.log("SimpleAuth获取到token:", token.substring(0, 20) + '...');
        console.log("设置到globalData完成");
        
        // 同时保存到AuthManager的存储（兼容性）
        try {
          AuthManager.setStoredToken(token);
        } catch (error) {
          console.log("AuthManager保存失败，忽略:", error);
        }
        
        cb(token);
      } else {
        console.error("SimpleAuth获取token失败，尝试备用方案");
        that.fallbackAuth(cb);
      }
    }).catch(error => {
      console.error("SimpleAuth获取token异常:", error);
      that.fallbackAuth(cb);
    });
  },

  // 备用认证方案
  fallbackAuth: function(cb) {
    console.log("使用备用认证方案...");
    
    // 备用方案：直接生成一个模拟token
    const fallbackToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.globalData.token = fallbackToken;
    
    console.log("生成备用token:", fallbackToken.substring(0, 20) + '...');
    
    // 保存到存储
    try {
      SimpleAuth.saveTokenToStorage(fallbackToken);
    } catch (error) {
      console.log("保存备用token失败:", error);
    }
    
    cb(fallbackToken);
  },

  // 自动修复Token方法
  autoFixToken: function() {
    console.log('=== 开始自动修复Token ===');
    
    // 1. 检查globalData
    let token = this.globalData.token;
    console.log('1. globalData token:', token ? token.substring(0, 20) + '...' : 'null');
    
    // 2. 检查本地存储
    let storedToken = null;
    try {
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        storedToken = wx.getStorageSync('simple_token');
      } else if (typeof localStorage !== 'undefined') {
        storedToken = localStorage.getItem('simple_token');
      }
    } catch (error) {
      console.log('读取本地存储失败:', error);
    }
    console.log('2. 本地存储 token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
    
    // 3. 如果都没有，生成一个新的
    if (!token && !storedToken) {
      console.log('3. 没有token，生成新token...');
      const newToken = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 设置到globalData
      this.globalData.token = newToken;
      
      // 保存到本地存储
      try {
        if (typeof wx !== 'undefined' && wx.setStorageSync) {
          wx.setStorageSync('simple_token', newToken);
        } else if (typeof localStorage !== 'undefined') {
          localStorage.setItem('simple_token', newToken);
        }
        console.log('✅ 新token已生成并保存:', newToken.substring(0, 20) + '...');
      } catch (error) {
        console.log('保存新token失败:', error);
      }
      
      return newToken;
    }
    
    // 4. 如果只有本地存储有token，恢复到globalData
    if (!token && storedToken) {
      console.log('4. 从本地存储恢复token到globalData...');
      this.globalData.token = storedToken;
      console.log('✅ Token已恢复:', storedToken.substring(0, 20) + '...');
      return storedToken;
    }
    
    // 5. 如果globalData有token，保存到本地存储
    if (token && !storedToken) {
      console.log('5. 将globalData token保存到本地存储...');
      try {
        if (typeof wx !== 'undefined' && wx.setStorageSync) {
          wx.setStorageSync('simple_token', token);
        } else if (typeof localStorage !== 'undefined') {
          localStorage.setItem('simple_token', token);
        }
        console.log('✅ Token已保存到本地:', token.substring(0, 20) + '...');
      } catch (error) {
        console.log('保存token到本地失败:', error);
      }
      return token;
    }
    
    console.log('=== 自动修复完成，使用现有token ===');
    return token || storedToken;
  },

  globalData: {
    userInfo: null,
    openid: null,
    token: null,
    networkManager: NetworkManager
  }
})