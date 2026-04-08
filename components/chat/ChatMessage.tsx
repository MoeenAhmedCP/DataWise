'use client'

import ReactMarkdown from 'react-markdown'
import { BarChart3 } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'

type ChatMessageProps = {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="bg-[#6366f1] rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm text-white">{message.content}</p>
          </div>
          <p className="text-[10px] text-[#71717a] text-right mt-1">{time}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full flex items-center justify-center shrink-0 mt-1">
        <BarChart3 className="w-3.5 h-3.5 text-[#6366f1]" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-[#18181b] border border-[#3f3f46] rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="text-sm text-[#fafafa] prose prose-sm prose-invert max-w-none
            [&_p]:mb-2 [&_p:last-child]:mb-0
            [&_ul]:my-2 [&_ul]:pl-4 [&_ul]:list-disc
            [&_ol]:my-2 [&_ol]:pl-4 [&_ol]:list-decimal
            [&_li]:mb-1
            [&_strong]:text-[#fafafa] [&_strong]:font-semibold
            [&_code]:bg-[#27272a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-[#6366f1]
            [&_pre]:bg-[#27272a] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0
          ">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        <p className="text-[10px] text-[#71717a] mt-1">{time}</p>
      </div>
    </div>
  )
}
