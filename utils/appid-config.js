/**
 * AppID配置管理工具
 * 用于动态切换和管理不同平台的AppID
 */

// 默认配置
const DEFAULT_CONFIG = {
  'mp-weixin': 'wxd433ba57ae9f04da',  // 您的AppID
  'mp-alipay': '',                   // 支付宝小程序AppID（需要申请）
  'mp-baidu': '',                    // 百度小程序AppID（需要申请）
  'mp-toutiao': '',                  // 字节跳动小程序AppID（需要申请）
  'mp-qq': '',                       // QQ小程序AppID（需要申请）
  'h5': '',                          // H5不需要AppID
  'app-plus': ''                     // App不需要AppID
};

// 开发环境配置
const DEV_CONFIG = {
  'mp-weixin': 'wxd433ba57ae9f04da',
  // 开发环境可以使用测试AppID
};

// 生产环境配置
const PROD_CONFIG = {
  'mp-weixin': 'wxd433ba57ae9f04da',  // 原始生产AppID
  // 生产环境正式AppID
};

/**
 * 获取当前平台的AppID
 * @param {string} platform - 平台名称
 * @param {boolean} isProduction - 是否生产环境
 * @returns {string} AppID
 */
function getAppId(platform = 'mp-weixin', isProduction = false) {
  const config = isProduction ? PROD_CONFIG : DEV_CONFIG;
  return config[platform] || DEFAULT_CONFIG[platform] || '';
}

/**
 * 设置AppID
 * @param {string} platform - 平台名称
 * @param {string} appid - AppID
 */
function setAppId(platform, appid) {
  DEFAULT_CONFIG[platform] = appid;
  console.log(`设置${platform}平台AppID为: ${appid}`);
}

/**
 * 获取所有平台的AppID配置
 * @returns {object} AppID配置对象
 */
function getAllAppIds() {
  return {
    default: DEFAULT_CONFIG,
    dev: DEV_CONFIG,
    prod: PROD_CONFIG
  };
}

/**
 * 验证AppID格式
 * @param {string} appid - AppID
 * @returns {boolean} 是否有效
 */
function validateAppId(appid) {
  // 微信小程序AppID格式验证
  const weixinPattern = /^wx[a-f0-9]{16}$/;
  
  if (weixinPattern.test(appid)) {
    return true;
  }
  
  // 支付宝小程序AppID格式验证
  const alipayPattern = /^[0-9]{16}$/;
  
  if (alipayPattern.test(appid)) {
    return true;
  }
  
  return false;
}

/**
 * 检查AppID是否配置
 * @param {string} platform - 平台名称
 * @returns {boolean} 是否已配置
 */
function isAppIdConfigured(platform) {
  const appid = getAppId(platform);
  return appid && appid.length > 0;
}

/**
 * 获取配置状态
 * @returns {object} 各平台配置状态
 */
function getConfigStatus() {
  const status = {};
  
  Object.keys(DEFAULT_CONFIG).forEach(platform => {
    status[platform] = {
      configured: isAppIdConfigured(platform),
      appid: getAppId(platform),
      valid: validateAppId(getAppId(platform))
    };
  });
  
  return status;
}

module.exports = {
  getAppId,
  setAppId,
  getAllAppIds,
  validateAppId,
  isAppIdConfigured,
  getConfigStatus,
  DEFAULT_CONFIG,
  DEV_CONFIG,
  PROD_CONFIG
};