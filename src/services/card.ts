import { storage } from '../utils/storage'

export interface MarkedCard {
  id: string
  topic: string
  question: string
  answer: string
  created_at: string
}

// 卡片管理服务
export class CardService {
  private static readonly STORAGE_KEY = 'markedCards'

  // 标记卡片
  static markCard(topic: string, question: string, answer: string): boolean {
    try {
      const cards = this.getMarkedCards()
      const newCard: MarkedCard = {
        id: Date.now().toString(),
        topic,
        question,
        answer,
        created_at: new Date().toISOString()
      }
      
      cards.push(newCard)
      return storage.set(this.STORAGE_KEY, cards)
    } catch (error) {
      console.error('标记卡片失败:', error)
      return false
    }
  }

  // 取消标记卡片
  static unmarkCard(id: string): boolean {
    try {
      const cards = this.getMarkedCards()
      const filteredCards = cards.filter(card => card.id !== id)
      return storage.set(this.STORAGE_KEY, filteredCards)
    } catch (error) {
      console.error('取消标记卡片失败:', error)
      return false
    }
  }

  // 取消标记卡片（通过问题内容）
  static unmarkCardByQuestion(question: string): boolean {
    try {
      const cards = this.getMarkedCards()
      const filteredCards = cards.filter(card => card.question !== question)
      return storage.set(this.STORAGE_KEY, filteredCards)
    } catch (error) {
      console.error('取消标记卡片失败:', error)
      return false
    }
  }

  // 获取所有标记的卡片
  static getMarkedCards(): MarkedCard[] {
    try {
      const cards = storage.get<MarkedCard[]>(this.STORAGE_KEY, [])
      return cards || []
    } catch (error) {
      console.error('获取标记卡片失败:', error)
      return []
    }
  }

  // 清空所有标记的卡片
  static clearAllMarkedCards(): boolean {
    try {
      return storage.set(this.STORAGE_KEY, [])
    } catch (error) {
      console.error('清空标记卡片失败:', error)
      return false
    }
  }

  // 检查卡片是否已被标记
  static isCardMarked(question: string): boolean {
    const cards = this.getMarkedCards()
    return cards.some(card => card.question === question)
  }

  // 获取标记的卡片数量
  static getMarkedCardsCount(): number {
    return this.getMarkedCards().length
  }

  // 按主题分组获取标记的卡片
  static getMarkedCardsByTopic(): { [topic: string]: MarkedCard[] } {
    const cards = this.getMarkedCards()
    const grouped: { [topic: string]: MarkedCard[] } = {}
    
    cards.forEach(card => {
      if (!grouped[card.topic]) {
        grouped[card.topic] = []
      }
      grouped[card.topic].push(card)
    })
    
    return grouped
  }

  // 按创建时间排序获取标记的卡片
  static getMarkedCardsByDate(order: 'asc' | 'desc' = 'desc'): MarkedCard[] {
    const cards = this.getMarkedCards()
    return cards.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return order === 'desc' ? dateB - dateA : dateA - dateB
    })
  }

  // 导出标记的卡片
  static exportMarkedCards(): string {
    const cards = this.getMarkedCards()
    return JSON.stringify(cards, null, 2)
  }

  // 导入标记的卡片
  static importMarkedCards(jsonData: string): boolean {
    try {
      const cards = JSON.parse(jsonData) as MarkedCard[]
      
      // 验证数据格式
      if (!Array.isArray(cards)) {
        throw new Error('导入数据格式不正确')
      }
      
      // 验证每个卡片的格式
      for (const card of cards) {
        if (!card.id || !card.topic || !card.question || !card.answer) {
          throw new Error('卡片数据格式不完整')
        }
      }
      
      return storage.set(this.STORAGE_KEY, cards)
    } catch (error) {
      console.error('导入标记卡片失败:', error)
      return false
    }
  }
}