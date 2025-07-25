import React, { useRef, useState, useEffect } from 'react'
import { Camera, Upload, Image as ImageIcon, Smartphone } from 'lucide-react'

interface PhotoUploadProps {
  onImageUpload: (image: string) => void
}

export function PhotoUpload({ onImageUpload }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window
      setIsMobile(isMobileDevice || isTouchDevice)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
  }

  // 移动端：使用原生相机
  const handleMobileCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  // 桌面端：使用浏览器摄像头
  const startDesktopCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      setStream(mediaStream)
      setIsCapturing(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // 确保视频开始播放
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }
    } catch (error) {
      console.error('无法访问相机:', error)
      let errorMessage = '无法访问相机'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = '相机权限被拒绝，请在浏览器设置中允许访问相机'
        } else if (error.name === 'NotFoundError') {
          errorMessage = '未找到相机设备'
        } else if (error.name === 'NotReadableError') {
          errorMessage = '相机正在被其他应用使用'
        }
      }
      
      alert(errorMessage)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      // 设置canvas尺寸匹配视频
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        onImageUpload(imageData)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  return (
    <div className="card space-y-4">
      {isCapturing ? (
        // 桌面端摄像头预览
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
              style={{ transform: 'scaleX(-1)' }} // 镜像效果
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                点击下方按钮拍照
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={capturePhoto}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>📸 拍照</span>
            </button>
            <button
              onClick={stopCamera}
              className="btn-secondary px-6"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        // 拍照选项
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* 拍照按钮 */}
            <button
              onClick={isMobile ? handleMobileCamera : startDesktopCamera}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors touch-manipulation"
            >
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600">
                {isMobile ? '拍照' : '摄像头'}
              </span>
              {isMobile && (
                <span className="text-xs text-gray-500 mt-1">原生相机</span>
              )}
            </button>
            
            {/* 相册按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors touch-manipulation"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600">相册</span>
              <span className="text-xs text-gray-500 mt-1">选择照片</span>
            </button>
          </div>
          
          {/* 设备类型提示 */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            {isMobile ? (
              <>
                <Smartphone className="w-4 h-4" />
                <span>移动设备 - 使用原生相机体验</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>桌面设备 - 使用浏览器摄像头</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* 文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* 移动端原生相机输入 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
} 