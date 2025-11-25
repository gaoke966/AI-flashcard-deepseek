const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function getDeepseekCompletion(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的教育助手，擅长创建高质量的学习内容。请用简洁清晰的中文回答。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用AI接口失败');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function getDeepseekFlashcards(prompt: string, systemPrompt: string, apiKey: string): Promise<any> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用AI接口失败');
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  
  // 尝试从响应中提取纯JSON
  try {
    // 查找第一个 [ 和最后一个 ] 之间的内容
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('解析JSON失败:', content);
    throw new Error('AI返回的数据格式不正确: ' + content);
  }
}