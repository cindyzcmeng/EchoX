import React, { useState } from 'react'
import { PhotoUpload } from './components/PhotoUpload'
import { AIVideoProcessor } from './components/AIVideoProcessor'
import { TextInput } from './components/TextInput'
import { CardPreview } from './components/CardPreview'
import { Header } from './components/Header'
import { ESP32Interface } from './components/ESP32Interface'
import { ArrowLeft, Video, Camera } from 'lucide-react'
import type { CardData } from './types/index'

function App() {
  // 界面状态：'upload' 表示上传界面，'ai-video' 表示AI视频录制界面，'preview' 表示预览界面
  const [currentView, setCurrentView] = useState<'upload' | 'ai-video' | 'preview'>('upload')
  const [cardData, setCardData] = useState<CardData>({
    image: null,
    text: '',
    platform: 'wechat' // 默认设置为微信
  })

  const handleImageUpload = (image: string) => {
    setCardData(prev => ({ ...prev, image }))
    // 上传完照片后直接跳转到预览界面
    setCurrentView('preview')
  }

  const handleTextChange = (text: string) => {
    setCardData(prev => ({ ...prev, text }))
  }

  const handleEchoXImage = (image: string) => {
    setCardData(prev => ({ ...prev, image }))
    // EchoX拍照后也直接跳转到预览界面
    setCurrentView('preview')
  }

  const handleAIContentGenerated = (partialCardData: Partial<CardData>) => {
    setCardData(prev => ({ ...prev, ...partialCardData }))
    // AI生成内容后跳转到预览界面
    setCurrentView('preview')
  }

  const handleBackToUpload = () => {
    setCurrentView('upload')
  }

  const handleStartAIVideo = () => {
    setCurrentView('ai-video')
  }

  return (
    <div className="mobile-container">
      <Header />
      
      <main className="p-4 space-y-6 safe-bottom">
        {currentView === 'upload' ? (
          // 选择方式界面
          <>
            {/* AI视频录制 - 新功能 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">🤖 AI 智能创作</h2>
              <div className="card">
                <button
                  onClick={handleStartAIVideo}
                  className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 transition-colors active:scale-95 bg-gradient-to-br from-primary-50 to-blue-50"
                >
                  <Video className="w-12 h-12 text-primary-500 mb-3" />
                  <span className="text-lg font-medium text-primary-700 mb-1">录制视频 + AI生成</span>
                  <span className="text-sm text-gray-600 text-center">
                    录制10秒视频，AI自动提取画面、转录音频并生成文案
                  </span>
                </button>
                <div className="mt-3 text-xs text-gray-500 text-center bg-yellow-50 p-2 rounded">
                  💡 新功能：一键录制，AI帮你生成完美的社交媒体文案
                </div>
              </div>
            </section>

            {/* 传统上传方式 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">📸 传统方式</h2>
              <PhotoUpload onImageUpload={handleImageUpload} />
            </section>

            {/* EchoX Interface */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">📷 EchoX 相机</h2>
              <ESP32Interface onImageReceived={handleEchoXImage} />
            </section>
          </>
        ) : currentView === 'ai-video' ? (
          // AI视频录制和处理界面
          <>
            {/* 返回按钮 */}
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={handleBackToUpload}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回选择</span>
              </button>
            </div>

            {/* AI视频处理组件 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">🤖 AI 智能创作</h2>
              <AIVideoProcessor 
                platform={cardData.platform}
                onContentGenerated={handleAIContentGenerated}
              />
            </section>
          </>
        ) : (
          // 卡片预览界面
          <>
            {/* 返回按钮 */}
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={handleBackToUpload}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>重新上传</span>
              </button>
            </div>

            {/* Text Input - 放在预览界面上方 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">✏️ 编辑文字</h2>
              <TextInput 
                value={cardData.text}
                onChange={handleTextChange}
                platform={cardData.platform}
              />
              
              {/* 显示AI生成的额外信息 */}
              {(cardData.transcribedText || cardData.aiGeneratedText) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium text-blue-800">AI 处理信息</h4>
                  {cardData.transcribedText && (
                    <div>
                      <span className="text-xs text-blue-600 font-medium">音频转录：</span>
                      <p className="text-sm text-blue-700">{cardData.transcribedText}</p>
                    </div>
                  )}
                  {cardData.aiGeneratedText && cardData.aiGeneratedText !== cardData.text && (
                    <div>
                      <span className="text-xs text-blue-600 font-medium">AI原始文案：</span>
                      <p className="text-sm text-blue-700">{cardData.aiGeneratedText}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Card Preview - 放在文字输入下方 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">🎨 预览卡片</h2>
              <CardPreview cardData={cardData} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App 