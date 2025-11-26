/**
 * 多端配置工具
 * 统一管理多端模式下的配置和降级策略
 */

const platform = require('./platform.js');
const errorHandler = require('./error-handler.js');

class MultiPlatformConfig {
  constructor() {
    this.currentPlatform = platform.getPlatform();
    this.api = platform.getPlatformApi();
    
    console.log(`多端配置初始化，当前平台: ${this.currentPlatform}`);
  }

  /**
   * 获取适配的请求方法
   */
  getRequestAdapter() {
    if (typeof this.api.request === 'function') {
      return this.api.request;
    } else if (typeof wx !== 'undefined' && typeof wx.request === 'function') {
      return wx.request;
    } else {
      // H5等环境的XMLHttpRequest降级
      return this.createXHRAdapter();
    }
  }

  /**
   * 创建XMLHttpRequest适配器
   */
  createXHRAdapter() {
    return function(options) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', options.url);
        
        // 设置请求头
        if (options.header) {
          Object.keys(options.header).forEach(key => {
            xhr.setRequestHeader(key, options.header[key]);
          });
        }
        
        // 处理响应
        xhr.onload = function() {
          try {
            const response = {
              data: JSON.parse(xhr.responseText),
              statusCode: xhr.status
            };
            
            if (xhr.status >= 200 && xhr.status < 300) {
              if (options.success) options.success(response);
              resolve(response);
            } else {
              if (options.fail) options.fail(response);
              reject(response);
            }
          } catch (error) {
            if (options.fail) options.fail(error);
            reject(error);
          }
        };
        
        xhr.onerror = function(error) {
          if (options.fail) options.fail(error);
          reject(error);
        };
        
        // 发送请求
        if (options.method === 'GET' || !options.data) {
          xhr.send();
        } else {
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(options.data));
        }
      });
    };
  }

  /**
   * 获取适配的导航方法
   */
  getNavigationAdapter() {
    return {
      navigateTo: (options) => {
        if (typeof this.api.navigateTo === 'function') {
          this.api.navigateTo(options);
        } else if (typeof wx !== 'undefined' && typeof wx.navigateTo === 'function') {
          wx.navigateTo(options);
        } else if (typeof window !== 'undefined') {
          window.location.href = options.url;
        }
      },
      
      reLaunch: (options) => {
        if (typeof this.api.reLaunch === 'function') {
          this.api.reLaunch(options);
        } else if (typeof wx !== 'undefined' && typeof wx.reLaunch === 'function') {
          wx.reLaunch(options);
        } else if (typeof window !== 'undefined') {
          window.location.href = options.url;
        }
      },
      
      showToast: (options) => {
        if (typeof this.api.showToast === 'function') {
          this.api.showToast(options);
        } else if (typeof wx !== 'undefined' && typeof wx.showToast === 'function') {
          wx.showToast(options);
        } else {
          alert(options.title || options.content);
        }
      },
      
      showModal: (options) => {
        if (typeof this.api.showModal === 'function') {
          return this.api.showModal(options);
        } else if (typeof wx !== 'undefined' && typeof wx.showModal === 'function') {
          return wx.showModal(options);
        } else {
          return Promise.resolve(confirm(options.content));
        }
      },
      
      showLoading: (options) => {
        if (typeof this.api.showLoading === 'function') {
          this.api.showLoading(options);
        } else if (typeof wx !== 'undefined' && typeof wx.showLoading === 'function') {
          wx.showLoading(options);
        } else {
          console.log('Loading:', options.title);
        }
      },
      
      hideLoading: () => {
        if (typeof this.api.hideLoading === 'function') {
          this.api.hideLoading();
        } else if (typeof wx !== 'undefined' && typeof wx.hideLoading === 'function') {
          wx.hideLoading();
        } else {
          console.log('Hide loading');
        }
      }
    };
  }

  /**
   * 获取适配的存储方法
   */
  getStorageAdapter() {
    return {
      setStorageSync: (key, data) => {
        try {
          if (typeof this.api.setStorageSync === 'function') {
            this.api.setStorageSync(key, data);
          } else if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') {
            wx.setStorageSync(key, data);
          } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(data));
          }
        } catch (error) {
          console.error('存储失败:', error);
        }
      },
      
      getStorageSync: (key) => {
        try {
          if (typeof this.api.getStorageSync === 'function') {
            return this.api.getStorageSync(key);
          } else if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
            return wx.getStorageSync(key);
          } else if (typeof localStorage !== 'undefined') {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
          }
        } catch (error) {
          console.error('读取存储失败:', error);
          return null;
        }
      },
      
      removeStorageSync: (key) => {
        try {
          if (typeof this.api.removeStorageSync === 'function') {
            this.api.removeStorageSync(key);
          } else if (typeof wx !== 'undefined' && typeof wx.removeStorageSync === 'function') {
            wx.removeStorageSync(key);
          } else if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.error('删除存储失败:', error);
        }
      }
    };
  }

  /**
   * 检查网络可用性
   */
  checkNetworkAvailability() {
    return new Promise((resolve) => {
      if (typeof this.api.getNetworkType === 'function') {
        this.api.getNetworkType({
          success: (res) => {
            resolve(res.networkType !== 'none');
          },
          fail: () => {
            resolve(true); // 假设网络可用
          }
        });
      } else if (typeof navigator !== 'undefined' && navigator.onLine) {
        resolve(navigator.onLine);
      } else {
        resolve(true); // 默认假设网络可用
      }
    });
  }

  /**
   * 安全的API调用包装器
   */
  async safeApiCall(apiFunction, options, fallbackData = null) {
    try {
      const isOnline = await this.checkNetworkAvailability();
      
      if (!isOnline) {
        console.warn('网络不可用，使用降级方案');
        if (fallbackData) {
          return { data: fallbackData, success: true };
        }
        throw new Error('网络不可用');
      }

      return new Promise((resolve, reject) => {
        const requestMethod = this.getRequestAdapter();
        
        requestMethod({
          ...options,
          success: resolve,
          fail: reject
        });
      });
      
    } catch (error) {
      console.error('API调用失败:', error);
      
      if (fallbackData) {
        console.log('使用降级数据');
        return { data: fallbackData, success: true };
      }
      
      throw error;
    }
  }
}

// 创建全局配置实例
const multiPlatformConfig = new MultiPlatformConfig();

module.exports = multiPlatformConfig;