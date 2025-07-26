export type SocialPlatform = 'wechat' | 'weibo' | 'xiaohongshu'

export interface CardData {
  image: string | null
  text: string
  platform: SocialPlatform
  // 新增AI生成相关字段
  videoUrl?: string
  extractedFrameUrl?: string
  transcribedText?: string
  aiGeneratedText?: string
}

export interface PlatformConfig {
  name: string
  color: string
  icon: string
  aspectRatio: number
  maxTextLength: number
  textStyle: {
    fontSize: number
    lineHeight: number
    fontWeight: string
  }
}

export interface ESP32Message {
  type: 'image' | 'status' | 'error'
  data: string
  timestamp: number
}

export interface CardTemplate {
  platform: SocialPlatform
  layout: 'top' | 'bottom' | 'overlay' | 'side'
  backgroundColor: string
  textColor: string
  borderRadius: number
}

// 新增AI和视频相关接口
export interface VideoRecordingData {
  videoBlob: Blob
  videoUrl: string
  duration: number
}

export interface AIServiceConfig {
  baseUrl: string
  apiKey: string
}

export interface TranscriptionResult {
  text: string
  confidence?: number
  language?: string
}

export interface LLMGenerationResult {
  text: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
} 