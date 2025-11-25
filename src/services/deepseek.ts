import { API_CONFIG, FLASHCARD_SYSTEM_PROMPT, EXPLORE_TOPICS_SYSTEM_PROMPT } from '../utils/api'

export interface Flashcard {
  question: string
  answer: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Deepseek API 服务
export class DeepseekService {
  static async callApi(prompt: string, systemPrompt: string, apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new Error('API 密钥不能为空')
    }

    try {
      // 在实际的小程序环境中，需要使用 wx.request 进行网络请求
      // 这里提供一个模拟的实现，实际使用时需要根据平台进行调整
      
      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        return new Promise((resolve, reject) => {
          wx.request({
            url: API_CONFIG.DEEPSEEK_API_URL,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            data: {
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 2000
            },
            success: (res) => {
              if (res.statusCode === 200) {
                const data = res.data as any
                if (data.choices && data.choices[0]) {
                  resolve(data.choices[0].message.content.trim())
                } else {
                  reject(new Error('API响应格式错误'))
                }
              } else {
                reject(new Error(`请求失败: ${res.statusCode}`))
              }
            },
            fail: (error) => {
              reject(new Error(`网络请求失败: ${error.errMsg}`))
            }
          })
        })
      } else {
        // H5环境 - 直接使用fetch
        const response = await fetch(API_CONFIG.DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `HTTP错误: ${response.status}`)
        }

        const data = await response.json()
        if (data.choices && data.choices[0]) {
          return data.choices[0].message.content.trim()
        } else {
          throw new Error('API响应格式错误')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('调用API时发生未知错误')
    }
  }

  // 生成闪卡
  static async generateFlashcards(
    prompt: string,
    apiKey: string
  ): Promise<ApiResponse<Flashcard[]>> {
    try {
      const response = await this.callApi(prompt, FLASHCARD_SYSTEM_PROMPT, apiKey)
      
      // 解析JSON响应
      let flashcards: Flashcard[]
      try {
        // 尝试提取JSON部分
        let jsonContent = response
        
        // 查找JSON数组的开始和结束
        const jsonStart = response.indexOf('[')
        const jsonEnd = response.lastIndexOf(']')
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = response.substring(jsonStart, jsonEnd + 1)
        }
        
        flashcards = JSON.parse(jsonContent)
        
        // 验证格式
        if (!Array.isArray(flashcards)) {
          throw new Error('响应不是有效的数组格式')
        }
        
        // 验证每个闪卡的格式
        for (const card of flashcards) {
          if (!card.question || !card.answer) {
            throw new Error('闪卡格式不正确，缺少question或answer字段')
          }
        }
        
      } catch (parseError) {
        console.error('解析JSON失败:', response)
        throw new Error('AI返回的数据格式不正确')
      }
      
      return {
        success: true,
        data: flashcards
      }
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成闪卡失败'
      }
    }
  }

  // 探索主题
  static async exploreTopics(
    keyword: string,
    apiKey: string
  ): Promise<ApiResponse<string[]>> {
    try {
      const prompt = `请围绕"${keyword}"关键词，生成10个相关的学习主题。要求：
1. 主题要具有学习价值
2. 涵盖不同难度层次
3. 从不同角度切入
4. 主题名称要简洁明了
5. 确保相关性和实用性

请严格按照JSON数组格式返回，例如：["主题1", "主题2", "主题3"]`

      const response = await this.callApi(prompt, EXPLORE_TOPICS_SYSTEM_PROMPT, apiKey)
      
      // 解析JSON响应
      let topics: string[]
      try {
        let jsonContent = response
        
        // 查找JSON数组的开始和结束
        const jsonStart = response.indexOf('[')
        const jsonEnd = response.lastIndexOf(']')
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = response.substring(jsonStart, jsonEnd + 1)
        }
        
        topics = JSON.parse(jsonContent)
        
        // 验证格式
        if (!Array.isArray(topics)) {
          throw new Error('响应不是有效的数组格式')
        }
        
        // 验证每个主题都是字符串
        for (const topic of topics) {
          if (typeof topic !== 'string') {
            throw new Error('主题格式不正确')
          }
        }
        
      } catch (parseError) {
        console.error('解析主题JSON失败:', response)
        throw new Error('AI返回的主题格式不正确')
      }
      
      return {
        success: true,
        data: topics
      }
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '探索主题失败'
      }
    }
  }
}