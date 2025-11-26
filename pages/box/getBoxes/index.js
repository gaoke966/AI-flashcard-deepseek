var Api = require('../../../utils/api.js');
const app = getApp();
const platform = require('../../../utils/platform.js');
const errorHandler = require('../../../utils/error-handler.js');
const multiPlatformConfig = require('../../../utils/multi-platform-config.js');

Page({
  data: {
    items: [],
  },

  onLoad: function (options) {

  },

  /**
   * 首次渲染事件
   */
  onShow: function () {
    // 获取数据
    var that = this;

    that.onLoadData();

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

  /**
   * 跳转新增卡集
   */
  onNewItem: function () {
    const navAdapter = multiPlatformConfig.getNavigationAdapter();
    navAdapter.navigateTo({ url: "../createBox/index" });
  },

  /**
   * 跳转编辑卡集事件
   */
  onEditItem: function (event) {
    console.log(event.currentTarget.dataset.key)
    const url = '/pages/card/createCard/index?box_id=' + event.currentTarget.dataset.key;
    const navAdapter = multiPlatformConfig.getNavigationAdapter();
    navAdapter.navigateTo({ url: url });
  },

  /**
   * 跳转查看卡片
   */
  getBoxCard: function (event) {
    var data = event.currentTarget.dataset
    console.log(data)
    const url = '/pages/box/cardsList/index?box_id=' + data.key +'&box_color=' + data.color + "&box_name=" + data.box_name  + "&box_password=" + data.box_password;
    const navAdapter = multiPlatformConfig.getNavigationAdapter();
    navAdapter.navigateTo({ url: url });
  },


  /**
   * 获取卡集数据事件
   */
  onLoadData: function () {
    var that = this;
    
    console.log('=== 卡集页面开始加载数据 ===');
    console.log('当前globalData token:', app.globalData.token);
    
    // 始终尝试获取最新的token
    app.getUserToken(function(token) {
      if (token) {
        console.log('✅ 获取到token:', token.substring(0, 20) + '...');
        console.log('✅ globalData token检查:', app.globalData.token ? app.globalData.token.substring(0, 20) + '...' : 'null');
        
        // 强制确保token设置到globalData
        app.globalData.token = token;
        
        console.log('✅ 开始调用loadBoxData...');
        that.loadBoxData(token);
      } else {
        console.log('❌ 获取token失败，使用模拟数据');
        that.loadMockData();
      }
    });
  },

  /**
   * 加载卡集数据
   */
  loadBoxData: async function(token) {
    var that = this;
    
    // 确保使用有效的token
    var currentToken = token || app.globalData.token;
    
    console.log('loadBoxData - 传入token:', token);
    console.log('loadBoxData - globalData token:', app.globalData.token);
    console.log('loadBoxData - 使用token:', currentToken);
    
    if (!currentToken) {
      console.error('没有可用的token');
      that.loadMockData();
      return;
    }
    
    // 显示加载提示
    errorHandler.showLoading('正在加载卡集...');
    
    try {
      // 使用多端配置的安全API调用
      const result = await multiPlatformConfig.safeApiCall(
        null, // 不使用函数，直接传options
        {
          url: Api.getUserBoxes() + currentToken,
          method: 'GET',
          header: {
            'content-type': 'application/json',
          }
        },
        // 降级数据
        {
          code: "200",
          data: [
            {
              box_id: 'demo_1',
              box_name: '示例卡集1',
              box_color: 'blue',
              password: '1234',
              create_time: new Date().toISOString()
            },
            {
              box_id: 'demo_2', 
              box_name: '示例卡集2',
              box_color: 'green',
              password: '5678',
              create_time: new Date().toISOString()
            }
          ]
        }
      );
      
      console.log('API调用结果:', result);
      
      // 处理不同的响应格式
      let boxData = [];
      
      if (result && result.data) {
        if (result.data.data && Array.isArray(result.data.data)) {
          // 标准格式: {data: {data: [...], code: "200"}}
          boxData = result.data.data;
        } else if (Array.isArray(result.data)) {
          // 直接数组格式: {data: [...]}
          boxData = result.data;
        } else if (result.data.code && result.data.data) {
          // 另一种格式: {code: "200", data: [...]}
          boxData = result.data.data;
        }
      }
      
      if (boxData.length > 0) {
        that.setData({
          items: boxData
        });
        console.log('卡集数据加载成功:', boxData);
        errorHandler.showSuccess(`加载了${boxData.length}个卡集`);
      } else {
        console.log('没有找到卡集数据，使用模拟数据');
        that.loadMockData();
      }
      
    } catch (error) {
      console.error('加载卡集失败:', error);
      errorHandler.handleNetworkError(error, '网络请求失败，使用示例数据');
      that.loadMockData();
    }
    
    errorHandler.hideLoading();
  },



  /**
   * 加载模拟数据（降级方案）
   */
  loadMockData: function() {
    console.log('使用模拟数据');
    const mockData = [
      {
        box_id: 'demo_1',
        box_name: '示例卡集1',
        box_color: 'blue',
        password: '1234',
        create_time: new Date().toISOString()
      },
      {
        box_id: 'demo_2', 
        box_name: '示例卡集2',
        box_color: 'green',
        password: '5678',
        create_time: new Date().toISOString()
      }
    ];
    
    this.setData({
      items: mockData
    });
    
    errorHandler.showSuccess('已加载示例数据');
  },

  /**
   * 下拉刷新事件, 数据同步
   */
  onPullDownRefresh: function () {
    console.log('下拉刷新...');
    this.onLoadData();
    
    // 多端兼容的刷新提示
    const api = platform.getPlatformApi();
    if (typeof api.showToast === 'function') {
      api.showToast({
        title: '正在同步数据',
        icon: 'loading'
      });
    }
    
    // 停止下拉刷新
    setTimeout(() => {
      if (typeof wx.stopPullDownRefresh === 'function') {
        wx.stopPullDownRefresh();
      }
    }, 1000);
  },

  /**
   * 长按编辑事件
   */
  mylongtap: function(event){
    // 获取key值id
    console.log(event)
    console.log(event.currentTarget.dataset.key)
    var box_id = event.currentTarget.dataset.key;
    var mod_box = ''
    var items = this.data.items
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if(items[i].box_id == box_id){
        mod_box = items[i]
        
        // 多端兼容的本地存储
        this.setStorageSync("mod_box", mod_box);
        break
      }
    }

    console.log('编辑卡片')
    const url = '../modBox/index?box_id=' + event.currentTarget.dataset.key +'&box_color=' + event.currentTarget.dataset.color;
    this.navigateTo(url);
  },

  /**
   * 多端兼容的本地存储
   */
  setStorageSync: function(key, data) {
    const storageAdapter = multiPlatformConfig.getStorageAdapter();
    storageAdapter.setStorageSync(key, data);
  },
})
