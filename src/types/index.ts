export type SocialPlatform = 'wechat' | 'weibo' | 'xiaohongshu'

export interface CardData {
  image: string | null
  text: string
  platform: SocialPlatform
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