# 多端适配配置说明

## 📱 支持平台

- ✅ 微信小程序 (mp-weixin)
- ✅ 支付宝小程序 (mp-alipay)
- ✅ 百度小程序 (mp-baidu)
- ✅ 字节跳动小程序 (mp-toutiao)
- ✅ QQ小程序 (mp-qq)
- ✅ H5 (h5)
- ✅ App (app-plus)

## 🔧 配置文件说明

### 1. project.config.json
主配置文件，包含基本的项目设置和多端编译选项。

### 2. project.private.config.json
私有配置文件，用于覆盖主配置中的设置，适合本地开发环境配置。

### 3. mini.project.json
多端编译配置，包含各平台的特定编译选项。

### 4. platforms.json
各平台详细配置，包括权限、模块、分发设置等。

## 🚀 编译命令

### 微信小程序
```bash
# 使用微信开发者工具打开项目即可
```

### 其他平台编译
如需编译到其他平台，建议使用 uni-app 框架进行迁移：

```bash
# 安装 uni-app CLI
npm install -g @dcloudio/uvm

# 创建 uni-app 项目并迁移代码
```

## 📦 平台差异处理

### 1. API 差异
使用 `utils/platform.js` 进行平台检测和 API 适配：

```javascript
const platform = require('../../utils/platform.js');

// 检测平台
if (platform.isWeixin()) {
  // 微信特有逻辑
} else if (platform.isH5()) {
  // H5特有逻辑
}

// 获取平台API
const api = platform.getPlatformApi();
api.showToast({ title: '提示' });
```

### 2. 样式差异
使用条件编译处理样式差异：

```css
/* #ifdef MP-WEIXIN */
.weixin-specific {
  /* 微信特有样式 */
}
/* #endif */

/* #ifdef H5 */
.h5-specific {
  /* H5特有样式 */
}
/* #endif
```

### 3. 组件差异
各平台组件可能存在差异，需要针对性适配：

- 自定义导航栏：不同平台状态栏高度不同
- TabBar：H5和App端可能有额外适配
- 图片路径：确保相对路径正确

## ⚠️ 注意事项

### 1. 权限配置
不同平台需要的权限不同，已在 `platforms.json` 中配置基础权限。

### 2. API 兼容性
- 部分高级 API 在某些平台不可用
- H5 端部分功能需要 polyfill
- App 端需要额外配置原生模块

### 3. 样式适配
- 不同平台 rpx 单位转换可能有差异
- 状态栏高度需要动态获取
- 安全区域适配

### 4. 分发配置
- 各平台应用商店发布流程不同
- 证书和签名文件需要单独配置
- 应用图标和启动页需要适配各平台规范

## 🔄 更新维护

1. **定期更新**: 跟进各平台API更新
2. **测试覆盖**: 确保各平台功能正常
3. **性能优化**: 针对不同平台进行优化
4. **用户反馈**: 收集各平台用户使用反馈

## 📞 技术支持

如遇到多端适配问题，请：
1. 检查对应平台官方文档
2. 查看控制台错误信息
3. 使用条件编译进行平台特定处理
4. 参考本项目的平台适配实现