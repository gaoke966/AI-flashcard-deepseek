import { View, Text } from '@tarojs/components'
import './index.scss'

interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  // 简单的Markdown解析，转换为小程序可显示的格式
  const parseMarkdown = (text: string) => {
    // 处理粗体 **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // 处理斜体 *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // 处理标题 # text
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    
    // 处理代码块 `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // 处理列表项
    text = text.replace(/^\* (.*$)/gim, '<li>$1</li>')
    
    // 处理换行
    text = text.replace(/\n/g, '<br/>')
    
    return text
  }

  return (
    <View 
      className='markdown-content'
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  )
}