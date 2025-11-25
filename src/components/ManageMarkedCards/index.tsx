import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { CardService } from '../../services/card'
import './index.scss'

interface Props {
  onCardsUpdated?: () => void
}

interface State {
  markedCards: any[]
  isLoading: boolean
}

export default class ManageMarkedCards extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      markedCards: [],
      isLoading: false
    }
  }

  componentDidMount() {
    this.loadMarkedCards()
  }

  loadMarkedCards = () => {
    this.setState({ isLoading: true })
    
    try {
      const markedCards = CardService.getMarkedCards()
      this.setState({ markedCards, isLoading: false })
    } catch (error) {
      console.error('加载标记卡片失败:', error)
      this.setState({ isLoading: false })
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  handleDeleteCard = (index: number) => {
    const { markedCards } = this.state
    
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张卡片吗？',
      success: (res) => {
        if (res.confirm) {
          const newCards = markedCards.filter((_, i) => i !== index)
          
          try {
            // 先清空所有卡片，然后重新添加保留的卡片
            CardService.clearAllMarkedCards()
            newCards.forEach(card => {
              CardService.markCard(card.topic, card.question, card.answer)
            })
            
            this.setState({ markedCards: newCards })
            
            if (this.props.onCardsUpdated) {
              this.props.onCardsUpdated()
            }
            
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 2000
            })
          } catch (error) {
            console.error('删除卡片失败:', error)
            Taro.showToast({
              title: '删除失败',
              icon: 'error',
              duration: 2000
            })
          }
        }
      }
    })
  }

  handleClearAll = () => {
    const { markedCards } = this.state
    
    if (markedCards.length === 0) {
      Taro.showToast({
        title: '没有可清空的卡片',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有标记的卡片吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            const success = CardService.clearAllMarkedCards()
            if (success) {
              this.setState({ markedCards: [] })
              
              if (this.props.onCardsUpdated) {
                this.props.onCardsUpdated()
              }
              
              Taro.showToast({
                title: '清空成功',
                icon: 'success',
                duration: 2000
              })
            } else {
              throw new Error('清空失败')
            }
          } catch (error) {
            console.error('清空卡片失败:', error)
            Taro.showToast({
              title: '清空失败',
              icon: 'error',
              duration: 2000
            })
          }
        }
      }
    })
  }

  formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  render() {
    const { markedCards, isLoading } = this.state
    
    if (isLoading) {
      return (
        <View className='manage-marked-cards loading'>
          <Text>加载中...</Text>
        </View>
      )
    }
    
    if (markedCards.length === 0) {
      return (
        <View className='manage-marked-cards empty'>
          <Text className='empty-icon'>📁</Text>
          <Text className='empty-text'>暂无标记的卡片</Text>
          <Text className='empty-hint'>在学习过程中标记的卡片会出现在这里</Text>
        </View>
      )
    }

    return (
      <View className='manage-marked-cards'>
        <View className='manage-header'>
          <Text className='card-count'>共 {markedCards.length} 张卡片</Text>
          <Button 
            size='mini'
            onClick={this.handleClearAll}
          >
            清空全部
          </Button>
        </View>

        <ScrollView scrollY className='cards-list'>
          {markedCards.map((card, index) => (
            <View key={index} className='card-item'>
              <View className='marked-card'>
                <View className='card-header'>
                  <View className='card-topic'>
                    <Text className='topic-label'>主题:</Text>
                    <Text className='topic-text'>{card.topic}</Text>
                  </View>
                  <View className='card-date'>
                    <Text className='date-text'>{this.formatDate(card.created_at)}</Text>
                  </View>
                </View>
                
                <View className='card-content'>
                  <View className='card-question'>
                    <Text className='content-label'>问题:</Text>
                    <Text className='content-text'>{card.question}</Text>
                  </View>
                  
                  <View className='card-answer'>
                    <Text className='content-label'>答案:</Text>
                    <Text className='content-text'>{card.answer}</Text>
                  </View>
                </View>
                
                <View className='card-actions'>
                  <Button 
                    size='mini'
                    onClick={() => this.handleDeleteCard(index)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
}