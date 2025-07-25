import React from 'react'
import { Camera } from 'lucide-react'

export function Header() {
  return (
    <header className="safe-top bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="px-4 py-4">
        <div className="flex items-center space-x-2">
          <Camera className="w-6 h-6 text-primary-500" />
          <h1 className="text-xl font-bold text-gray-900">EchoX</h1>
          <span className="text-sm text-gray-500">社交卡片生成器</span>
        </div>
      </div>
    </header>
  )
} 