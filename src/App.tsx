import React, { useState } from 'react'
import { PhotoUpload } from './components/PhotoUpload'
import { TextInput } from './components/TextInput'
import { CardPreview } from './components/CardPreview'
import { PlatformSelector } from './components/PlatformSelector'
import { Header } from './components/Header'
import { ESP32Interface } from './components/ESP32Interface'
import type { SocialPlatform, CardData } from './types/index'

function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('wechat')
  const [cardData, setCardData] = useState<CardData>({
    image: null,
    text: '',
    platform: 'wechat'
  })

  const handleImageUpload = (image: string) => {
    setCardData(prev => ({ ...prev, image }))
  }

  const handleTextChange = (text: string) => {
    setCardData(prev => ({ ...prev, text }))
  }

  const handlePlatformChange = (platform: SocialPlatform) => {
    setSelectedPlatform(platform)
    setCardData(prev => ({ ...prev, platform }))
  }

  const handleESP32Image = (image: string) => {
    setCardData(prev => ({ ...prev, image }))
  }

  return (
    <div className="mobile-container">
      <Header />
      
      <main className="p-4 space-y-6 safe-bottom">
        {/* Platform Selection */}
        <PlatformSelector 
          selectedPlatform={selectedPlatform}
          onPlatformChange={handlePlatformChange}
        />

        {/* Photo Upload Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">📸 上传照片</h2>
          <PhotoUpload onImageUpload={handleImageUpload} />
        </section>

        {/* ESP32 Interface */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">📷 ESP32 相机</h2>
          <ESP32Interface onImageReceived={handleESP32Image} />
        </section>

        {/* Text Input */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">✏️ 添加文字</h2>
          <TextInput 
            value={cardData.text}
            onChange={handleTextChange}
            platform={selectedPlatform}
          />
        </section>

        {/* Card Preview */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">🎨 预览卡片</h2>
          <CardPreview cardData={cardData} />
        </section>
      </main>
    </div>
  )
}

export default App 