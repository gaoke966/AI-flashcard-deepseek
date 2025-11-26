/**
 * 网络状态监听工具
 * 多端兼容的网络状态检测和管理
 */

const platform = require('./platform.js');

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.networkType = 'unknown';
    this.listeners = [];
    this.api = platform.getPlatformApi();
    
    this.init();
  }

  /**
   * 初始化网络监听
   */
  init() {
    // 只在支持的平台上初始化
    if (typeof this.api.onNetworkStatusChange === 'function') {
      this.api.onNetworkStatusChange(this.handleNetworkChange.bind(this));
      this.getNetworkStatus();
    } else {
      console.log('当前平台不支持网络状态监听');
      // 在不支持的平台上，默认假设网络可用
      this.isConnected = true;
      this.networkType = 'wifi';
    }
  }

  /**
   * 处理网络状态变化
   */
  handleNetworkChange(res) {
    const wasConnected = this.isConnected;
    this.isConnected = res.isConnected;
    this.networkType = res.networkType;

    console.log('网络状态变化:', {
      isConnected: this.isConnected,
      networkType: this.networkType,
      wasConnected: wasConnected
    });

    // 通知所有监听器
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener({
          isConnected: this.isConnected,
          networkType: this.networkType,
          wasConnected: wasConnected
        });
      }
    });
  }

  /**
   * 获取当前网络状态
   */
  getNetworkStatus() {
    if (typeof this.api.getNetworkType === 'function') {
      this.api.getNetworkType({
        success: (res) => {
          this.isConnected = res.networkType !== 'none';
          this.networkType = res.networkType;
          console.log('当前网络状态:', {
            isConnected: this.isConnected,
            networkType: this.networkType
          });
        },
        fail: (err) => {
          console.error('获取网络状态失败:', err);
          // 获取失败时，默认假设网络可用
          this.isConnected = true;
          this.networkType = 'unknown';
        }
      });
    }
  }

  /**
   * 添加网络状态监听器
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      return true;
    }
    return false;
  }

  /**
   * 移除网络状态监听器
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 检查网络是否可用
   */
  isNetworkAvailable() {
    return this.isConnected;
  }

  /**
   * 获取网络类型
   */
  getNetworkType() {
    return this.networkType;
  }

  /**
   * 等待网络恢复
   */
  waitForNetwork(timeout = 30000) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve(true);
        return;
      }

      let timer = null;
      let listener = null;

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (listener) {
          this.removeListener(listener);
          listener = null;
        }
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error('等待网络连接超时'));
      }, timeout);

      listener = (status) => {
        if (status.isConnected) {
          cleanup();
          resolve(true);
        }
      };

      this.addListener(listener);
    });
  }

  /**
   * 网络请求包装器
   */
  async networkRequest(options) {
    if (!this.isConnected) {
      try {
        await this.waitForNetwork(10000);
      } catch (error) {
        throw new Error('网络不可用，请检查网络连接');
      }
    }

    return new Promise((resolve, reject) => {
      const requestMethod = typeof this.api.request === 'function' ? this.api.request : wx.request;
      
      requestMethod({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 显示网络错误提示
   */
  showNetworkError() {
    const msg = this.isConnected ? '网络连接正常' : '网络连接失败，请检查网络设置';
    
    if (typeof this.api.showToast === 'function') {
      this.api.showToast({
        title: msg,
        icon: this.isConnected ? 'success' : 'none',
        duration: 2000
      });
    } else {
      console.log(msg);
    }
  }
}

// 创建全局网络管理器实例
const networkManager = new NetworkManager();

module.exports = networkManager;