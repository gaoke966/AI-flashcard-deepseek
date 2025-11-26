/**
 * 多端错误处理工具
 * 统一处理各平台的错误提示和日志记录
 */

const platform = require('./platform.js');

class ErrorHandler {
  constructor() {
    this.api = platform.getPlatformApi();
  }

  /**
   * 显示错误提示
   * @param {string} message - 错误信息
   * @param {number} duration - 显示时长（毫秒）
   */
  showError(message, duration = 2000) {
    if (typeof this.api.showToast === 'function') {
      this.api.showToast({
        title: message,
        icon: 'none',
        duration: duration
      });
    } else {
      console.error('错误提示:', message);
      // 在Web端使用alert
      if (typeof alert !== 'undefined') {
        alert(message);
      }
    }
  }

  /**
   * 显示成功提示
   * @param {string} message - 成功信息
   * @param {number} duration - 显示时长（毫秒）
   */
  showSuccess(message, duration = 2000) {
    if (typeof this.api.showToast === 'function') {
      this.api.showToast({
        title: message,
        icon: 'success',
        duration: duration
      });
    } else {
      console.log('成功提示:', message);
    }
  }

  /**
   * 显示加载提示
   * @param {string} message - 加载信息
   */
  showLoading(message = '加载中...') {
    if (typeof this.api.showLoading === 'function') {
      this.api.showLoading({
        title: message,
        mask: true
      });
    } else {
      console.log('加载提示:', message);
    }
  }

  /**
   * 隐藏加载提示
   */
  hideLoading() {
    if (typeof this.api.hideLoading === 'function') {
      this.api.hideLoading();
    }
  }

  /**
   * 显示模态框
   * @param {object} options - 模态框选项
   */
  showModal(options) {
    const defaultOptions = {
      title: '提示',
      content: '',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消'
    };

    const finalOptions = Object.assign(defaultOptions, options);

    if (typeof this.api.showModal === 'function') {
      return new Promise((resolve) => {
        this.api.showModal({
          ...finalOptions,
          success: (res) => {
            resolve(res.confirm);
          },
          fail: () => {
            resolve(false);
          }
        });
      });
    } else {
      // Web端使用confirm
      const result = confirm(finalOptions.content);
      return Promise.resolve(result);
    }
  }

  /**
   * 统一的网络错误处理
   * @param {Error} error - 错误对象
   * @param {string} defaultMessage - 默认错误信息
   */
  handleNetworkError(error, defaultMessage = '网络请求失败') {
    console.error('网络错误:', error);
    
    let message = defaultMessage;
    
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请检查网络连接';
      } else if (error.errMsg.includes('fail')) {
        message = '网络连接失败，请检查网络设置';
      } else if (error.errMsg.includes('abort')) {
        message = '请求已取消';
      }
    }
    
    this.showError(message);
  }

  /**
   * 统一的API错误处理
   * @param {object} response - API响应
   * @param {string} defaultMessage - 默认错误信息
   */
  handleApiError(response, defaultMessage = '操作失败') {
    console.error('API错误:', response);
    
    let message = defaultMessage;
    
    if (response.data && response.data.message) {
      message = response.data.message;
    } else if (response.data && response.data.error) {
      message = response.data.error;
    }
    
    this.showError(message);
  }

  /**
   * 记录错误日志
   * @param {string} level - 日志级别 (error, warn, info)
   * @param {string} message - 日志信息
   * @param {any} data - 附加数据
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      platform: platform.getPlatform()
    };

    console[level] ? console[level](logEntry) : console.log(logEntry);
    
    // 可以在这里添加远程日志上报
    // this.reportLog(logEntry);
  }

  /**
   * 上报错误日志到远程服务器
   * @param {object} logData - 日志数据
   */
  async reportLog(logData) {
    try {
      // 这里可以实现日志上报逻辑
      // const Api = require('./api.js');
      // await Api.reportError(logData);
    } catch (error) {
      console.error('日志上报失败:', error);
    }
  }
}

// 创建全局错误处理器实例
const errorHandler = new ErrorHandler();

module.exports = errorHandler;