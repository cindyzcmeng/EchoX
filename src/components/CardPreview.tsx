import React, { useRef, useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import type { CardData, SocialPlatform } from '../types'

interface CardPreviewProps {
  cardData: CardData
}

const platformConfigs = {
  wechat: {
    aspectRatio: 1,
    bgColor: '#f0f8ff',
    textColor: '#333',
    name: '微信朋友圈'
  },
  weibo: {
    aspectRatio: 16/9,
    bgColor: '#fff5f5',
    textColor: '#333',
    name: '微博'
  },
  xiaohongshu: {
    aspectRatio: 3/4,
    bgColor: '#fffaf0',
    textColor: '#333',
    name: '小红书'
  }
}

export function CardPreview({ cardData }: CardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const config = platformConfigs[cardData.platform]

  const generateCard = async () => {
    if (!cardRef.current || !cardData.image) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.bgColor
      })
      
      const link = document.createElement('a')
      link.download = `echox-${cardData.platform}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('生成卡片失败:', error)
      alert('生成卡片失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const shareCard = async () => {
    if (!cardRef.current || !cardData.image) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.bgColor
      })
      
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `echox-card.png`, { type: 'image/png' })
          await navigator.share({
            files: [file],
            title: 'EchoX 生成的卡片',
            text: cardData.text
          })
        } else {
          // 降级到下载
          generateCard()
        }
      }, 'image/png')
    } catch (error) {
      console.error('分享失败:', error)
      generateCard()
    }
  }

  if (!cardData.image) {
    return (
      <div className="card">
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🖼️</div>
          <p>请先上传照片来预览卡片</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-800">
          {config.name} 卡片预览
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={shareCard}
            className="p-2 text-gray-600 hover:text-primary-500 transition-colors"
            title="分享"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={generateCard}
            disabled={isGenerating}
            className="p-2 text-gray-600 hover:text-primary-500 transition-colors"
            title="下载"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <div
          ref={cardRef}
          className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
          style={{
            maxWidth: '320px',
            backgroundColor: config.bgColor
          }}
        >
          {/* 图片区域 */}
          <div className="relative">
            <img
              src={cardData.image}
              alt="上传的照片"
              className="w-full h-auto block"
              crossOrigin="anonymous"
            />
            {cardData.platform === 'xiaohongshu' && (
              <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-xiaohongshu">📕</span>
              </div>
            )}
          </div>

          {/* 文字区域 */}
          <div className="p-4 border-t border-gray-100">
            {cardData.text ? (
              <div className="space-y-3">
                <p 
                  className="text-sm leading-relaxed break-words"
                  style={{ 
                    color: config.textColor,
                    fontSize: cardData.platform === 'xiaohongshu' ? '13px' : '14px'
                  }}
                >
                  {cardData.text}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                  <span className="font-medium">EchoX</span>
                  <span>{new Date().toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">
                在上方添加文字内容
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={generateCard}
          disabled={isGenerating}
          className="btn-primary flex-1 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? '生成中...' : '下载卡片'}</span>
        </button>
        
        <button
          onClick={shareCard}
          className="btn-secondary flex items-center justify-center space-x-2 px-6"
        >
          <Share2 className="w-4 h-4" />
          <span>分享</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        💡 点击分享可直接发送到社交应用，或下载后手动分享
      </div>
    </div>
  )
} 