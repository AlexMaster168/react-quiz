import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios/axios-quiz.js'

export const fetchQuizes = createAsyncThunk('quiz/fetchQuizes', async () => {
  const response = await axios.get('/Quiz.json')
  const quizes = []
  Object.keys(response.data).forEach((key, index) => {
    quizes.push({ id: key, name: `Тест №${index + 1}` })
  })
  return quizes
})

export const fetchQuizById = createAsyncThunk('quiz/fetchQuizById', async (quizId) => {
  const response = await axios.get(`/Quiz/${quizId}.json`)
  return response.data
})

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizes: [],
    loading: false,
    error: null,
    results: {},
    isFinished: false,
    activeQuestion: 0,
    answerState: null,
    quiz: null
  },
  reducers: {
    quizSetState(state, action) {
      state.answerState = action.payload.answerState
      state.results = action.payload.results
    },
    finishQuiz(state) {
      state.isFinished = true
    },
    quizNextQuestion(state, action) {
      state.answerState = null
      state.activeQuestion = action.payload
    },
    retryQuiz(state) {
      state.activeQuestion = 0
      state.answerState = null
      state.isFinished = false
      state.results = {}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuizes.fulfilled, (state, action) => {
        state.loading = false
        state.quizes = action.payload
      })
      .addCase(fetchQuizes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false
        state.quiz = action.payload
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { quizSetState, finishQuiz, quizNextQuestion, retryQuiz } = quizSlice.actions

export const quizAnswerClick = (answerId) => (dispatch, getState) => {
  const state = getState().quiz

  if (state.answerState) {
    const key = Object.keys(state.answerState)[0]
    if (state.answerState[key] === 'success') {
      return
    }
  }

  const question = state.quiz[state.activeQuestion]
  const results = { ...state.results }

  if (question.rightAnswerId === answerId) {
    if (!results[question.id]) {
      results[question.id] = 'success'
    }

    dispatch(quizSetState({ answerState: { [answerId]: 'success' }, results }))

    const timeout = window.setTimeout(() => {
      if (state.activeQuestion + 1 === state.quiz.length) {
        dispatch(finishQuiz())
      } else {
        dispatch(quizNextQuestion(state.activeQuestion + 1))
      }
      window.clearTimeout(timeout)
    }, 1000)
  } else {
    results[question.id] = 'error'
    dispatch(quizSetState({ answerState: { [answerId]: 'error' }, results }))
  }
}

export default quizSlice.reducer
