// 本地存储工具类

export interface StorageItem {
  [key: string]: any
}

// 存储标记的卡片
export const STORAGE_KEYS = {
  API_KEY: 'apiKey',
  MARKED_CARDS: 'markedCards',
  USER_SETTINGS: 'userSettings'
}

// 安全的存储操作
export const storage = {
  // 设置数据
  set<T>(key: string, value: T): boolean {
    try {
      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        wx.setStorageSync(key, JSON.stringify(value))
      } else {
        // 其他环境（H5等）
        localStorage.setItem(key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error('存储数据失败:', error)
      return false
    }
  },

  // 获取数据
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      let data: string | null
      
      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        data = wx.getStorageSync(key)
      } else {
        // 其他环境（H5等）
        data = localStorage.getItem(key)
      }
      
      if (!data) return defaultValue || null
      
      return JSON.parse(data)
    } catch (error) {
      console.error('获取数据失败:', error)
      return defaultValue || null
    }
  },

  // 删除数据
  remove(key: string): boolean {
    try {
      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        wx.removeStorageSync(key)
      } else {
        // 其他环境（H5等）
        localStorage.removeItem(key)
      }
      return true
    } catch (error) {
      console.error('删除数据失败:', error)
      return false
    }
  },

  // 清空所有数据
  clear(): boolean {
    try {
      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        wx.clearStorageSync()
      } else {
        // 其他环境（H5等）
        localStorage.clear()
      }
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }
}