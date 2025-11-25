import { storage } from './storage'

// 用户信息接口
export interface UserInfo {
  nickName: string
  avatarUrl: string
  gender: number
  city: string
  province: string
  country: string
  language: string
}

// 授权状态
export interface AuthStatus {
  hasUserInfo: boolean
  canIUseGetUserProfile: boolean
  canIUseUserInfo: boolean
}

// 授权工具类
export class AuthService {
  private static readonly USER_INFO_KEY = 'userInfo'
  private static readonly AUTH_TOKEN_KEY = 'authToken'

  // 检查授权能力
  static checkAuthCapability(): AuthStatus {
    if (typeof wx === 'undefined') {
      return {
        hasUserInfo: false,
        canIUseGetUserProfile: false,
        canIUseUserInfo: false
      }
    }

    const canIUseGetUserProfile = wx.getUserProfile !== undefined
    const canIUseUserInfo = wx.getUserInfo !== undefined
    const userInfo = this.getUserInfo()

    return {
      hasUserInfo: !!userInfo,
      canIUseGetUserProfile,
      canIUseUserInfo
    }
  }

  // 获取用户信息
  static getUserInfo(): UserInfo | null {
    try {
      return storage.get<UserInfo>(this.USER_INFO_KEY)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 保存用户信息
  static saveUserInfo(userInfo: UserInfo): boolean {
    try {
      return storage.set(this.USER_INFO_KEY, userInfo)
    } catch (error) {
      console.error('保存用户信息失败:', error)
      return false
    }
  }

  // 清除用户信息
  static clearUserInfo(): boolean {
    try {
      storage.remove(this.USER_INFO_KEY)
      storage.remove(this.AUTH_TOKEN_KEY)
      return true
    } catch (error) {
      console.error('清除用户信息失败:', error)
      return false
    }
  }

  // 获取授权token
  static getAuthToken(): string | null {
    try {
      return storage.get<string>(this.AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('获取授权token失败:', error)
      return null
    }
  }

  // 保存授权token
  static saveAuthToken(token: string): boolean {
    try {
      return storage.set(this.AUTH_TOKEN_KEY, token)
    } catch (error) {
      console.error('保存授权token失败:', error)
      return false
    }
  }

  // 微信登录
  static wxLogin(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        reject(new Error('当前环境不支持微信登录'))
        return
      }

      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('微信登录失败'))
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '微信登录失败'))
        }
      })
    })
  }

  // 获取用户资料（getUserProfile方式，推荐）
  static getUserProfile(): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        reject(new Error('当前环境不支持获取用户资料'))
        return
      }

      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo
          this.saveUserInfo(userInfo)
          resolve(userInfo)
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '获取用户资料失败'))
        }
      })
    })
  }

  // 获取用户信息（getUserInfo方式，兼容旧版本）
  static getUserInfoOld(): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        reject(new Error('当前环境不支持获取用户信息'))
        return
      }

      wx.getUserInfo({
        success: (res) => {
          const userInfo = res.userInfo
          this.saveUserInfo(userInfo)
          resolve(userInfo)
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '获取用户信息失败'))
        }
      })
    })
  }

  // 统一的获取用户信息方法
  static async getUserInfoUnified(): Promise<UserInfo> {
    const authStatus = this.checkAuthCapability()
    
    // 优先使用 getUserProfile
    if (authStatus.canIUseGetUserProfile) {
      return await this.getUserProfile()
    }
    // 兼容使用 getUserInfo
    else if (authStatus.canIUseUserInfo) {
      return await this.getUserInfoOld()
    }
    // 如果都没有，返回模拟数据
    else {
      const mockUserInfo: UserInfo = {
        nickName: '访客用户',
        avatarUrl: '/static/images/default-avatar.png',
        gender: 0,
        city: '',
        province: '',
        country: '',
        language: 'zh_CN'
      }
      this.saveUserInfo(mockUserInfo)
      return mockUserInfo
    }
  }

  // 检查是否需要登录
  static needLogin(): boolean {
    const userInfo = this.getUserInfo()
    const authToken = this.getAuthToken()
    return !userInfo || !authToken
  }

  // 登出
  static logout(): boolean {
    try {
      this.clearUserInfo()
      
      if (typeof wx !== 'undefined') {
        // 清除微信登录状态
        wx.removeStorageSync('code')
      }
      
      return true
    } catch (error) {
      console.error('登出失败:', error)
      return false
    }
  }
}