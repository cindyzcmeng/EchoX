import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Video, Square, Camera, RotateCcw } from 'lucide-react'
import type { VideoRecordingData } from '../types'

interface VideoCaptureProps {
  onVideoRecorded: (data: VideoRecordingData) => void
}

export function VideoCapture({ onVideoRecorded }: VideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const videoInputRef = useRef<HTMLInputElement>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }
    checkMobile()
  }, [])

  const startCamera = useCallback(async () => {
    // 移动设备使用系统摄像头
    if (isMobile) {
      videoInputRef.current?.click()
      return
    }

    try {
      setError(null)
      const constraints = {
        video: {
          facingMode: 'environment', // 后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true // 需要音频用于Whisper转录
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      setHasPermission(true)
    } catch (err) {
      console.error('启动摄像头失败:', err)
      setError('无法访问摄像头或麦克风，请检查权限设置')
    }
  }, [isMobile])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setHasPermission(false)
  }, [])

  const handleVideoFile = useCallback((file: File) => {
    if (file) {
      const videoBlob = new Blob([file], { type: file.type })
      const videoUrl = URL.createObjectURL(videoBlob)
      
      onVideoRecorded({
        videoBlob,
        videoUrl,
        duration: 10
      })
    }
  }, [onVideoRecorded])

  const startRecording = useCallback(async () => {
    // 移动设备直接调用系统摄像头
    if (isMobile) {
      videoInputRef.current?.click()
      return
    }

    if (!streamRef.current) {
      await startCamera()
      return
    }

    try {
      chunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus' // 包含音频
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' })
        const videoUrl = URL.createObjectURL(videoBlob)
        
        onVideoRecorded({
          videoBlob,
          videoUrl,
          duration: 10
        })
        
        stopCamera()
      }
      
      setIsRecording(true)
      setCountdown(10)
      mediaRecorder.start()
      
      // 10秒倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      console.error('开始录制失败:', err)
      setError('录制失败，请重试')
    }
  }, [onVideoRecorded, startCamera, stopCamera, isMobile, handleVideoFile])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setCountdown(0)
    }
  }, [])

  const resetCamera = useCallback(() => {
    stopCamera()
    setError(null)
  }, [stopCamera])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="card space-y-4">
      {/* 隐藏的视频录制input - 用于移动设备 */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleVideoFile(file)
          }
          // 重置input以允许重复选择
          e.target.value = ''
        }}
        className="hidden"
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={resetCamera}
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            重试
          </button>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="text-white text-6xl font-bold">
              {countdown}
            </div>
          </div>
        )}
        
        {!hasPermission && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-75">点击下方按钮启动摄像头</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {!hasPermission ? (
          <button
            onClick={startCamera}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
            disabled={!!error}
          >
            <Camera className="w-5 h-5" />
            <span>{isMobile ? '录制视频' : '启动摄像头'}</span>
          </button>
        ) : (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Video className="w-5 h-5" />
                <span>{isMobile ? '录制视频' : '开始录制 (10秒)'}</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="w-5 h-5" />
                <span>停止录制 ({countdown}s)</span>
              </button>
            )}
            
            <button
              onClick={resetCamera}
              className="btn-secondary flex items-center justify-center px-4"
              disabled={isRecording}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        💡 {isMobile ? '点击录制视频，系统将自动提取画面并转录音频内容' : '录制10秒视频，系统将自动提取画面并转录音频内容'}
      </div>
    </div>
  )
} 