import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Camera, AlertCircle } from 'lucide-react'

interface ESP32InterfaceProps {
  onImageReceived: (image: string) => void
}

export function ESP32Interface({ onImageReceived }: ESP32InterfaceProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastImage, setLastImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 模拟连接状态（实际项目中这里会是真实的EchoX设备通讯逻辑）
  const connectToEchoX = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      // 这里是预留的ESP32连接接口
      // 实际实现中会使用WebSocket或HTTP请求与ESP32通讯
      await new Promise(resolve => setTimeout(resolve, 2000))
      
             // 模拟连接失败（因为EchoX设备暂时不可用）
       throw new Error('EchoX设备暂时无法连接')
      
              // 以下是成功连接后的逻辑（当EchoX设备可用时取消注释）
        // setIsConnected(true)
        // startListeningForImages()
    } catch (err) {
             setError('连接失败：EchoX设备未找到或网络不可达')
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectFromEchoX = () => {
    setIsConnected(false)
    setError(null)
    // 实际实现中会关闭WebSocket连接
  }

  const requestImage = async () => {
    if (!isConnected) return
    
    try {
             // 这里是预留的拍照请求接口
       // 实际实现中会向EchoX设备发送拍照命令
       const response = await fetch('/api/echox/capture', { method: 'POST' })
      const data = await response.json()
      
      if (data.image) {
        setLastImage(data.image)
        onImageReceived(data.image)
      }
    } catch (err) {
      setError('拍照失败，请重试')
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
                     <span className="font-medium text-gray-700">EchoX 相机</span>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          {isConnected ? '已连接' : '未连接'}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

             <div className="text-sm text-gray-600">
         通过EchoX智能脖挂设备拍摄照片。请确保设备已连接到同一网络。
       </div>

      {!isConnected ? (
                <button
          onClick={connectToEchoX}
          disabled={isConnecting}
          className="btn-primary w-full"
        >
           {isConnecting ? '连接中...' : '连接 EchoX'}
         </button>
      ) : (
        <div className="space-y-2">
          <button
            onClick={requestImage}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>远程拍照</span>
          </button>
          
          <button
            onClick={disconnectFromEchoX}
            className="btn-secondary w-full"
          >
            断开连接
          </button>
        </div>
      )}

      {lastImage && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">最近拍摄:</span>
                     <img 
             src={lastImage} 
             alt="EchoX拍摄" 
             className="w-full h-32 object-cover rounded-lg"
           />
        </div>
      )}
    </div>
  )
} 