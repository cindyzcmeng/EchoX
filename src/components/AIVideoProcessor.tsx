import { useState, useCallback } from 'react'
import { VideoCapture } from './VideoCapture'
import { extractFrameFromVideo, videoToFile } from '../utils/videoUtils'
import { createAIService } from '../services/aiService'
import { Brain, Image as ImageIcon, Type, Loader2 } from 'lucide-react'
import type { VideoRecordingData, CardData, SocialPlatform } from '../types'

interface AIVideoProcessorProps {
  platform: SocialPlatform
  onContentGenerated: (cardData: Partial<CardData>) => void
}

export function AIVideoProcessor({ platform, onContentGenerated }: AIVideoProcessorProps) {
  const [processingStage, setProcessingStage] = useState<
    'recording' | 'extracting' | 'transcribing' | 'ready' | 'generating' | 'completed' | 'error'
  >('recording')
  const [extractedImage, setExtractedImage] = useState<string | null>(null)
  const [transcribedText, setTranscribedText] = useState<string>('')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleVideoRecorded = useCallback(async (videoData: VideoRecordingData) => {
    try {
      setError(null)
      setProcessingStage('extracting')

      // 1. 从视频中提取画面
      const frameImage = await extractFrameFromVideo(videoData.videoBlob, 5)
      setExtractedImage(frameImage)

      setProcessingStage('transcribing')

      // 2. 尝试音频转录，如果失败则跳过
      const aiService = createAIService()
      let transcribedText = ''
      
      try {
        const videoFile = videoToFile(videoData.videoBlob, 'recording.webm')
        const transcriptionResult = await aiService.transcribeAudio(videoFile)
        transcribedText = transcriptionResult.text
        setTranscribedText(transcribedText)
      } catch (transcriptionError) {
        console.warn('音频转录失败，跳过转录步骤:', transcriptionError)
        setTranscribedText('音频转录失败，将基于图片生成文案')
      }

      // 停止在这里，等待用户点击生成按钮
      setProcessingStage('ready')

    } catch (err) {
      console.error('AI处理失败:', err)
      setError(err instanceof Error ? err.message : '处理失败，请重试')
      setProcessingStage('error')
    }
  }, [platform, onContentGenerated])

  const handleGenerateContent = useCallback(async () => {
    try {
      setError(null)
      setProcessingStage('generating')

      // 使用LLM生成文案
      const aiService = createAIService()
      const contentResult = await aiService.generateContent(
        transcribedText,
        platform
      )
      setGeneratedContent(contentResult.text)

      setProcessingStage('completed')

      // 回调传递生成的内容
      onContentGenerated({
        image: extractedImage || undefined,
        text: contentResult.text,
        transcribedText: transcribedText,
        extractedFrameUrl: extractedImage || undefined,
        aiGeneratedText: contentResult.text
      })

    } catch (err) {
      console.error('AI生成失败:', err)
      setError(err instanceof Error ? err.message : '生成失败，请重试')
      setProcessingStage('error')
    }
  }, [platform, extractedImage, transcribedText, onContentGenerated])

  const resetProcess = () => {
    setProcessingStage('recording')
    setExtractedImage(null)
    setTranscribedText('')
    setGeneratedContent('')
    setError(null)
  }

  const getStageInfo = () => {
    switch (processingStage) {
      case 'recording':
        return { icon: ImageIcon, text: '录制10秒视频', color: 'text-blue-500' }
      case 'extracting':
        return { icon: ImageIcon, text: '提取视频画面...', color: 'text-yellow-500' }
      case 'transcribing':
        return { icon: Type, text: '转录音频内容...', color: 'text-purple-500' }
      case 'ready':
        return { icon: Brain, text: '准备就绪，点击生成文案', color: 'text-blue-600' }
      case 'generating':
        return { icon: Brain, text: '生成智能文案...', color: 'text-green-500' }
      case 'completed':
        return { icon: Brain, text: '处理完成', color: 'text-green-600' }
      case 'error':
        return { icon: Brain, text: '处理失败', color: 'text-red-500' }
    }
  }

  if (processingStage === 'recording') {
    return (
      <div className="space-y-4">
        <VideoCapture onVideoRecorded={handleVideoRecorded} />
      </div>
    )
  }

  const stageInfo = getStageInfo()

  return (
    <div className="card space-y-4">
      {/* 处理状态显示 */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        {processingStage !== 'completed' && processingStage !== 'error' ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        ) : (
          <stageInfo.icon className={`w-5 h-5 ${stageInfo.color}`} />
        )}
        <span className={`font-medium ${stageInfo.color}`}>{stageInfo.text}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={resetProcess}
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            重新录制
          </button>
        </div>
      )}

      {/* 提取的画面预览 */}
      {extractedImage && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">提取的画面</h4>
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={extractedImage}
              alt="提取的视频画面"
              className="w-full h-32 object-cover"
            />
          </div>
        </div>
      )}

      {/* 转录文本 */}
      {transcribedText && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">音频转录</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">{transcribedText}</p>
          </div>
        </div>
      )}

      {/* AI生成按钮 */}
      {processingStage === 'ready' && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerateContent}
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            <Brain className="w-5 h-5" />
            <span>AI生成社媒分享图</span>
          </button>
        </div>
      )}

      {/* 生成的文案 */}
      {generatedContent && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">AI生成文案</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 whitespace-pre-wrap">{generatedContent}</p>
          </div>
        </div>
      )}

      {processingStage === 'completed' && (
        <div className="flex space-x-3">
          <button
            onClick={resetProcess}
            className="btn-secondary flex-1"
          >
            重新录制
          </button>
        </div>
      )}
    </div>
  )
} 