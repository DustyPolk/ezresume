# AI Integration Plan

## Use Cases
- Generate resume sections from prompts (e.g., "Summarize my work at X")
- Suggest improvements to user-written content
- Offer template-based or freeform generation

## Model Choices
- OpenAI API (GPT-4 or similar)
- (Optional) Local or open-source models for cost control

## Integration Patterns
- Next.js API routes act as proxy between frontend and AI provider
- User submits prompt/data, API route calls AI, returns result
- Rate limiting and error handling on API route

## Prompt Engineering
- Design prompts for each resume section type
- Allow user customization and review before accepting AI suggestions

## Security & Cost
- No user secrets on client
- API keys stored server-side
- Monitor usage to control costs
