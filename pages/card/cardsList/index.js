var Api = require('../../../utils/api.js');
var startX, endX;
var moveFlag = true;// 判断执行滑动事件
const app = getApp();
const errorHandler = require('../../../utils/error-handler.js');
Page({
  data: {
    showNot:false,
    index: 0,
    cardsData : [],
    
    all_box_id:null,
    order:'down',
    page:1,
    limit:10,

    checkbox: [{
      box_id:null,
      box_name:null,
      checked:false
    }],
    orderType:[
      {value:"random",name:"随机排序"},
      {value:"up",name:"升序排序"},
      {value:"down",name:"降序排序", checked: 'true'},
    ]
  },
  /**
   * 选框设置
   */
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  // hideModal(e) {
  //   this.setData({
  //     modalName: null
  //   })
  // },

  /**
   * 单选框的设置
   */
  radioChange(e) {
    console.log(e)
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    console.log(e)
    const items = this.data.orderType
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }
    this.setData({
      orderType:items
    })
  },

    /**
   * 更新卡的排序方式
   */
  updateNewOrderCards: function() {
    var that = this;

    // 退出点击页面
    that.setData({
      modalName: null
    })

    var orderItem = that.data.orderType
    var order_type =  that.data.order
    for (let i = 0, lenI = orderItem.length; i < lenI; ++i) {
      if(orderItem[i].checked){
        order_type = orderItem[i].value
        that.setData({
          order: order_type
        })
      }
    }
    
    console.log("新排序方式",order_type)
    wx.showToast({
      title: '正在更新数据',
      icon: 'loading'
    });
    this.onLoad()
  },

  /**
   * 监听加载数据
   */
  onLoad: function(options) {
    console.log("cardsList页面加载，参数:", options)
    
    var that = this;
    
    // 先获取token，再加载数据
    app.getUserToken(function(token) {
      if (token) {
        console.log("cardsList获取到token:", token)
        console.log("cardsList globalData token:", app.globalData.token)
        
        // 确保token设置到globalData
        if (!app.globalData.token) {
          app.globalData.token = token;
        }
        
        // 加载盒子数据
        that.onLoadData()
        
        // 根据是否有卡片数据决定加载方式
        if(that.data.cardsData.length <1){
          console.log("cardsList首次加载，加载所有卡片:", that.data.cardsData.length)
          var boxes_id = "all"
          var order = "down"
          that.getCArdsMethods(boxes_id,order)
        }else{
          var all_box_id = that.data.all_box_id
          var order = that.data.order
          that.getCArdsMethods(all_box_id,order)
        }
      } else {
        console.log("cardsList获取token失败，使用模拟数据")
        that.loadMockCards()
      }
    })

  },

  /**
   * 获取盒子数据
   */
  onLoadData: function () {
    var that = this;
    
    console.log('cardsList onLoadData - 开始，globalData token:', app.globalData.token);
    
    // 始终尝试获取最新的token
    app.getUserToken(function(token) {
      if (token) {
        console.log('cardsList获取到token，继续加载数据:', token);
        
        // 确保token设置到globalData
        if (!app.globalData.token || app.globalData.token !== token) {
          app.globalData.token = token;
        }
        
        that.onLoadDataWithToken(token);
      } else {
        console.log('cardsList无法获取token，使用模拟数据');
        that.loadMockCards();
      }
    });
  },

  /**
   * 使用token加载数据
   */
  onLoadDataWithToken: function(token) {
    var that = this;
    
    console.log('cardsList onLoadDataWithToken - 使用token:', token);
    
    wx.request({
      url: Api.getUserBoxes() + token,
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success: function(res) {
        console.log('卡集API响应:', res);
        
        let items = [];
        
        // 处理不同的响应格式
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && res.data.code === "200" && res.data.data) {
          items = res.data.data;
        }
        
        console.log('解析出的卡集数据:', items);
        
        if (items.length > 0) {
          var checkbox = []
          for (let i = 0, lenI = items.length; i < lenI; ++i) {
              checkbox.push({
                box_id:items[i].box_id,
                box_name:items[i].box_name,
                checked:true
              })
          }
          that.setData({
            checkbox: checkbox
          });
          console.log('卡集选择框数据设置成功:', checkbox);
        } else {
          console.log('没有找到卡集数据');
          // 不显示错误，只清空选择框
          that.setData({
            checkbox: []
          });
        }
      },
      fail: function(error) {
        console.error('获取卡集数据失败:', error);
        that.setData({
          checkbox: []
        });
      },
      complete: function() {}
    })
  },

  /**
   * 获取卡片第一页数据
   */
  getCArdsMethods:function(all_box_id,order){
    var that = this;
    
    var currentToken = app.globalData.token;
    
    console.log('cardsList getCArdsMethods - 开始获取卡片数据:', {
      all_box_id: all_box_id,
      order: order,
      token: currentToken
    });
    
    if (!currentToken) {
      console.log('cardsList Token为空，使用模拟卡片数据');
      that.loadMockCards();
      return;
    }
    
    wx.request({
      url: Api.getCards() + currentToken,
      data: {
        all_box_id: all_box_id,
        card_status: "all",
        order: order,
        page: 1,
        limit: that.data.limit
      },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function(res) {
        console.log('卡片API响应:', res);
        
        let cardsData = [];
        let isSuccess = false;
        
        // 处理不同的响应格式
        if (res.data) {
          if (res.data.code === "200" && res.data.data && Array.isArray(res.data.data)) {
            cardsData = res.data.data;
            isSuccess = true;
          } else if (Array.isArray(res.data)) {
            cardsData = res.data;
            isSuccess = true;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            cardsData = res.data.data;
            isSuccess = true;
          }
        }
        
        if (isSuccess && cardsData.length >= 1) {
          console.log('卡片数据加载成功:', cardsData);
          that.setData({
            cardsData: cardsData,
            all_box_id: all_box_id,
            order: order,
            page: 2,
            index: 0,
          });
          wx.showToast({
            title: `加载了${cardsData.length}张卡片`,
            icon: 'success'
          });
          
        } else if (isSuccess && cardsData.length === 0) {
          console.log('没有找到卡片数据');
          wx.showModal({
            title: '当前没有卡片',
            content: '快去添加你的第一张卡吧~',
            showCancel: false,
          })
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/box/getBoxes/index',
            })
          }, 1500)
          
        } else {
          console.log('API响应格式异常或失败:', res.data);
          wx.showModal({
            title: '请求失败',
            content: '快去添加你的卡集与卡片数据吧~',
            showCancel: false,
          })
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/box/getBoxes/index',
            })
          }, 1500)
        }
      },
      fail: function(error) {
        console.error('获取卡片数据失败:', error);
        wx.showModal({
          title: '网络请求失败',
          content: '请检查网络连接后重试',
          showCancel: false,
        })
      }
    })
  },

  /**
   * 展示卡片正反面数据
   */
  show: function() {
    var that = this;
    console.log(!that.data.showNot);
    this.setData({
      showNot: !that.data.showNot
    })
  },

  /**
   * 更新获取卡的筛选方式
   */
  updateNewSelectCards: function() {
    var that = this;

    // 退出点击页面
    that.setData({
      modalName: null
    })

    var box_id = []
    let items = that.data.checkbox;
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if(items[i].checked){
        box_id.push(items[i].box_id)
      }
    }
    var orderItem = that.data.orderType
    var order_type = "random"
    for (let i = 0, lenI = orderItem.length; i < lenI; ++i) {
      if(orderItem[i].checked){
        order_type = orderItem[i].value
      }
    }
    console.log(box_id,order_type)
    this.getCArdsMethods(box_id,order_type)
  },

  /**
   * 下一页的请求方法
   */
  nextCard:function(){
    var that = this
    wx.request({
      url: Api.getCards() + app.globalData.token,
      data: {
        all_box_id: that.data.all_box_id,
        card_status: "all",
        order: that.data.order,
        page: that.data.page,
        limit: that.data.limit
      },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function(res) {
        if(res.data.code =='200'){
          console.log(res.data.code)

          if(res.data.data.length>0){
            that.setData({
              cardsData:that.data.cardsData.concat(res.data.data),
              page:that.data.page + 1
            })
            // that.next()

          }else{
            console.log('没有卡')
          }
        }else{
          console.log('请求失败000')
        }
      },
    })
  },

  /**
   * 下一页
   */
  next: function() {
    this.setData({
      showNot: false
    })
    var that = this;
    console.log('当前数据是'+that.data.cardsData)
      this.nextCard()
  },


  /**
   * 双击卡片的方法
   */
  markCardStatus:function(box_id,card_id,status){
    var that = this
    wx.request({
      url: Api.markCardStatus() + app.globalData.token,
        data: {
          box_id: box_id,
          card_id: card_id,
          status: status
        },
        header: {
            'content-type': 'application/json'
        },
        method: 'PUT',
        success(res) {
          console.log(res)
            if (res.data.code == "200") {
              if(status == "un_understand"){
                status = "取消掌握"
              }else if(status == "understand"){
                status = "掌握"
              }else if(status == "un_collect"){
                status = "取消收藏"
              }else{
                status = "收藏"
              }
              console.log(status)
                wx.showToast({
                    title: status + '成功',
                })
            }else if(res.data.code == "4444"){
              wx.showToast({
                title: '请求过快',
                icon: 'none',
                duration:3000
              })    
            }else {
                wx.showToast({
                    title: '更新失败',
                    icon: 'none',
                    duration:3000
                })
            }
        }
    })
  },



  /**
   * 编辑笔记事件
   */
  onEditItem: function (event) {
    console.log(event.currentTarget.dataset)
    console.log('编辑卡片')
    var card_data = ''
    for (let i = 0, lenI = this.data.cardsData.length; i < lenI; ++i) {
      if(this.data.cardsData[i].card_id == event.currentTarget.dataset.card_id){
        card_data = this.data.cardsData[i]
        break
      }
    }

    wx.setStorage({

      key:"mod_card",
      
      data:card_data
      
     })

    wx.navigateTo({
      url: '/pages/card/modCard/index?card_id=' + card_data.card_id +'&box_id'+card_data.box_id
    })
  },




   // 单击双击
  mytap: function(e){
    var curTime = e.timeStamp;
    var lastTime = this.data.lastTabDiffTime;
    if(lastTime > 0){
      if(curTime - lastTime < 300){
        console.log(e.timeStamp + '双击')

        var box_id = this.data.cardsData[this.data.index].box_id
        var card_id = this.data.cardsData[this.data.index].card_id
        var status = 'collect'
        this.markCardStatus(box_id,card_id,status);

      }else{
        this.show();
      }
    }else{
      this.show();
    }
    this.setData({
      lastTabDiffTime:curTime
    });
  },


  // 点击卡片查看信息
  onShowCardAnswer:function(event){

    // 更新点击事件
    this.show();
    
    console.log(event.currentTarget.dataset)
    console.log('查看背面')
    var card_data = ''
    for (let i = 0, lenI = this.data.cardsData.length; i < lenI; ++i) {
      if(this.data.cardsData[i].card_id == event.currentTarget.dataset.card_id){
        card_data = this.data.cardsData[i]
        break
      }
    }
    if(this.data.bindCardId==card_data.card_id){
      this.setData({
        md:card_data.answer,
        bindCardId:''
      })
    }else{
      this.setData({
        md:card_data.answer,
        bindCardId:card_data.card_id
      })
    }
  },



  /**
   * 下拉刷新事件, 数据同步
   */
  onPullDownRefresh: function () {
    wx.showToast({
      title: '正在同步数据',
      icon: 'loading'
    });
    this.onLoad()
    wx.stopPullDownRefresh()

  },

    //上滑
    onReachBottom: function() {
    this.next()
  },

  /**
   * 加载模拟卡片数据（降级方案）
   */
  loadMockCards: function() {
    console.log('加载模拟卡片数据');
    
    const mockCards = [
      {
        box_id: 'demo_1',
        card_id: 'card_1',
        question: '什么是JavaScript？',
        answer: 'JavaScript是一种高级的、解释型的编程语言，主要用于网页开发。',
        card_color: 'blue',
        card_status: 'un_understand'
      },
      {
        box_id: 'demo_1',
        card_id: 'card_2',
        question: '什么是CSS？',
        answer: 'CSS（层叠样式表）用于描述HTML或XML文档的样式。',
        card_color: 'green',
        card_status: 'understand'
      },
      {
        box_id: 'demo_2',
        card_id: 'card_3',
        question: '什么是HTML？',
        answer: 'HTML（超文本标记语言）是创建网页的标准标记语言。',
        card_color: 'orange',
        card_status: 'collect'
      }
    ];

    const mockCheckbox = [
      {
        box_id: 'demo_1',
        box_name: '示例卡集1',
        checked: true
      },
      {
        box_id: 'demo_2',
        box_name: '示例卡集2',
        checked: true
      }
    ];

    this.setData({
      cardsData: mockCards,
      checkbox: mockCheckbox,
      all_box_id: 'demo_1,demo_2',
      order: 'down',
      index: 0
    });

    wx.showToast({
      title: '已加载示例数据',
      icon: 'success'
    });
  },

})