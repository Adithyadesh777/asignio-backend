const express = require('express')
const cors = require('cors')
const Groq = require('groq-sdk')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://asignio.vercel.app'
  ]
}))

app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Asignio backend running' })
})



app.post('/api/generate-plan', async (req, res) => {
  const { text, title } = req.body

  if (!text || !title) {
    return res.status(400).json({ error: 'Missing text or title' })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'user',
          content: `
            You are an academic assistant helping a university student plan their assignment.

            Assignment Title: ${title}

            Assignment Guidelines:
            ${text}

            Based on the above guidelines, create a clear, detailed, step-by-step action plan for the student to complete this assignment successfully.

            Format your response as a numbered list of steps. Each step should:
            - Be specific and actionable
            - Include a suggested time estimate
            - Be ordered logically from start to finish

            Keep it practical and student-friendly.
          `
        }
      ],
      max_tokens: 1024
    })

    const plan = completion.choices[0].message.content
    res.json({ plan })

  } catch (error) {
    console.error('Groq error:', error)
    res.status(500).json({ error: 'Failed to generate plan' })
  }
})

app.listen(PORT, () => {
  console.log(`Asignio backend running on port ${PORT}`)
})