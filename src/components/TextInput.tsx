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

const suggestedTags = [
  '#生活记录', '#美好时光', '#日常分享', 
  '#今日心情', '#随手拍', '#生活感悟',
  '#美食日记', '#旅行记录', '#工作日常'
]

export function TextInput({ value, onChange, platform }: TextInputProps) {
  const maxLength = platformLimits[platform]
  const placeholder = platformPlaceholders[platform]
  const remainingChars = maxLength - value.length

  const addTag = (tag: string) => {
    const newText = value.trim() ? `${value} ${tag}` : tag
    if (newText.length <= maxLength) {
      onChange(newText)
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">文字内容</span>
        <span className={`text-xs font-medium ${
          remainingChars < 20 ? 'text-red-500' : 
          remainingChars < 50 ? 'text-orange-500' : 'text-gray-500'
        }`}>
          {remainingChars}/{maxLength}
        </span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input-field mobile-input resize-none h-24 leading-relaxed"
        rows={4}
        style={{ fontSize: '16px' }} // 防止iOS缩放
      />
      
      {/* 推荐标签 */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">推荐标签:</span>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.slice(0, 6).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              disabled={value.length + tag.length + 1 > maxLength}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 touch-manipulation no-tap-highlight ${
                value.length + tag.length + 1 > maxLength
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:scale-95'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* 快捷操作 */}
      <div className="flex space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onChange('')}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
          disabled={!value}
        >
          清空
        </button>
        <div className="flex-1"></div>
        <span className="text-xs text-gray-400">
          {platform === 'xiaohongshu' ? '支持换行' : '单行显示'}
        </span>
      </div>
    </div>
  )
} 