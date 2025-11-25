// API 配置
export const API_CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
}

// 生成闪卡的系统提示词
export const FLASHCARD_SYSTEM_PROMPT = `你是一个专业的教育助手，擅长创建高质量的学习内容。
请根据用户提供的内容生成学习闪卡，格式要求：
1. 严格按照JSON数组格式返回
2. 每个卡片包含question和answer字段
3. 问题要简洁明确，答案要准确详细
4. 返回格式示例：[{"question": "问题内容", "answer": "答案内容"}]`

// 探索主题的系统提示词
export const EXPLORE_TOPICS_SYSTEM_PROMPT = `你是一个专业的学习主题推荐助手。
请根据用户提供的关键词生成相关的学习主题，格式要求：
1. 严格按照JSON数组格式返回
2. 每个主题是一个字符串
3. 主题要相关性强，涵盖不同角度
4. 返回格式示例：["主题1", "主题2", "主题3"]`

// 闪卡生成提示词
export const generateFlashcardPrompt = (topic: string, content: string, cardCount: number, difficulty: string, mode: string): string => {
  if (mode === 'topic') {
    return `请围绕"${topic}"主题，生成${cardCount}张${difficulty}难度的学习闪卡。要求：
1. 问题要涵盖该主题的核心概念
2. 答案要详细且准确
3. 难度要符合${difficulty}标准
4. 确保内容的教育价值和实用性`
  } else {
    return `请基于以下内容，生成${cardCount}张学习闪卡：
    
内容：${content}

要求：
1. 提炼关键信息作为问题
2. 答案要准确且详细
3. 确保涵盖主要内容要点
4. 保持逻辑清晰`
  }
}

// 探索主题提示词
export const generateExplorePrompt = (keyword: string): string => {
  return `请围绕"${keyword}"关键词，生成10个相关的学习主题。要求：
1. 主题要具有学习价值
2. 涵盖不同难度层次
3. 从不同角度切入
4. 主题名称要简洁明了
5. 确保相关性和实用性`
}