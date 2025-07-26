/**
 * 从视频中截取指定时间点的画面作为图片
 * @param videoBlob 视频Blob对象
 * @param timeInSeconds 截取时间点（秒）
 * @returns Promise<string> 返回图片的data URL
 */
export async function extractFrameFromVideo(
  videoBlob: Blob, 
  timeInSeconds: number = 5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('无法创建Canvas上下文'))
      return
    }
    
    video.onloadedmetadata = () => {
      // 设置canvas尺寸与视频一致
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // 确保截取时间不超过视频长度
      const seekTime = Math.min(timeInSeconds, video.duration - 0.1)
      video.currentTime = seekTime
    }
    
    video.onseeked = () => {
      try {
        // 将视频当前帧绘制到canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // 转换为图片data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        // 清理资源
        URL.revokeObjectURL(video.src)
        resolve(imageDataUrl)
      } catch (error) {
        reject(error)
      }
    }
    
    video.onerror = () => {
      reject(new Error('视频加载失败'))
    }
    
    // 设置视频源并开始加载
    video.src = URL.createObjectURL(videoBlob)
    video.load()
  })
}

/**
 * 将视频Blob转换为可以发送给API的格式
 * @param videoBlob 视频Blob对象
 * @returns Promise<File> 返回File对象
 */
export function videoToFile(videoBlob: Blob, filename: string = 'recording.webm'): File {
  return new File([videoBlob], filename, { type: videoBlob.type })
}

/**
 * 检查浏览器是否支持视频录制
 */
export function checkVideoRecordingSupport(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  )
}

/**
 * 获取支持的视频格式
 */
export function getSupportedVideoFormats(): string[] {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return []
  }

  const formats = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ]
  
  return formats.filter(format => {
    try {
      return MediaRecorder.isTypeSupported(format)
    } catch {
      return false
    }
  })
} 