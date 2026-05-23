import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { readFileSync } from 'fs'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
})

const text = readFileSync('./data/shop.txt', 'utf-8')
console.log('✓ Dokument geladen:', text.length, 'Zeichen')

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 50,
})
const chunks = await splitter.createDocuments([text])
console.log('✓ Chunks erstellt:', chunks.length)

// Alte Daten löschen
await supabase.from('documents').delete().neq('id', 0)
console.log('✓ Alte Daten gelöscht')

// Chunks embedden und speichern
for (const [i, chunk] of chunks.entries()) {
  const embedding = await embeddings.embedQuery(chunk.pageContent)

  await supabase.from('documents').insert({
    content: chunk.pageContent,
    embedding,
  })

  console.log(`✓ Chunk ${i + 1}/${chunks.length} gespeichert`)
}

console.log('🎉 Vektordatenbank befüllt!')