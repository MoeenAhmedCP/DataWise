import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type ClaudeMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function chatWithClaude(
  messages: ClaudeMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        })

        for await (const chunk of response) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }

        controller.close()
      } catch (error) {
        const fallback = 'I apologize, but I encountered an error processing your request. Please try again.'
        controller.enqueue(encoder.encode(fallback))
        controller.close()
      }
    },
  })

  return stream
}
