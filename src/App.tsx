import React, { useState } from 'react'
import { PhotoUpload } from './components/PhotoUpload'
import { TextInput } from './components/TextInput'
import { CardPreview } from './components/CardPreview'
import { Header } from './components/Header'
import { ESP32Interface } from './components/ESP32Interface'
import { ArrowLeft } from 'lucide-react'
import type { CardData } from './types/index'

function App() {
  // 界面状态：'upload' 表示上传界面，'preview' 表示预览界面
  const [currentView, setCurrentView] = useState<'upload' | 'preview'>('upload')
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

  const handleBackToUpload = () => {
    setCurrentView('upload')
  }

  return (
    <div className="mobile-container">
      <Header />
      
      <main className="p-4 space-y-6 safe-bottom">
        {currentView === 'upload' ? (
          // 照片上传界面
          <>
            {/* Photo Upload Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">📸 上传照片</h2>
              <PhotoUpload onImageUpload={handleImageUpload} />
            </section>

            {/* EchoX Interface */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">📷 EchoX 相机</h2>
              <ESP32Interface onImageReceived={handleEchoXImage} />
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
              <h2 className="text-lg font-semibold text-gray-800">✏️ 添加文字</h2>
              <TextInput 
                value={cardData.text}
                onChange={handleTextChange}
                platform={cardData.platform}
              />
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