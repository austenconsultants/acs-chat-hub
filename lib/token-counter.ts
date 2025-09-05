export interface TokenCount {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export function estimateTokens(text: string, model: string): number {
  // Rough estimation: 1 token ≈ 4 characters for most models
  // More accurate for GPT models, approximation for others
  const baseCount = Math.ceil(text.length / 4)

  // Model-specific adjustments
  switch (model) {
    case "gpt-4":
    case "gpt-4-turbo":
    case "gpt-4o":
      return Math.ceil(baseCount * 1.0) // Most accurate
    case "gpt-3.5-turbo":
      return Math.ceil(baseCount * 0.95)
    case "claude-3-opus":
    case "claude-3-sonnet":
    case "claude-3-haiku":
      return Math.ceil(baseCount * 1.1) // Claude tends to use slightly more tokens
    default:
      return baseCount
  }
}

export function formatTokenCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

export function calculateCost(tokens: TokenCount, model: string): number {
  // Pricing per 1K tokens (as of 2024)
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4": { input: 0.03, output: 0.06 },
    "gpt-4-turbo": { input: 0.01, output: 0.03 },
    "gpt-4o": { input: 0.005, output: 0.015 },
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    "claude-3-opus": { input: 0.015, output: 0.075 },
    "claude-3-sonnet": { input: 0.003, output: 0.015 },
    "claude-3-haiku": { input: 0.00025, output: 0.00125 },
  }

  const modelPricing = pricing[model]
  if (!modelPricing) return 0

  const inputCost = (tokens.prompt_tokens / 1000) * modelPricing.input
  const outputCost = (tokens.completion_tokens / 1000) * modelPricing.output

  return inputCost + outputCost
}
