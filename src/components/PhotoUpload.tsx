import React, { useRef } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface PhotoUploadProps {
  onImageUpload: (image: string) => void
}

export function PhotoUpload({ onImageUpload }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result)
      }
      reader.readAsDataURL(file)
    }
    // 重置input以允许重复选择同一文件
    event.target.value = ''
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={openCamera}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors active:scale-95"
        >
          <Camera className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">拍照</span>
        </button>
        
        <button
          onClick={openFileSelector}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors active:scale-95"
        >
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">相册</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        💡 在手机上点击"拍照"会直接启动系统相机，拍照后自动返回
      </div>
      
      {/* 拍照专用input - 直接启动系统相机 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* 相册选择专用input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
} 