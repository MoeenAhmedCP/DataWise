'use client'

import { useRef } from 'react'
import { Send } from 'lucide-react'

type ChatInputProps = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export default function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSubmit()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="flex items-end gap-3 bg-[#18181b] border border-[#3f3f46] rounded-xl p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); handleInput() }}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your data... (Enter to send, Shift+Enter for newline)"
        rows={1}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-[#fafafa] placeholder:text-[#71717a] resize-none focus:outline-none disabled:opacity-50"
        style={{ minHeight: '24px', maxHeight: '120px' }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="w-8 h-8 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center shrink-0 transition-colors"
      >
        <Send className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  )
}
