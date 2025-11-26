/**
 * 简化的认证工具
 * 专门解决多端模式下的token获取问题
 */

// 生成模拟token的函数
function generateMockToken() {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 保存token到本地存储
function saveTokenToStorage(token) {
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync('simple_token', token);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('simple_token', token);
    }
    console.log('Token已保存到本地存储:', token.substring(0, 20) + '...');
  } catch (error) {
    console.error('保存token失败:', error);
  }
}

// 从本地存储获取token
function getTokenFromStorage() {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      return wx.getStorageSync('simple_token');
    } else if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('simple_token');
    }
  } catch (error) {
    console.error('读取token失败:', error);
  }
  return null;
}

// 清除本地token
function clearTokenFromStorage() {
  try {
    if (typeof wx !== 'undefined' && wx.removeStorageSync) {
      wx.removeStorageSync('simple_token');
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('simple_token');
    }
    console.log('本地token已清除');
  } catch (error) {
    console.error('清除token失败:', error);
  }
}

// 简单的微信登录（仅用于获取模拟token）
function simpleWeixinLogin() {
  return new Promise((resolve) => {
    // 在多端模式下，直接生成模拟token
    console.log('多端模式检测到，使用模拟token策略');
    
    setTimeout(() => {
      const mockToken = generateMockToken();
      saveTokenToStorage(mockToken);
      resolve(mockToken);
    }, 100); // 模拟异步延迟
  });
}

// 主要的token获取函数
async function getSimpleToken() {
  console.log('=== 开始获取简单token ===');
  
  // 1. 先检查本地存储
  const storedToken = getTokenFromStorage();
  if (storedToken) {
    console.log('从本地存储获取到token:', storedToken.substring(0, 20) + '...');
    return storedToken;
  }
  
  // 2. 尝试微信登录
  try {
    if (typeof wx !== 'undefined' && typeof wx.login === 'function') {
      console.log('尝试微信登录...');
      const token = await simpleWeixinLogin();
      console.log('获取到新token:', token.substring(0, 20) + '...');
      return token;
    }
  } catch (error) {
    console.error('微信登录失败:', error);
  }
  
  // 3. 降级到生成模拟token
  console.log('降级到生成模拟token');
  const fallbackToken = generateMockToken();
  saveTokenToStorage(fallbackToken);
  console.log('生成fallback token:', fallbackToken.substring(0, 20) + '...');
  return fallbackToken;
}

module.exports = {
  getSimpleToken,
  saveTokenToStorage,
  getTokenFromStorage,
  clearTokenFromStorage,
  generateMockToken
};