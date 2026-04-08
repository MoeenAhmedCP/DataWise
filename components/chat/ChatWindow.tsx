'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import { Trash2, BarChart3 } from 'lucide-react'

const STARTERS = [
  'Why did signups drop recently?',
  "What's our best performing month?",
  'Compare this month to last month',
  'Which metrics are trending down?',
]

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    const assistantId = crypto.randomUUID()
    const assistantMsg: ChatMessageType = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed to get response')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I encountered an error. Please try again.' }
            : m
        )
      )
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-[#6366f1]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#fafafa]">DataWise AI</p>
            <p className="text-xs text-[#71717a]">Powered by Claude</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-[#6366f1]" />
            </div>
            <h3 className="text-base font-semibold text-[#fafafa] mb-1">Ask about your data</h3>
            <p className="text-sm text-[#71717a] mb-6 max-w-xs">
              I can analyze trends, compare periods, identify anomalies, and answer questions about your metrics.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] hover:border-[#6366f1]/50 rounded-xl text-sm text-[#fafafa] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}

        {streaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-[#6366f1]" />
            </div>
            <div className="bg-[#18181b] border border-[#3f3f46] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#71717a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#71717a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#71717a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input)}
          disabled={streaming}
        />
      </div>
    </div>
  )
}
