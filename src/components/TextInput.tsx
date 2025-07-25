import React from 'react'
import type { SocialPlatform } from '../types'

interface TextInputProps {
  value: string
  onChange: (text: string) => void
  platform: SocialPlatform
}

const platformLimits = {
  wechat: 200,
  weibo: 140,
  xiaohongshu: 1000
}

const platformPlaceholders = {
  wechat: '分享你的精彩时刻...',
  weibo: '此刻想说的话...',
  xiaohongshu: '记录美好生活...'
}

export function TextInput({ value, onChange, platform }: TextInputProps) {
  const maxLength = platformLimits[platform]
  const placeholder = platformPlaceholders[platform]
  const remainingChars = maxLength - value.length

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">文字内容</span>
        <span className={`text-xs ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
          {remainingChars}/{maxLength}
        </span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input-field resize-none h-24"
        rows={4}
      />
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(value + ' #生活记录')}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
        >
          #生活记录
        </button>
        <button
          onClick={() => onChange(value + ' #美好时光')}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
        >
          #美好时光
        </button>
        <button
          onClick={() => onChange(value + ' #日常分享')}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
        >
          #日常分享
        </button>
      </div>
    </div>
  )
} 