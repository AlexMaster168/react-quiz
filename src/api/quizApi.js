import axios from '../axios/axios-quiz.js'
import { normalizeQuiz, quizItemsCount } from '../lib/quizModel.js'

export async function fetchQuizList() {
  const [metaRes, keysRes] = await Promise.all([
    axios.get('/QuizMeta.json'),
    axios.get('/Quiz.json', { params: { shallow: true } })
  ])
  const meta = metaRes.data || {}
  // Push keys sort chronologically
  const ids = Object.keys(keysRes.data || {}).sort()
  const described = ids
    .filter(id => meta[id])
    .map(id => ({ id, ...meta[id] }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  const legacy = ids
    .filter(id => !meta[id])
    .map((id, index) => ({ id, title: `Тест №${index + 1}`, description: '', kind: 'quiz', count: null, timeLimit: 0 }))
  return [...described, ...legacy]
}

export async function fetchQuiz(id) {
  const response = await axios.get(`/Quiz/${id}.json`)
  if (!response.data) throw new Error('Тест не знайдено')
  return normalizeQuiz(response.data, id)
}

function toMeta(quiz) {
  return {
    title: quiz.title,
    description: quiz.description,
    kind: quiz.kind,
    count: quizItemsCount(quiz),
    timeLimit: quiz.timeLimit,
    createdAt: quiz.createdAt
  }
}

export async function saveQuiz(quiz, id) {
  const { id: _ignored, ...data } = { ...quiz, version: 2, createdAt: quiz.createdAt || Date.now() }
  let quizId = id
  if (quizId) {
    await axios.put(`/Quiz/${quizId}.json`, data)
  } else {
    const response = await axios.post('/Quiz.json', data)
    quizId = response.data.name
  }
  await axios.put(`/QuizMeta/${quizId}.json`, toMeta(data))
  return quizId
}

export async function deleteQuiz(id) {
  await Promise.all([
    axios.delete(`/Quiz/${id}.json`),
    axios.delete(`/QuizMeta/${id}.json`)
  ])
}

export async function fetchResults() {
  const response = await axios.get('/Results.json')
  return Object.entries(response.data || {})
    .map(([id, r]) => ({ id, ...r }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
}

export async function saveResult(result) {
  const response = await axios.post('/Results.json', result)
  return { id: response.data.name, ...result }
}
