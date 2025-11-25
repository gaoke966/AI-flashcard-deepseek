import { View, Text, Button } from '@tarojs/components'
import MarkdownContent from '../MarkdownContent'
import './index.scss'

interface FlashCardProps {
  question: string
  answer: string
  showAnswer?: boolean
  onToggleAnswer?: () => void
}

export default function FlashCard({ 
  question, 
  answer, 
  showAnswer = false, 
  onToggleAnswer 
}: FlashCardProps) {
  return (
    <View className='flashcard'>
      <View className='flashcard-content'>
        <View className='question-section'>
          <Text className='section-title'>问题</Text>
          <View className='question-content'>
            <MarkdownContent content={question} />
          </View>
        </View>

        <View className='toggle-button'>
          <Button 
            size='mini'
            type='primary'
            onClick={onToggleAnswer}
          >
            {showAnswer ? '隐藏答案' : '显示答案'}
          </Button>
        </View>

        {showAnswer && (
          <View className='answer-section'>
            <Text className='section-title'>答案</Text>
            <View className='answer-content'>
              <MarkdownContent content={answer} />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}