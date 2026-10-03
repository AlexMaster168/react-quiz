import { configureStore } from '@reduxjs/toolkit'
import quizReducer from './slices/quizSlice.js'
import authReducer from './slices/authSlice.js'
import playerReducer from './slices/playerSlice.js'
import resultsReducer from './slices/resultsSlice.js'

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    auth: authReducer,
    player: playerReducer,
    results: resultsReducer
  }
})
