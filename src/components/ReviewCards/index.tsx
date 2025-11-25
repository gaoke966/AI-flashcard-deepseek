import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import FlashCard from '../FlashCard'
import { CardService } from '../../services/card'
import './index.scss'

interface Props {
  onCardRemoved?: () => void
}

interface State {
  markedCards: any[]
  currentIndex: number
  showAnswer: boolean
}

export default class ReviewCards extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      markedCards: [],
      currentIndex: 0,
      showAnswer: false
    }
  }

  componentDidMount() {
    this.loadMarkedCards()
  }

  loadMarkedCards = () => {
    try {
      const markedCards = CardService.getMarkedCards()
      this.setState({ markedCards })
    } catch (error) {
      console.error('加载标记卡片失败:', error)
    }
  }

  handlePrevious = () => {
    this.setState(prevState => ({
      currentIndex: Math.max(0, prevState.currentIndex - 1),
      showAnswer: false
    }))
  }

  handleNext = () => {
    this.setState(prevState => ({
      currentIndex: Math.min(prevState.markedCards.length - 1, prevState.currentIndex + 1),
      showAnswer: false
    }))
  }

  toggleAnswer = () => {
    this.setState(prevState => ({ showAnswer: !prevState.showAnswer }))
  }

  handleRemoveCard = () => {
    const { markedCards, currentIndex } = this.state
    
    if (markedCards.length === 0) return
    
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张卡片吗？',
      success: (res) => {
        if (res.confirm) {
          const newCards = markedCards.filter((_, index) => index !== currentIndex)
          
          try {
            // 先清空所有卡片，然后重新添加保留的卡片
            CardService.clearAllMarkedCards()
            newCards.forEach(card => {
              CardService.markCard(card.topic, card.question, card.answer)
            })
            
            this.setState({ 
              markedCards: newCards,
              currentIndex: Math.min(currentIndex, newCards.length - 1),
              showAnswer: false
            })
            
            if (this.props.onCardRemoved) {
              this.props.onCardRemoved()
            }
            
            Taro.showToast({
              title: '卡片已删除',
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

  render() {
    const { markedCards, currentIndex, showAnswer } = this.state
    const currentCard = markedCards[currentIndex]
    
    if (markedCards.length === 0) {
      return (
        <View className='review-cards empty'>
          <Text className='empty-icon'>📚</Text>
          <Text className='empty-text'>暂无标记的卡片</Text>
          <Text className='empty-hint'>在学习过程中标记的卡片会出现在这里</Text>
        </View>
      )
    }

    return (
      <View className='review-cards'>
        <View className='review-header'>
          <Text className='card-count'>
            卡片 {currentIndex + 1} / {markedCards.length}
          </Text>
        </View>

        <View className='navigation-buttons'>
          <Button 
            size='mini' 
            onClick={this.handlePrevious}
            disabled={currentIndex === 0}
          >
            ←
          </Button>
          
          <Button 
            size='mini' 
            onClick={this.handleNext}
            disabled={currentIndex === markedCards.length - 1}
          >
            →
          </Button>
        </View>

        {currentCard && (
          <View>
            <View className='card-topic'>
              <Text className='topic-label'>主题:</Text>
              <Text className='topic-text'>{currentCard.topic}</Text>
            </View>

            <FlashCard
              question={currentCard.question}
              answer={currentCard.answer}
              showAnswer={showAnswer}
              onToggleAnswer={this.toggleAnswer}
            />

            <View className='card-actions'>
              <Button 
                size='mini'
                onClick={this.handleRemoveCard}
              >
                删除卡片
              </Button>
            </View>
          </View>
        )}
      </View>
    )
  }
}