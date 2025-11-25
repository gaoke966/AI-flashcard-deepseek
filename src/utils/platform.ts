// 平台适配工具类

export enum Platform {
  WEAPP = 'weapp',
  H5 = 'h5',
  RN = 'rn',
  SWAN = 'swan',
  ALIPAY = 'alipay',
  TT = 'tt',
  QQ = 'qq',
  JD = 'jd',
  QUICKAPP = 'quickapp'
}

export class PlatformService {
  // 获取当前平台
  static getCurrentPlatform(): Platform {
    // @ts-ignore
    const process = Taro.getEnv()
    
    switch (process) {
      case Taro.ENV_TYPE.WEAPP:
        return Platform.WEAPP
      case Taro.ENV_TYPE.H5:
        return Platform.H5
      case Taro.ENV_TYPE.RN:
        return Platform.RN
      case Taro.ENV_TYPE.SWAN:
        return Platform.SWAN
      case Taro.ENV_TYPE.ALIPAY:
        return Platform.ALIPAY
      case Taro.ENV_TYPE.TT:
        return Platform.TT
      case Taro.ENV_TYPE.QQ:
        return Platform.QQ
      case Taro.ENV_TYPE.JD:
        return Platform.JD
      case Taro.ENV_TYPE.QUICKAPP:
        return Platform.QUICKAPP
      default:
        return Platform.H5
    }
  }

  // 判断是否为微信小程序
  static isWeApp(): boolean {
    return this.getCurrentPlatform() === Platform.WEAPP
  }

  // 判断是否为H5
  static isH5(): boolean {
    return this.getCurrentPlatform() === Platform.H5
  }

  // 判断是否为原生App
  static isRN(): boolean {
    return this.getCurrentPlatform() === Platform.RN
  }

  // 判断是否支持某些特定功能
  static isSupported(feature: string): boolean {
    if (typeof wx === 'undefined') {
      return false
    }

    switch (feature) {
      case 'getUserProfile':
        return typeof wx.getUserProfile === 'function'
      case 'getUserInfo':
        return typeof wx.getUserInfo === 'function'
      case 'chooseMedia':
        return typeof wx.chooseMedia === 'function'
      case 'chooseMessageFile':
        return typeof wx.chooseMessageFile === 'function'
      case 'showModal':
        return typeof wx.showModal === 'function'
      case 'showToast':
        return typeof wx.showToast === 'function'
      case 'setClipboardData':
        return typeof wx.setClipboardData === 'function'
      case 'vibrateLong':
        return typeof wx.vibrateLong === 'function'
      case 'scanCode':
        return typeof wx.scanCode === 'function'
      case 'getLocation':
        return typeof wx.getLocation === 'function'
      case 'openLocation':
        return typeof wx.openLocation === 'function'
      default:
        return false
    }
  }

  // 获取平台特定的配置
  static getPlatformConfig(): {
    statusBarHeight: number
    navigationBarHeight: number
    tabBarHeight: number
    safeArea: {
      top: number
      bottom: number
      left: number
      right: number
    }
  } {
    const platform = this.getCurrentPlatform()
    
    const baseConfig = {
      statusBarHeight: 44,
      navigationBarHeight: 44,
      tabBarHeight: 50,
      safeArea: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    }

    switch (platform) {
      case Platform.WEAPP:
        // 微信小程序特定配置
        if (typeof wx !== 'undefined') {
          try {
            const systemInfo = wx.getSystemInfoSync()
            return {
              statusBarHeight: systemInfo.statusBarHeight || 44,
              navigationBarHeight: systemInfo.navigationBarHeight || 44,
              tabBarHeight: systemInfo.tabBarHeight || 50,
              safeArea: systemInfo.safeArea || baseConfig.safeArea
            }
          } catch (error) {
            console.warn('获取系统信息失败，使用默认配置')
          }
        }
        break
      case Platform.H5:
        // H5平台特定配置
        return {
          ...baseConfig,
          statusBarHeight: 0,
          navigationBarHeight: 44
        }
      case Platform.RN:
        // React Native平台特定配置
        return {
          ...baseConfig,
          statusBarHeight: 20,
          navigationBarHeight: 56
        }
    }

    return baseConfig
  }

  // 获取屏幕信息
  static getScreenInfo(): {
    width: number
    height: number
    pixelRatio: number
    windowWidth: number
    windowHeight: number
  } {
    const baseInfo = {
      width: 375,
      height: 667,
      pixelRatio: 2,
      windowWidth: 375,
      windowHeight: 667
    }

    if (typeof wx !== 'undefined') {
      try {
        const systemInfo = wx.getSystemInfoSync()
        return {
          width: systemInfo.screenWidth || baseInfo.width,
          height: systemInfo.screenHeight || baseInfo.height,
          pixelRatio: systemInfo.pixelRatio || baseInfo.pixelRatio,
          windowWidth: systemInfo.windowWidth || baseInfo.windowWidth,
          windowHeight: systemInfo.windowHeight || baseInfo.windowHeight
        }
      } catch (error) {
        console.warn('获取屏幕信息失败，使用默认配置')
      }
    }

    return baseInfo
  }

  // 判断是否为移动设备
  static isMobile(): boolean {
    if (this.isH5()) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    return true
  }

  // 判断是否为iOS设备
  static isIOS(): boolean {
    if (typeof wx !== 'undefined') {
      try {
        const systemInfo = wx.getSystemInfoSync()
        return systemInfo.system.toLowerCase().includes('ios')
      } catch (error) {
        return false
      }
    }
    
    if (this.isH5()) {
      return /iPad|iPhone|iPod/.test(navigator.userAgent)
    }
    
    return false
  }

  // 判断是否为Android设备
  static isAndroid(): boolean {
    if (typeof wx !== 'undefined') {
      try {
        const systemInfo = wx.getSystemInfoSync()
        return systemInfo.system.toLowerCase().includes('android')
      } catch (error) {
        return false
      }
    }
    
    if (this.isH5()) {
      return /Android/.test(navigator.userAgent)
    }
    
    return false
  }
}