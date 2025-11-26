var Api = require('../../../utils/api.js');
var startX, endX;
var moveFlag = true;// 判断执行滑动事件
const app = getApp();
const platform = require('../../../utils/platform.js');
const errorHandler = require('../../../utils/error-handler.js');
Page({
  data: {
    showNot:false,
    index: 0,
    cardsData : [],
    
    all_box_id:null,
    order:'',
    page:1,
    limit:15,

    checkbox: [{
      box_id:null,
      box_name:null,
      checked:false
    }],
    orderType:[
      {value:"random",name:"随机排序", checked: 'true'},
      {value:"up",name:"升序排序"},
      {value:"down",name:"降序排序"}
    ]
  },

  /**
   * 多选框
   */
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  ChooseCheckbox(e) {
    let items = this.data.checkbox;
    let box_id = e.currentTarget.dataset.box_id;
    console.log(box_id,items)
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if (items[i].box_id == box_id) {
        items[i].checked = !items[i].checked;
        break
      }
    }
    console.log(box_id,items)
    this.setData({
      checkbox: items
    })
  },
  /**
   * 单选框
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
   * 监听加载数据
   */
  onLoad: function(options) {
    console.log('卡片页面加载，参数:', options);
    
    var that = this;
    
    // 添加错误处理和降级方案
    app.getUserToken(function(token) {
      if (token) {
        console.log("获取token成功，更新数据: " + token)
        console.log("globalData token: " + app.globalData.token)
        console.log("页面参数:", options)
        
        // 确保token已经设置到globalData
        if (!app.globalData.token) {
          app.globalData.token = token;
        }
        
        // 加载盒子数据（传递token参数）
        that.onLoadData(token)
        
        // 根据是否有卡片数据决定加载方式
        if(that.data.cardsData.length < 1){
          console.log("首次加载，加载所有卡片:", that.data.cardsData.length)
          var boxes_id = "all"
          var order = "random"
          that.getCArdsMethods(boxes_id, order)
        } else {
          var all_box_id = that.data.all_box_id
          var order = that.data.order
          that.getCArdsMethods(all_box_id, order)
        }
      } else {
        console.log("获取token失败，使用模拟数据")
        that.loadMockCards()
      }
    })

    // 修改回调函数前 
    // console.log("xxxx",options)
    // // 加载盒子
    // this.onLoadData()

    // if(this.data.cardsData.length <1){
    //   console.log("this.data.cardsData.length",this.data.cardsData.length)
    //   var boxes_id = "all"
    //   var order = "up"
    //   this.getCArdsMethods(boxes_id,order)
    // }else{
    //   var all_box_id =  this.data.all_box_id
    //   var order = this.data.order
    //   this.getCArdsMethods(all_box_id,order)
    // }

  },

  /**
   * 获取卡片的数据
   */
  onLoadData: function (token) {
    var that = this;
    
    // 使用传入的token参数，如果没有则使用globalData
    var currentToken = token || app.globalData.token;
    
    console.log('开始加载卡集数据，传入token:', token);
    console.log('开始加载卡集数据，globalData token:', app.globalData.token);
    console.log('开始加载卡集数据，使用token:', currentToken);
    
    // 添加错误处理和降级方案
    if (!currentToken) {
      console.log('Token为空，使用模拟数据');
      that.loadMockCards();
      return;
    }
    
    wx.request({
      url: Api.getUserBoxes() + currentToken,
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
          console.log('没有找到卡集数据，使用模拟数据');
          that.loadMockCards();
        }
      },
      fail: function(error) {
        console.error('获取卡集数据失败:', error);
        that.loadMockCards();
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
    
    console.log('开始获取卡片数据:', {
      all_box_id: all_box_id,
      order: order,
      token: currentToken
    });
    
    if (!currentToken) {
      console.log('Token为空，使用模拟卡片数据');
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
          
          // 显示成功提示
          errorHandler.showSuccess(`加载了${cardsData.length}张卡片`);
          
        } else if (isSuccess && cardsData.length === 0) {
          console.log('没有找到卡片数据，使用模拟数据');
          that.loadMockCards();
          
        } else {
          console.log('API响应格式异常或失败:', res.data);
          errorHandler.showModal({
            title: '获取卡片失败',
            content: '使用示例数据进行演示',
            showCancel: false
          }).then(() => {
            that.loadMockCards();
          });
        }
      },
      fail: function(error) {
        console.error('获取卡片数据失败:', error);
        errorHandler.handleNetworkError(error, '网络请求失败，使用示例数据');
        that.loadMockCards();
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
   * 更新卡的新选择方式
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
    wx.showToast({
      title: '正在更新数据',
      icon: 'loading'
    });
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
            that.next()

          }else{
            that.setData({
              page:0,
              index:-1
            })
            console.log("调用函数")
            that.next()
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

    if(that.data.index < that.data.cardsData.length -1){
      console.log('直接使用index'+ (that.data.index + 1) )
      that.setData({
        index:that.data.index + 1
      })
    }else{
      // 获取下一页分页的数据
      console.log(that.data.page + 1)
      console.log("最后一页 调用函数增加")
      this.nextCard()
    }
  },

  /**
   * 上一页
   */
  last: function() {
    this.setData({
      showNot: false
    })
    var that = this;
    if(that.data.index > 0){
      console.log('直接使用前一个index'+ (that.data.index - 1) )
      that.setData({
        index:that.data.index - 1
      })


    }else{
      // 获取最后一页的数据 index 指向 length

      that.setData({
        index:that.data.cardsData.length
      })
      that.last()

    }
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


   // 单击双击
  mytap: function(e){
    var curTime = e.timeStamp;
    var lastTime = this.data.lastTabDiffTime;
    if(lastTime > 0){
      if(curTime - lastTime < 300){
        console.log(e.timeStamp + '双击')

        var box_id = this.data.cardsData[this.data.index].box_id
        var card_id = this.data.cardsData[this.data.index].card_id
        var status = 'understand'
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


  //长按事件
  mylongtap: function(e){
      console.log(e.timeStamp + '- long tap')
      console.log('编辑卡片')

      var card_data = this.data.cardsData[this.data.index]

      wx.setStorage({
 
        key:"mod_card",
        
        data:card_data
        
       })

      wx.navigateTo({
        url: '../modCard/index?card_id=' + card_data.card_id +'&box_id'+card_data.box_id
      })
  },

  /**
   * 滑动
   */
  touchStart: function (e) {
    startX = e.touches[0].pageX; // 获取触摸时的原点
    console.log('开始')
    moveFlag = true;
  },
  
  // 触摸移动事件
  touchMove: function (e) {
    endX = e.touches[0].pageX; // 获取触摸时的原点
    if (moveFlag) {
      if (endX - startX > 50) {
        console.log("move right");
        this.last()
        moveFlag = false;
        
      }
      if (startX - endX > 50) {
        console.log("move left");
        // this.move2left();

        this.next();
        moveFlag = false;
      }
    }

  },
  // 触摸结束事件
  touchEnd: function (e) {
    moveFlag = true; // 回复滑动事件
    console.log('结束')
  },

  /**
   * 下拉刷新事件, 数据同步
   */
  onPullDownRefresh: function () {
    console.log('卡片页面下拉刷新');
    
    const api = platform.getPlatformApi();
    if (typeof api.showToast === 'function') {
      api.showToast({
        title: '正在同步数据',
        icon: 'loading'
      });
    }
    
    this.onLoad()
    
    setTimeout(() => {
      if (typeof wx.stopPullDownRefresh === 'function') {
        wx.stopPullDownRefresh();
      }
    }, 1000);
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
      order: 'random',
      index: 0
    });

    errorHandler.showSuccess('已加载示例卡片数据');
  },

})