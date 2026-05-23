import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
})

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
})

const retrieve = async (question) => {
  const embedding = await embeddings.embedQuery(question)
  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: 5,
  })
  return (data || []).map((d) => d.content).join('\n---\n')
}

app.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body

  const context = await retrieve(message)

  const systemPrompt = `You are Max, a friendly customer service assistant for TechDeal GmbH.

YOUR ONLY KNOWLEDGE SOURCE:
"""
${context}
"""

STRICT RULES:
- If the answer is NOT in the knowledge source → Say: "I don't know, please contact support@techdeal.de"
- NEVER invent products, prices or information
- Respond in the SAME LANGUAGE the customer writes in — German, English, or any other language
- Keep answers short and friendly`

  const messages = [
    new SystemMessage(systemPrompt),
    ...history.map((m) =>
      m.role === 'user' ? new HumanMessage(m.content) : new SystemMessage(m.content)
    ),
    new HumanMessage(message),
  ]

  const response = await llm.invoke(messages)

  res.json({ reply: response.content })
})

app.listen(process.env.PORT, () => {
  console.log(`✓ Server läuft auf http://localhost:${process.env.PORT}`)
})