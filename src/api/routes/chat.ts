import { Hono } from "hono"
import { createAgentUIStreamResponse } from "ai"
import { estimateAgent } from '../agent'

export const chatRoutes = new Hono()

chatRoutes.post("/messages", async (c) => {
  const { messages, projectContext } = await c.req.json()
  
  // Prepend project context to messages if provided
  const contextMessage = projectContext ? {
    role: "user" as const,
    content: `[Current Project Context]
Property: ${projectContext.address || 'Not specified'}
Current Categories: ${projectContext.categories?.map((c: { type: string, subtotal: number }) => `${c.type} ($${c.subtotal.toLocaleString()})`).join(', ') || 'None'}
Total: $${projectContext.total?.toLocaleString() || '0'}

Please help me refine this estimate.`
  } : null
  
  const augmentedMessages = contextMessage 
    ? [contextMessage, ...messages]
    : messages

  return createAgentUIStreamResponse({
    agent: estimateAgent,
    messages: augmentedMessages,
  })
})
