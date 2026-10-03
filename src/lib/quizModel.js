export const QUESTION_TYPES = {
  single: 'Одна правильна відповідь',
  multiple: 'Кілька правильних відповідей'
}

export const KIND_LABELS = {
  quiz: 'Тест',
  crossword: 'Кросворд'
}

export const MIN_ANSWERS = 2
export const MAX_ANSWERS = 8

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// Firebase drops empty arrays and may return sparse arrays as objects
function toArray(value) {
  if (!value) return []
  return (Array.isArray(value) ? value : Object.values(value)).filter(Boolean)
}

function normalizeQuestion(q, index) {
  return {
    id: q.id ?? index + 1,
    type: q.type === 'multiple' ? 'multiple' : 'single',
    text: q.text ?? q.question ?? '',
    image: q.image || '',
    answers: toArray(q.answers).map(a => ({ id: a.id, text: a.text ?? '' })),
    correct: q.correct ? toArray(q.correct) : (q.rightAnswerId != null ? [q.rightAnswerId] : [])
  }
}

// Supports legacy quizzes (plain array of questions) and the v2 format
export function normalizeQuiz(raw, id) {
  if (!raw) return null

  if (Array.isArray(raw)) {
    return {
      id,
      kind: 'quiz',
      title: '',
      description: '',
      timeLimit: 0,
      shuffle: false,
      createdAt: 0,
      questions: raw.filter(Boolean).map(normalizeQuestion),
      crossword: null
    }
  }

  const crossword = raw.crossword
    ? {
        words: toArray(raw.crossword.words),
        layout: raw.crossword.layout
          ? { ...raw.crossword.layout, words: toArray(raw.crossword.layout.words) }
          : null
      }
    : null

  return {
    id,
    kind: raw.kind === 'crossword' ? 'crossword' : 'quiz',
    title: raw.title || '',
    description: raw.description || '',
    timeLimit: Number(raw.timeLimit) || 0,
    shuffle: !!raw.shuffle,
    createdAt: raw.createdAt || 0,
    questions: toArray(raw.questions).map(normalizeQuestion),
    crossword
  }
}

export function quizItemsCount(quiz) {
  if (quiz.kind === 'crossword') return quiz.crossword?.layout?.words.length || 0
  return quiz.questions.length
}

export function isAnswerCorrect(question, selected) {
  if (selected.length !== question.correct.length) return false
  return question.correct.every(id => selected.includes(id))
}

export function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function prepareQuestions(quiz) {
  if (!quiz.shuffle) return quiz.questions
  return shuffleArray(quiz.questions).map(q => ({ ...q, answers: shuffleArray(q.answers) }))
}

export function getGrade(percent) {
  if (percent >= 90) return 'Відмінно'
  if (percent >= 70) return 'Добре'
  if (percent >= 50) return 'Задовільно'
  return 'Незадовільно'
}

export function percentOf(score, total) {
  return total ? Math.round((score / total) * 100) : 0
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function pluralize(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
