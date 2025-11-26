/**
 * 平台检测工具函数
 * 支持微信、支付宝、百度、字节跳动、QQ小程序、H5、App
 */

// 获取当前平台信息
function getPlatform() {
  try {
    // 运行时检测 - 更准确的环境判断
    if (typeof uni !== 'undefined') {
      // uni-app环境
      // #ifdef APP-PLUS
      if (uni.getSystemInfoSync().platform === 'android' || uni.getSystemInfoSync().platform === 'ios') {
        return 'app-plus';
      }
      // #endif
      
      // #ifdef H5
      if (uni.getSystemInfoSync().platform === 'browser') {
        return 'h5';
      }
      // #endif
    }
    
    // 微信环境检测
    if (typeof wx !== 'undefined') {
      // 检查是否为真正的微信小程序
      if (wx.request && wx.login && typeof wx.login === 'function' && !wx.onMemoryWarning) {
        return 'mp-weixin';
      }
    }
    
    // 编译时条件编译
    // #ifdef MP-WEIXIN
    return 'mp-weixin';
    // #endif
    
    // #ifdef MP-ALIPAY
    return 'mp-alipay';
    // #endif
    
    // #ifdef MP-BAIDU
    return 'mp-baidu';
    // #endif
    
    // #ifdef MP-TOUTIAO
    return 'mp-toutiao';
    // #endif
    
    // #ifdef MP-QQ
    return 'mp-qq';
    // #endif
    
    // #ifdef H5
    return 'h5';
    // #endif
    
    // #ifdef APP-PLUS
    return 'app-plus';
    // #endif
    
  } catch (error) {
    console.log('平台检测失败，使用默认值:', error);
  }
  
  return 'mp-weixin'; // 默认微信小程序
}

// 检测是否为微信小程序
function isWeixin() {
  return getPlatform() === 'mp-weixin';
}

// 检测是否为支付宝小程序
function isAlipay() {
  return getPlatform() === 'mp-alipay';
}

// 检测是否为百度小程序
function isBaidu() {
  return getPlatform() === 'mp-baidu';
}

// 检测是否为字节跳动小程序
function isToutiao() {
  return getPlatform() === 'mp-toutiao';
}

// 检测是否为QQ小程序
function isQQ() {
  return getPlatform() === 'mp-qq';
}

// 检测是否为H5
function isH5() {
  return getPlatform() === 'h5';
}

// 检测是否为App
function isApp() {
  return getPlatform() === 'app-plus';
}

// 获取平台特定的API调用
function getPlatformApi() {
  const platform = getPlatform();
  
  switch(platform) {
    case 'mp-weixin':
      return wx;
    case 'mp-alipay':
      return my;
    case 'mp-baidu':
      return swan;
    case 'mp-toutiao':
      return tt;
    case 'mp-qq':
      return qq;
    case 'h5':
      return {
        showToast: (options) => {
          alert(options.title);
        },
        showLoading: (options) => {
          console.log('Loading:', options.title);
        },
        hideLoading: () => {
          console.log('Hide loading');
        },
        navigateTo: (options) => {
          window.location.href = options.url;
        }
      };
    case 'app-plus':
      return plus;
    default:
      return wx; // 默认返回微信API
  }
}

// 平台适配的工具函数
function platformAdapter() {
  return {
    getPlatform,
    isWeixin,
    isAlipay,
    isBaidu,
    isToutiao,
    isQQ,
    isH5,
    isApp,
    getApi: getPlatformApi
  };
}

module.exports = {
  getPlatform,
  isWeixin,
  isAlipay,
  isBaidu,
  isToutiao,
  isQQ,
  isH5,
  isApp,
  getPlatformApi,
  platformAdapter
};