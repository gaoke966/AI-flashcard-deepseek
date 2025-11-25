import { Component } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { DeepseekService } from '../../services/deepseek'
import { ErrorHandler } from '../../utils/request'
import './index.scss'

interface Props {
  apiKey: string
  onTopicSelect?: (topic: string) => void
  savedKeyword?: string
  savedTopics?: string[]
  onExplore?: (keyword: string, topics: string[]) => void
  onClear?: () => void
}

interface State {
  keyword: string
  topics: string[]
  isExploring: boolean
  error: string
}

export default class ExploreTopics extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      keyword: props.savedKeyword || '',
      topics: props.savedTopics || [],
      isExploring: false,
      error: ''
    }
  }

  handleKeywordChange = (e) => {
    this.setState({ keyword: e.detail.value })
  }

  handleExplore = async () => {
    const { keyword } = this.state
    const { apiKey } = this.props
    
    if (!apiKey) {
      this.setState({ error: '请先在设置中配置 API 密钥' })
      return
    }
    
    if (!keyword.trim()) {
      this.setState({ error: '请输入探索关键词' })
      return
    }

    this.setState({ isExploring: true, error: '' })

    try {
      // 调用真实的API
      const response = await DeepseekService.exploreTopics(keyword, apiKey)
      
      if (response.success && response.data) {
        this.setState({ 
          topics: response.data,
          isExploring: false
        })
        
        if (this.props.onExplore) {
          this.props.onExplore(keyword, response.data)
        }
        
        Taro.showToast({
          title: '探索完成',
          icon: 'success',
          duration: 2000
        })
      } else {
        throw new Error(response.error || '探索失败')
      }
      
    } catch (error) {
      ErrorHandler.show(error)
      this.setState({ 
        error: '探索失败，请重试',
        isExploring: false
      })
    }
  }

  handleTopicSelect = (topic: string) => {
    if (this.props.onTopicSelect) {
      this.props.onTopicSelect(topic)
    }
  }

  handleClear = () => {
    this.setState({ 
      keyword: '',
      topics: [],
      error: ''
    })
    
    if (this.props.onClear) {
      this.props.onClear()
    }
  }

  render() {
    const { keyword, topics, isExploring, error } = this.state

    return (
      <View className='explore-topics'>
        <View className='explore-header'>
          <Text className='header-title'>探索主题</Text>
          <Text className='header-subtitle'>
            输入关键词，AI会为您生成相关的学习主题
          </Text>
        </View>

        <View className='search-section'>
          <Input
            placeholder='输入探索的关键词，如：编程、历史、科学等'
            value={keyword}
            onInput={this.handleKeywordChange}
            className='search-input'
          />
          
          <View className='search-buttons'>
            <Button 
              type='primary'
              loading={isExploring}
              onClick={this.handleExplore}
              disabled={!keyword.trim() || isExploring}
              className='explore-button'
            >
              {isExploring ? '探索中...' : '开始探索'}
            </Button>
            
            {topics.length > 0 && (
              <Button 
                onClick={this.handleClear}
                className='clear-button'
              >
                清空
              </Button>
            )}
          </View>
        </View>

        {error && (
          <View className='error-section'>
            <Text className='error-text'>{error}</Text>
          </View>
        )}

        {topics.length > 0 && (
          <View className='topics-section'>
            <View className='topics-header'>
              <Text>🔍</Text>
              <Text className='topics-title'>
                发现 {topics.length} 个相关主题
              </Text>
            </View>
            
            <ScrollView scrollY className='topics-list'>
              {topics.map((topic, index) => (
                <View key={index} className='topic-item'>
                  <Button
                    size='mini'
                    onClick={() => this.handleTopicSelect(topic)}
                    className='topic-button'
                  >
                    {topic}
                  </Button>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View className='help-section'>
          <View className='help-item'>
            <Text>❓</Text>
            <Text className='help-text'>
              选择一个主题后会自动跳转到按主题生成页面
            </Text>
          </View>
          <View className='help-item'>
            <Text>⚡</Text>
            <Text className='help-text'>
              探索功能需要有效的 Deepseek API 密钥
            </Text>
          </View>
        </View>
      </View>
    )
  }
}