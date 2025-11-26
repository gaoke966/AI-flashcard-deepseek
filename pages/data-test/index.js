// 数据加载测试页面
const Api = require('../../utils/api.js');
const multiPlatformConfig = require('../../utils/multi-platform-config.js');
const errorHandler = require('../../utils/error-handler.js');
const app = getApp();

Page({
  data: {
    token: '',
    boxesResult: '',
    cardsResult: '',
    logs: []
  },

  onLoad: function () {
    this.addLog('数据测试页面加载完成');
    this.testToken();
  },

  addLog: function(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logs = this.data.logs;
    logs.push(`[${timestamp}] ${message}`);
    
    if (logs.length > 20) {
      logs.shift();
    }
    
    this.setData({
      logs: logs
    });
  },

  testToken: function() {
    this.addLog('开始测试token获取...');
    
    app.getUserToken((token) => {
      if (token) {
        this.setData({ token: token });
        this.addLog(`Token获取成功: ${token.substring(0, 20)}...`);
      } else {
        this.addLog('Token获取失败');
      }
    });
  },

  testBoxesApi: async function() {
    this.addLog('开始测试卡集API...');
    
    if (!this.data.token) {
      this.addLog('Token为空，先获取token');
      this.testToken();
      return;
    }

    try {
      const result = await multiPlatformConfig.safeApiCall(
        null,
        {
          url: Api.getUserBoxes() + this.data.token,
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
              box_id: 'test_1',
              box_name: '测试卡集1',
              box_color: 'blue',
              password: '1234'
            }
          ]
        }
      );

      this.addLog(`卡集API调用成功: ${JSON.stringify(result).substring(0, 100)}...`);
      this.setData({ boxesResult: JSON.stringify(result, null, 2) });

    } catch (error) {
      this.addLog(`卡集API调用失败: ${error.message}`);
      this.setData({ boxesResult: `错误: ${error.message}` });
    }
  },

  testCardsApi: async function() {
    this.addLog('开始测试卡片API...');
    
    if (!this.data.token) {
      this.addLog('Token为空，先获取token');
      this.testToken();
      return;
    }

    try {
      const result = await multiPlatformConfig.safeApiCall(
        null,
        {
          url: Api.getCards() + this.data.token,
          method: 'GET',
          data: {
            all_box_id: 'all',
            card_status: 'all',
            order: 'random',
            page: 1,
            limit: 10
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
          }
        },
        // 降级数据
        {
          code: "200",
          data: [
            {
              box_id: 'test_1',
              card_id: 'card_1',
              question: '测试问题',
              answer: '测试答案',
              card_color: 'blue'
            }
          ]
        }
      );

      this.addLog(`卡片API调用成功: ${JSON.stringify(result).substring(0, 100)}...`);
      this.setData({ cardsResult: JSON.stringify(result, null, 2) });

    } catch (error) {
      this.addLog(`卡片API调用失败: ${error.message}`);
      this.setData({ cardsResult: `错误: ${error.message}` });
    }
  },

  clearResults: function() {
    this.setData({
      boxesResult: '',
      cardsResult: '',
      logs: []
    });
    this.addLog('结果已清空');
  },

  onShareAppMessage: function() {
    return {
      title: '数据加载测试',
      path: '/pages/data-test/index'
    };
  }
});