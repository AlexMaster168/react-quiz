import React, { useEffect, useState } from 'react'
import classes from './QuizCreator.module.css'
import Button from '../../components/UI/Button/Button.jsx'
import Loader from '../../components/UI/Loader/Loader.jsx'
import QuestionEditor from './QuestionEditor/QuestionEditor.jsx'
import CrosswordEditor from './CrosswordEditor/CrosswordEditor.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchQuiz, saveQuiz } from '../../api/quizApi.js'
import { fetchQuizes } from '../../store/slices/quizSlice.js'
import { KIND_LABELS, uid } from '../../lib/quizModel.js'
import { generateCrossword, normalizeWord } from '../../lib/crossword.js'

function newQuestion() {
  return {
    id: uid(),
    type: 'single',
    text: '',
    image: '',
    answers: [1, 2, 3, 4].map(id => ({ id, text: '' })),
    correct: [1]
  }
}

function emptyDraft() {
  return {
    kind: 'quiz',
    title: '',
    description: '',
    timerEnabled: false,
    timerMinutes: 10,
    shuffle: false,
    createdAt: 0,
    questions: [newQuestion()],
    words: [{ answer: '', clue: '' }, { answer: '', clue: '' }, { answer: '', clue: '' }]
  }
}

function draftFromQuiz(quiz) {
  const words = quiz.crossword?.words?.length
    ? quiz.crossword.words
    : [{ answer: '', clue: '' }, { answer: '', clue: '' }]
  return {
    ...emptyDraft(),
    kind: quiz.kind,
    title: quiz.title,
    description: quiz.description,
    timerEnabled: quiz.timeLimit > 0,
    timerMinutes: quiz.timeLimit > 0 ? +(quiz.timeLimit / 60).toFixed(1) : 10,
    shuffle: quiz.shuffle,
    createdAt: quiz.createdAt,
    questions: quiz.questions.length ? quiz.questions : [newQuestion()],
    words: words.map(w => ({ answer: w.answer || '', clue: w.clue || '' }))
  }
}

function validateDraft(draft, crossword) {
  const errors = []
  if (!draft.title.trim()) errors.push('Вкажіть назву')
  if (draft.timerEnabled && !(draft.timerMinutes > 0)) errors.push('Вкажіть тривалість таймера')

  if (draft.kind === 'quiz') {
    if (!draft.questions.length) errors.push('Додайте хоча б одне питання')
    draft.questions.forEach((q, i) => {
      const n = i + 1
      if (!q.text.trim() && !q.image) errors.push(`Питання ${n}: додайте текст або картинку`)
      if (q.answers.some(a => !a.text.trim())) errors.push(`Питання ${n}: заповніть усі варіанти`)
      if (!q.correct.length) errors.push(`Питання ${n}: позначте правильну відповідь`)
    })
  } else {
    const filled = draft.words.filter(w => w.answer.trim() || w.clue.trim())
    if (filled.length < 2) errors.push('Додайте щонайменше 2 слова')
    filled.forEach((w, i) => {
      if (normalizeWord(w.answer).length < 2) errors.push(`Слово ${i + 1}: відповідь занадто коротка`)
      if (!w.clue.trim()) errors.push(`Слово ${i + 1}: додайте підказку`)
    })
    if (crossword && crossword.layout && crossword.layout.words.length < 2) {
      errors.push('Не вдалося скласти кросворд: слова не перетинаються. Додайте слова зі спільними літерами')
    }
  }
  return errors
}

function QuizCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [draft, setDraft] = useState(emptyDraft)
  const [crossword, setCrossword] = useState({ layout: null, unplaced: [] })
  const [loading, setLoading] = useState(!!id)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])

  useEffect(() => {
    if (!id) {
      setDraft(emptyDraft())
      setCrossword({ layout: null, unplaced: [] })
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchQuiz(id)
      .then(quiz => {
        if (cancelled) return
        setDraft(draftFromQuiz(quiz))
        setCrossword({ layout: quiz.crossword?.layout || null, unplaced: [] })
      })
      .catch(e => !cancelled && setLoadError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id])

  const update = patch => setDraft(d => ({ ...d, ...patch }))

  const updateQuestion = (index, question) => {
    setDraft(d => ({ ...d, questions: d.questions.map((q, i) => (i === index ? question : q)) }))
  }

  const moveQuestion = (index, delta) => {
    setDraft(d => {
      const questions = [...d.questions]
      const [item] = questions.splice(index, 1)
      questions.splice(index + delta, 0, item)
      return { ...d, questions }
    })
  }

  const filledWords = words => words.filter(w => w.answer.trim() || w.clue.trim())

  const generate = () => {
    const result = generateCrossword(filledWords(draft.words))
    setCrossword(result)
    return result
  }

  const changeWords = words => {
    update({ words })
    setCrossword({ layout: null, unplaced: [] })
  }

  const handleSave = async event => {
    event.preventDefault()
    let cw = crossword
    const validation = []
    if (draft.kind === 'crossword' && !cw.layout) {
      cw = generate()
      if (cw.unplaced.length) {
        validation.push('Не всі слова вмістилися в сітку — перегляньте її нижче та збережіть ще раз')
      }
    }
    validation.unshift(...validateDraft(draft, cw))
    setErrors(validation)
    if (validation.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const base = {
      kind: draft.kind,
      title: draft.title.trim(),
      description: draft.description.trim(),
      timeLimit: draft.timerEnabled ? Math.round(draft.timerMinutes * 60) : 0,
      shuffle: draft.kind === 'quiz' && draft.shuffle,
      createdAt: draft.createdAt
    }
    const quiz = draft.kind === 'quiz'
      ? {
          ...base,
          questions: draft.questions.map(q => ({
            ...q,
            text: q.text.trim(),
            answers: q.answers.map(a => ({ ...a, text: a.text.trim() }))
          }))
        }
      : {
          ...base,
          crossword: {
            words: filledWords(draft.words).map(w => ({ answer: w.answer.trim(), clue: w.clue.trim() })),
            layout: cw.layout
          }
        }

    setSaving(true)
    try {
      await saveQuiz(quiz, id)
      dispatch(fetchQuizes())
      navigate('/')
    } catch (e) {
      setErrors([`Не вдалося зберегти: ${e.message}`])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={classes.QuizCreator}><Loader /></div>
  }

  if (loadError) {
    return (
      <div className={classes.QuizCreator}>
        <div><h1>{loadError}</h1></div>
      </div>
    )
  }

  return (
    <div className={classes.QuizCreator}>
      <div>
        <h1>{id ? 'Редагування' : 'Створення'}</h1>
        <form onSubmit={handleSave} noValidate>
          {errors.length ? (
            <ul className={classes.Errors}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          ) : null}

          <div className={classes.Card}>
            {!id ? (
              <div className={classes.Segmented}>
                {Object.entries(KIND_LABELS).map(([kind, label]) => (
                  <button
                    type="button"
                    key={kind}
                    className={draft.kind === kind ? classes.on : ''}
                    onClick={() => update({ kind })}
                  >
                    <i className={`fa ${kind === 'quiz' ? 'fa-list-ul' : 'fa-th'}`} /> {label}
                  </button>
                ))}
              </div>
            ) : null}

            <label className={classes.Label}>
              Назва
              <input
                type="text"
                value={draft.title}
                onChange={e => update({ title: e.target.value })}
                placeholder="Наприклад: Столиці Європи"
              />
            </label>

            <label className={classes.Label}>
              Опис <small>(необов'язково)</small>
              <textarea
                rows={2}
                value={draft.description}
                onChange={e => update({ description: e.target.value })}
              />
            </label>

            <div className={classes.Settings}>
              <label className={classes.Check}>
                <input
                  type="checkbox"
                  checked={draft.timerEnabled}
                  onChange={e => update({ timerEnabled: e.target.checked })}
                />
                Таймер
              </label>
              {draft.timerEnabled ? (
                <label className={classes.Inline}>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={draft.timerMinutes}
                    onChange={e => update({ timerMinutes: parseFloat(e.target.value) || 0 })}
                  />
                  хв
                </label>
              ) : null}
              {draft.kind === 'quiz' ? (
                <label className={classes.Check}>
                  <input
                    type="checkbox"
                    checked={draft.shuffle}
                    onChange={e => update({ shuffle: e.target.checked })}
                  />
                  Перемішувати питання й відповіді
                </label>
              ) : null}
            </div>
          </div>

          {draft.kind === 'quiz' ? (
            <>
              {draft.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  total={draft.questions.length}
                  onChange={q => updateQuestion(index, q)}
                  onRemove={() => update({ questions: draft.questions.filter((_, i) => i !== index) })}
                  onMove={delta => moveQuestion(index, delta)}
                />
              ))}
              <button
                type="button"
                className={classes.AddButton}
                onClick={() => update({ questions: [...draft.questions, newQuestion()] })}
              >
                <i className="fa fa-plus" /> Додати питання
              </button>
            </>
          ) : (
            <CrosswordEditor
              words={draft.words}
              layout={crossword.layout}
              unplaced={crossword.unplaced}
              onWordsChange={changeWords}
              onGenerate={generate}
            />
          )}

          <div className={classes.Footer}>
            <Button type="success" htmlType="submit" disabled={saving}>
              {saving ? 'Збереження…' : (id ? 'Зберегти зміни' : 'Створити')}
            </Button>
            <Button type="light" onClick={() => navigate('/')}>Скасувати</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuizCreator
