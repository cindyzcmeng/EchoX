import React from 'react'
import type { SocialPlatform } from '../types'

interface PlatformSelectorProps {
  selectedPlatform: SocialPlatform
  onPlatformChange: (platform: SocialPlatform) => void
}

const platforms = [
  { id: 'wechat' as const, name: '微信朋友圈', color: 'bg-wechat', emoji: '💬' },
  { id: 'weibo' as const, name: '微博', color: 'bg-weibo', emoji: '📢' },
  { id: 'xiaohongshu' as const, name: '小红书', color: 'bg-xiaohongshu', emoji: '📕' }
]

export function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <div className="card">
      <h3 className="text-base font-medium text-gray-800 mb-3">选择发布平台</h3>
      <div className="grid grid-cols-3 gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onPlatformChange(platform.id)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 active:scale-95
              ${selectedPlatform === platform.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{platform.emoji}</div>
              <div className="text-xs font-medium text-gray-700">{platform.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
} 