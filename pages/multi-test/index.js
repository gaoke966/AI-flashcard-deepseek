// 多端功能测试页面
const multiPlatformConfig = require('../../utils/multi-platform-config.js');
const platform = require('../../utils/platform.js');

Page({
  data: {
    platformInfo: '',
    testResults: [],
    logs: []
  },

  onLoad: function () {
    this.initPlatformInfo();
    this.addLog('多端测试页面加载完成');
  },

  initPlatformInfo: function() {
    const platformInfo = {
      current: platform.getPlatform(),
      isWeixin: platform.isWeixin(),
      isH5: platform.isH5(),
      isApp: platform.isApp()
    };

    this.setData({
      platformInfo: JSON.stringify(platformInfo, null, 2)
    });
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

  // 测试网络请求
  testNetworkRequest: async function() {
    this.addLog('开始测试网络请求...');
    
    try {
      // 模拟API调用
      const result = await multiPlatformConfig.safeApiCall(
        null,
        {
          url: 'https://httpbin.org/get',
          method: 'GET',
          header: {
            'Content-Type': 'application/json'
          }
        },
        // 降级数据
        { success: true, message: '降级数据' }
      );
      
      this.addLog(`网络请求测试成功: ${result.data ? result.data.success : false}`);
      
      const testResults = this.data.testResults;
      testResults.push({ test: '网络请求', status: 'success', result: '成功' });
      this.setData({ testResults: testResults });
      
    } catch (error) {
      this.addLog(`网络请求测试失败: ${error.message}`);
      
      const testResults = this.data.testResults;
      testResults.push({ test: '网络请求', status: 'fail', result: error.message });
      this.setData({ testResults: testResults });
    }
  },

  // 测试存储功能
  testStorage: function() {
    this.addLog('开始测试存储功能...');
    
    try {
      const storageAdapter = multiPlatformConfig.getStorageAdapter();
      
      // 测试写入
      storageAdapter.setStorageSync('test_key', { data: 'test_value', timestamp: Date.now() });
      this.addLog('存储写入测试: 成功');
      
      // 测试读取
      const readData = storageAdapter.getStorageSync('test_key');
      this.addLog(`存储读取测试: ${readData ? '成功' : '失败'}`);
      
      if (readData && readData.data === 'test_value') {
        const testResults = this.data.testResults;
        testResults.push({ test: '存储功能', status: 'success', result: '读写正常' });
        this.setData({ testResults: testResults });
      } else {
        const testResults = this.data.testResults;
        testResults.push({ test: '存储功能', status: 'fail', result: '数据不匹配' });
        this.setData({ testResults: testResults });
      }
      
    } catch (error) {
      this.addLog(`存储功能测试失败: ${error.message}`);
      
      const testResults = this.data.testResults;
      testResults.push({ test: '存储功能', status: 'fail', result: error.message });
      this.setData({ testResults: testResults });
    }
  },

  // 测试导航功能
  testNavigation: function() {
    this.addLog('开始测试导航功能...');
    
    try {
      const navAdapter = multiPlatformConfig.getNavigationAdapter();
      
      // 测试Toast
      navAdapter.showToast({ title: '导航测试Toast', icon: 'success' });
      this.addLog('Toast功能测试: 成功');
      
      const testResults = this.data.testResults;
      testResults.push({ test: '导航Toast', status: 'success', result: '显示正常' });
      this.setData({ testResults: testResults });
      
    } catch (error) {
      this.addLog(`导航功能测试失败: ${error.message}`);
      
      const testResults = this.data.testResults;
      testResults.push({ test: '导航Toast', status: 'fail', result: error.message });
      this.setData({ testResults: testResults });
    }
  },

  // 测试网络状态
  testNetworkStatus: async function() {
    this.addLog('开始测试网络状态...');
    
    try {
      const isOnline = await multiPlatformConfig.checkNetworkAvailability();
      this.addLog(`网络状态检测: ${isOnline ? '在线' : '离线'}`);
      
      const testResults = this.data.testResults;
      testResults.push({ 
        test: '网络状态', 
        status: isOnline ? 'success' : 'warning', 
        result: isOnline ? '网络正常' : '网络离线' 
      });
      this.setData({ testResults: testResults });
      
    } catch (error) {
      this.addLog(`网络状态检测失败: ${error.message}`);
      
      const testResults = this.data.testResults;
      testResults.push({ test: '网络状态', status: 'fail', result: error.message });
      this.setData({ testResults: testResults });
    }
  },

  // 运行所有测试
  runAllTests: async function() {
    this.addLog('开始运行所有测试...');
    this.setData({ testResults: [] });
    
    await this.testNetworkStatus();
    await this.testNetworkRequest();
    this.testStorage();
    this.testNavigation();
    
    this.addLog('所有测试完成');
  },

  // 清空测试结果
  clearResults: function() {
    this.setData({
      testResults: [],
      logs: []
    });
    this.addLog('测试结果已清空');
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '多端功能测试',
      path: '/pages/multi-test/index'
    };
  }
});