import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import * as readline from 'readline'
import 'dotenv/config'

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

const history = []

const retrieve = async (question) => {
  const embedding = await embeddings.embedQuery(question)

  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: 5,
  })

  return data.map((d) => d.content).join('\n---\n')
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ask = () => {
  rl.question('Du: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Tschüss!')
      rl.close()
      return
    }

    const context = await retrieve(input)

    const systemPrompt = `Du bist Max, ein freundlicher Kundenservice-Assistent für TechDeal GmbH.

DEINE EINZIGE WISSENSQUELLE:
"""
${context}
"""

STRIKTE REGELN:
- Steht die Antwort NICHT in der Wissensquelle? → Sage: "Das weiß ich leider nicht, bitte kontaktiere support@techdeal.de"
- Erfinde NIEMALS Produkte, Preise oder Informationen
- Antworte kurz, freundlich, auf Deutsch`

    const messages = [
      new SystemMessage(systemPrompt),
      ...history,
      new HumanMessage(input),
    ]

    const response = await llm.invoke(messages)
    history.push(new HumanMessage(input))
    history.push(response)

    console.log(`\nMax: ${response.content}\n`)
    ask()
  })
}

console.log('✓ TechDeal Chatbot bereit!\n')
ask()