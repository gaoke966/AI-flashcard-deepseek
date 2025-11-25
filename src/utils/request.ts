// 网络请求工具类

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  timeout?: number
}

interface ResponseData<T> {
  data: T
  statusCode: number
  header: Record<string, string>
}

export class RequestService {
  // 基础请求方法
  static async request<T = any>(options: RequestOptions): Promise<ResponseData<T>> {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        method: 'GET',
        timeout: 10000,
        header: {
          'Content-Type': 'application/json'
        }
      }

      const requestOptions = {
        ...defaultOptions,
        ...options,
        header: {
          ...defaultOptions.header,
          ...options.header
        }
      }

      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        wx.request({
          url: requestOptions.url,
          method: requestOptions.method as any,
          data: requestOptions.data,
          header: requestOptions.header,
          timeout: requestOptions.timeout,
          success: (res) => {
            resolve({
              data: res.data as T,
              statusCode: res.statusCode,
              header: res.header
            })
          },
          fail: (error) => {
            reject(new Error(`请求失败: ${error.errMsg}`))
          }
        })
      } else {
        // H5环境
        const fetchOptions: RequestInit = {
          method: requestOptions.method,
          headers: requestOptions.header,
          body: requestOptions.method !== 'GET' ? JSON.stringify(requestOptions.data) : undefined
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout)

        fetch(requestOptions.url, {
          ...fetchOptions,
          signal: controller.signal
        })
          .then(async (response) => {
            clearTimeout(timeoutId)
            const data = await response.json()
            resolve({
              data,
              statusCode: response.status,
              header: Object.fromEntries(response.headers.entries())
            })
          })
          .catch((error) => {
            clearTimeout(timeoutId)
            reject(new Error(`请求失败: ${error.message}`))
          })
      }
    })
  }

  // GET 请求
  static get<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<ResponseData<T>> {
    const queryString = data ? '?' + new URLSearchParams(data).toString() : ''
    return this.request<T>({
      url: url + queryString,
      method: 'GET',
      header
    })
  }

  // POST 请求
  static post<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      header
    })
  }

  // PUT 请求
  static put<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      header
    })
  }

  // DELETE 请求
  static delete<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
      header
    })
  }
}

// 错误处理工具
export class ErrorHandler {
  static handle(error: any): string {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error && error.errMsg) {
      return error.errMsg
    }
    
    return '发生未知错误'
  }

  static show(error: any): void {
    const message = this.handle(error)
    
    if (typeof wx !== 'undefined') {
      // 微信小程序环境
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      })
    } else {
      // H5环境
      console.error(message)
      alert(message)
    }
  }
}