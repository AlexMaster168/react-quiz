import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../../api/quizApi.js'
import { isAnswerCorrect } from '../../lib/quizModel.js'
import { cellKey } from '../../lib/crossword.js'

export const fetchQuizes = createAsyncThunk('quiz/fetchQuizes', api.fetchQuizList)
export const fetchQuizById = createAsyncThunk('quiz/fetchQuizById', api.fetchQuiz)
export const removeQuiz = createAsyncThunk('quiz/removeQuiz', async id => {
  await api.deleteQuiz(id)
  return id
})

const REVEAL_DELAY = 1500

const playInitialState = {
  questions: [],
  activeQuestion: 0,
  selected: [],
  revealed: false,
  answers: {}, // questionId -> { selected, correct }
  crosswordInput: {},
  startedAt: null,
  finishedAt: null,
  isFinished: false,
  timedOut: false
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizes: [],
    listLoading: false,
    listError: null,
    quiz: null,
    loading: false,
    error: null,
    ...playInitialState
  },
  reducers: {
    startQuiz: {
      reducer(state, action) {
        Object.assign(state, playInitialState)
        state.questions = action.payload.questions
        state.startedAt = action.payload.startedAt
      },
      prepare: questions => ({ payload: { questions, startedAt: Date.now() } })
    },
    toggleAnswer(state, action) {
      if (state.revealed || state.isFinished) return
      const question = state.questions[state.activeQuestion]
      const id = action.payload
      if (question.type === 'single') {
        state.selected = [id]
      } else if (state.selected.includes(id)) {
        state.selected = state.selected.filter(s => s !== id)
      } else {
        state.selected.push(id)
      }
    },
    revealAnswer(state) {
      if (state.revealed || state.isFinished || state.selected.length === 0) return
      const question = state.questions[state.activeQuestion]
      state.answers[question.id] = {
        selected: state.selected,
        correct: isAnswerCorrect(question, state.selected)
      }
      state.revealed = true
    },
    nextQuestion(state, action) {
      if (!state.revealed || state.isFinished) return
      state.selected = []
      state.revealed = false
      if (state.activeQuestion + 1 >= state.questions.length) {
        state.isFinished = true
        state.finishedAt = action.payload
      } else {
        state.activeQuestion++
      }
    },
    setCrosswordCell(state, action) {
      if (state.isFinished) return
      const { row, col, value } = action.payload
      state.crosswordInput[cellKey(row, col)] = value
    },
    finishQuiz: {
      reducer(state, action) {
        if (state.isFinished || !state.startedAt) return
        state.isFinished = true
        state.revealed = false
        state.timedOut = action.payload.timedOut
        state.finishedAt = action.payload.finishedAt
      },
      prepare: (timedOut = false) => ({ payload: { timedOut, finishedAt: Date.now() } })
    },
    resetPlay(state) {
      Object.assign(state, playInitialState)
    },
    clearQuiz(state) {
      Object.assign(state, playInitialState)
      state.quiz = null
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchQuizes.pending, state => {
        state.listLoading = true
        state.listError = null
      })
      .addCase(fetchQuizes.fulfilled, (state, action) => {
        state.listLoading = false
        state.quizes = action.payload
      })
      .addCase(fetchQuizes.rejected, (state, action) => {
        state.listLoading = false
        state.listError = action.error.message
      })
      .addCase(fetchQuizById.pending, state => {
        state.loading = true
        state.error = null
        state.quiz = null
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false
        state.quiz = action.payload
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(removeQuiz.fulfilled, (state, action) => {
        state.quizes = state.quizes.filter(q => q.id !== action.payload)
      })
  }
})

export const {
  startQuiz, toggleAnswer, revealAnswer, nextQuestion,
  setCrosswordCell, finishQuiz, resetPlay, clearQuiz
} = quizSlice.actions

let revealTimer = null

export const submitAnswer = () => (dispatch, getState) => {
  dispatch(revealAnswer())
  if (!getState().quiz.revealed) return
  window.clearTimeout(revealTimer)
  revealTimer = window.setTimeout(() => dispatch(nextQuestion(Date.now())), REVEAL_DELAY)
}

// Single-choice questions are answered with one click
export const chooseAnswer = answerId => (dispatch, getState) => {
  const { questions, activeQuestion } = getState().quiz
  dispatch(toggleAnswer(answerId))
  if (questions[activeQuestion]?.type === 'single') dispatch(submitAnswer())
}

export const cancelPendingReveal = () => () => window.clearTimeout(revealTimer)

export default quizSlice.reducer
