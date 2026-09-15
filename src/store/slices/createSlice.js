import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios/axios-quiz.js'

export const finishCreateQuiz = createAsyncThunk('create/finishCreateQuiz', async (_, { getState }) => {
  await axios.post('/Quiz.json', getState().create.quiz)
})

const createSlice_ = createSlice({
  name: 'create',
  initialState: {
    quiz: []
  },
  reducers: {
    createQuizQuestion(state, action) {
      state.quiz.push(action.payload)
    },
    resetQuizCreation(state) {
      state.quiz = []
    }
  },
  extraReducers: (builder) => {
    builder.addCase(finishCreateQuiz.fulfilled, (state) => {
      state.quiz = []
    })
  }
})

export const { createQuizQuestion, resetQuizCreation } = createSlice_.actions
export default createSlice_.reducer
