// Token调试脚本
// 可以在开发者工具控制台中运行来测试token获取

const app = getApp();
const AuthManager = require('./utils/auth.js');
const platform = require('./utils/platform.js');

console.log('=== Token调试开始 ===');

// 1. 检查平台
console.log('1. 当前平台:', platform.getPlatform());

// 2. 检查globalData
console.log('2. globalData.token:', app.globalData.token);

// 3. 直接测试AuthManager
console.log('3. 测试AuthManager.getAuthToken()...');
AuthManager.getAuthToken().then(token => {
  console.log('4. AuthManager返回token:', token);
  
  // 4. 手动设置到globalData
  app.globalData.token = token;
  console.log('5. 设置后globalData.token:', app.globalData.token);
  
  console.log('=== Token调试完成 ===');
}).catch(error => {
  console.error('AuthManager获取token失败:', error);
});

// 5. 测试app.getUserToken
console.log('6. 测试app.getUserToken...');
app.getUserToken(token => {
  console.log('7. getUserToken返回token:', token);
  console.log('8. getUserToken后globalData.token:', app.globalData.token);
});

console.log('=== 调试脚本结束 ===');