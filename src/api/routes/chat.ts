import { Hono } from "hono"
import { createAgentUIStreamResponse } from "ai"
import { createEstimateAgent } from '../agent'

interface Env {
  AI_GATEWAY_BASE_URL?: string
  AI_GATEWAY_API_KEY?: string
}

export const chatRoutes = new Hono<{ Bindings: Env }>()

chatRoutes.post("/messages", async (c) => {
  const { messages, projectContext } = await c.req.json()
  
  // Get environment variables from Hono context
  const env = c.env || {}
  
  // Check for AI configuration
  if (!env.AI_GATEWAY_BASE_URL || !env.AI_GATEWAY_API_KEY) {
    console.error("AI Gateway not configured for chat - missing AI_GATEWAY_BASE_URL or AI_GATEWAY_API_KEY")
    return c.json({ 
      error: "AI service not configured",
      details: "The AI chat service is not set up. Please configure the AI_GATEWAY_BASE_URL and AI_GATEWAY_API_KEY environment variables.",
      code: "AI_NOT_CONFIGURED"
    }, 503)
  }
  
  // Create agent with environment variables
  const estimateAgent = createEstimateAgent(env)
  
  // Prepend project context to messages if provided
  const contextMessage = projectContext ? {
    role: "user" as const,
    content: `[Current Project Context]
Property: ${projectContext.address || 'Not specified'}
Current Categories: ${projectContext.categories?.map((cat: { type: string, subtotal: number }) => `${cat.type} (${cat.subtotal.toLocaleString()})`).join(', ') || 'None'}
Total: ${projectContext.total?.toLocaleString() || '0'}

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
