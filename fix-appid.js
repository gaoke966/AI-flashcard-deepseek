#!/usr/bin/env node

/**
 * AppID快速修复脚本
 * 使用方法：node fix-appid.js <your_appid>
 */

const fs = require('fs');
const path = require('path');

// 需要更新的配置文件
const configFiles = [
  'project.config.json',
  'mini.project.json',
  'platforms.json'
];

function updateAppId(newAppId) {
  console.log('🔧 开始更新AppID配置...');
  console.log(`📱 新AppID: ${newAppId}`);
  
  let updatedFiles = 0;
  
  configFiles.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = content.replace(
          /"appid":\s*"wx[a-f0-9]{16}"/g,
          `"appid": "${newAppId}"`
        );
        
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ 已更新: ${filename}`);
        updatedFiles++;
      } else {
        console.log(`⚠️  文件不存在: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ 更新失败 ${filename}:`, error.message);
    }
  });
  
  console.log(`\n🎉 完成! 共更新了 ${updatedFiles} 个文件`);
  console.log('💡 请重新加载微信开发者工具以应用更改');
}

// 验证AppID格式
function validateAppId(appid) {
  const weixinPattern = /^wx[a-f0-9]{16}$/;
  return weixinPattern.test(appid);
}

// 命令行执行
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🚀 AppID快速修复工具');
    console.log('');
    console.log('使用方法:');
    console.log('  node fix-appid.js <your_appid>');
    console.log('');
    console.log('示例:');
    console.log('  node fix-appid.js wxd433ba57ae9f04da');
    console.log('');
    console.log('当前开发者AppID: wxd433ba57ae9f04da');
    process.exit(1);
  }
  
  const newAppId = args[0];
  
  if (!validateAppId(newAppId)) {
    console.error('❌ AppID格式不正确！应该是wx开头 + 16位十六进制字符');
    console.error('示例: wxd433ba57ae9f04da');
    process.exit(1);
  }
  
  updateAppId(newAppId);
}

if (require.main === module) {
  main();
}

module.exports = {
  updateAppId,
  validateAppId
};