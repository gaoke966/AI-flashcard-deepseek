/**
 * 多端认证管理工具
 * 处理不同平台的用户认证逻辑
 */

const platform = require('./platform.js');
const errorHandler = require('./error-handler.js');

class AuthManager {
  constructor() {
    this.currentPlatform = platform.getPlatform();
    this.api = platform.getPlatformApi();
  }

  /**
   * 获取用户认证信息
   */
  async getAuthToken() {
    console.log(`当前平台: ${this.currentPlatform}`);
    
    switch (this.currentPlatform) {
      case 'mp-weixin':
        return await this.getWeixinToken();
      
      case 'app-plus':
        return await this.getAppToken();
      
      case 'h5':
        return await this.getH5Token();
      
      default:
        return await this.getSimulatedToken();
    }
  }

  /**
   * 微信小程序登录
   */
  async getWeixinToken() {
    return new Promise((resolve, reject) => {
      try {
        wx.login({
          success: async (res) => {
            if (res.code) {
              console.log('微信登录成功，获取code:', res.code);
              
              try {
                const token = await this.exchangeToken(res.code);
                resolve(token);
              } catch (error) {
                console.error('token交换失败:', error);
                // 降级处理
                const fallbackToken = await this.getSimulatedToken();
                resolve(fallbackToken);
              }
            } else {
              console.error('微信登录未获取到code');
              const fallbackToken = await this.getSimulatedToken();
              resolve(fallbackToken);
            }
          },
          fail: async (error) => {
            console.error('微信登录失败:', error);
            const fallbackToken = await this.getSimulatedToken();
            resolve(fallbackToken);
          }
        });
      } catch (error) {
        console.error('微信登录异常:', error);
        const fallbackToken = await this.getSimulatedToken();
        resolve(fallbackToken);
      }
    });
  }

  /**
   * App端认证
   */
  async getAppToken() {
    console.log('App端认证');
    
    // 检查是否有原生登录能力
    if (typeof plus !== 'undefined' && plus.device) {
      try {
        // 使用设备信息生成唯一标识
        const deviceInfo = plus.device;
        const uniqueId = deviceInfo.imei || deviceInfo.uuid || 'unknown_device';
        const platformName = plus.os.name;
        const version = plus.os.version;
        
        const appToken = `app_${platformName}_${version}_${this.hashString(uniqueId)}`;
        console.log('生成App端token:', appToken);
        
        return appToken;
      } catch (error) {
        console.error('App设备信息获取失败:', error);
      }
    }
    
    // 降级到模拟token
    return await this.getSimulatedToken();
  }

  /**
   * H5端认证
   */
  async getH5Token() {
    console.log('H5端认证');
    
    try {
      // 尝试使用localStorage存储用户标识
      let userId = localStorage.getItem('user_id');
      
      if (!userId) {
        userId = 'h5_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_id', userId);
      }
      
      const h5Token = `h5_${userId}`;
      console.log('生成H5端token:', h5Token);
      
      return h5Token;
    } catch (error) {
      console.error('H5本地存储失败:', error);
      return await this.getSimulatedToken();
    }
  }

  /**
   * 获取模拟token（通用降级方案）
   */
  async getSimulatedToken() {
    console.log('使用模拟token');
    
    try {
      // 尝试从本地存储获取
      const storedToken = this.getStoredToken();
      if (storedToken) {
        console.log('使用存储的token:', storedToken);
        return storedToken;
      }
    } catch (error) {
      console.log('本地存储读取失败:', error);
    }
    
    // 生成新的token
    const newToken = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.setStoredToken(newToken);
      console.log('保存新token到本地:', newToken);
    } catch (error) {
      console.log('本地存储保存失败:', error);
    }
    
    return newToken;
  }

  /**
   * 交换code获取token（微信专用）
   */
  async exchangeToken(code) {
    const Api = require('./api.js');
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: Api.getOpenidToken() + code,
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.openid && res.data.openid_token) {
            // 获取最终token
            wx.request({
              url: Api.getToken() + res.data.openid_token,
              method: 'GET',
              success: (tokenRes) => {
                if (tokenRes.data && tokenRes.data.code === '200' && tokenRes.data.token) {
                  const token = tokenRes.data.token;
                  this.setStoredToken(token);
                  resolve(token);
                } else {
                  reject(new Error('获取token失败'));
                }
              },
              fail: (error) => {
                reject(error);
              }
            });
          } else {
            reject(new Error('获取openid失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 从本地存储获取token
   */
  getStoredToken() {
    try {
      // 微信小程序
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        return wx.getStorageSync('app_token');
      }
      
      // H5
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('app_token');
      }
      
      // App
      if (typeof plus !== 'undefined' && plus.storage) {
        return plus.storage.getItem('app_token');
      }
    } catch (error) {
      console.log('获取本地token失败:', error);
    }
    
    return null;
  }

  /**
   * 保存token到本地存储
   */
  setStoredToken(token) {
    try {
      // 微信小程序
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync('app_token', token);
        return;
      }
      
      // H5
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app_token', token);
        return;
      }
      
      // App
      if (typeof plus !== 'undefined' && plus.storage) {
        plus.storage.setItem('app_token', token);
        return;
      }
    } catch (error) {
      console.log('保存本地token失败:', error);
    }
  }

  /**
   * 简单字符串哈希
   */
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 清除认证信息
   */
  clearAuth() {
    try {
      // 微信小程序
      if (typeof wx !== 'undefined' && wx.removeStorageSync) {
        wx.removeStorageSync('app_token');
        return;
      }
      
      // H5
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('app_token');
        localStorage.removeItem('user_id');
        return;
      }
      
      // App
      if (typeof plus !== 'undefined' && plus.storage) {
        plus.storage.removeItem('app_token');
        return;
      }
    } catch (error) {
      console.log('清除认证信息失败:', error);
    }
  }
}

// 创建全局认证管理器实例
const authManager = new AuthManager();

module.exports = authManager;