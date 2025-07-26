import type { AIServiceConfig, TranscriptionResult, LLMGenerationResult } from '../types'

class AIService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  /**
   * 使用Whisper API将音频转录为文字
   */
  async transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')
    formData.append('language', 'zh') // 指定中文识别

    try {
      console.log('Whisper API 请求信息:')
      console.log('URL:', `${this.config.baseUrl}/audio/transcriptions`)
      console.log('文件大小:', audioFile.size, 'bytes')
      console.log('文件类型:', audioFile.type)
      console.log('文件名:', audioFile.name)

      const response = await fetch(`${this.config.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
          // 注意：不要手动设置Content-Type，让浏览器自动设置multipart/form-data
        },
        body: formData
      })

      console.log('Whisper API 响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Whisper API 错误响应:', errorText)
        throw new Error(`转录失败: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Whisper API 成功响应:', result)
      
      return {
        text: result.text || '',
        language: result.language,
        confidence: result.confidence
      }
    } catch (error) {
      console.error('音频转录失败:', error)
      throw new Error(`音频转录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 使用LLM生成文案
   */
  async generateContent(
    transcribedText: string, 
    platform: string = 'wechat'
  ): Promise<LLMGenerationResult> {
    const prompt = this.buildPrompt(transcribedText, platform)

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // 使用最便宜的模型，只处理文本
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300, // 减少token使用
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`LLM生成失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        text: result.choices[0]?.message?.content || '',
        usage: result.usage
      }
    } catch (error) {
      console.error('内容生成失败:', error)
      throw new Error('内容生成失败，请重试')
    }
  }

  /**
   * 构建适合不同平台的提示词
   */
  private buildPrompt(transcribedText: string, platform: string): string {
    const platformSpecs = {
      wechat: {
        name: '微信朋友圈',
        style: '轻松自然，适合分享日常',
        length: '50-100字',
        features: '可以使用emoji表情'
      },
      weibo: {
        name: '微博',
        style: '简洁有趣，容易传播',
        length: '100-140字',
        features: '可以使用热门话题标签#'
      },
      xiaohongshu: {
        name: '小红书',
        style: '详细实用，种草分享',
        length: '100-200字',
        features: '可以使用emoji和换行排版'
      }
    }

    const spec = platformSpecs[platform as keyof typeof platformSpecs] || platformSpecs.wechat

    return `
请根据音频转录内容，为${spec.name}平台生成一段吸引人的文案。

音频转录内容：${transcribedText || '无音频内容'}

要求：
1. 文案风格：${spec.style}
2. 字数控制：${spec.length}
3. 特色要求：${spec.features}
4. 基于音频内容创作，如果内容为空则创作通用文案
5. 文案要自然流畅，不要生硬

请直接输出文案内容，不要包含其他说明文字。
`.trim()
  }
}

// 创建AI服务实例
export function createAIService(): AIService {
  // 正确的Vite环境变量读取方式
  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  // 调试信息
  console.log('Environment variables debug:')
  console.log('VITE_OPENAI_BASE_URL:', import.meta.env.VITE_OPENAI_BASE_URL)
  console.log('VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY)
  console.log('Using baseUrl:', baseUrl)

  if (!apiKey) {
    throw new Error('请在.env.local文件中配置VITE_OPENAI_API_KEY')
  }

  return new AIService({ baseUrl, apiKey })
}

export default AIService 