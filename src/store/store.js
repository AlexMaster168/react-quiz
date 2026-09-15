import { configureStore } from '@reduxjs/toolkit'
import quizReducer from './slices/quizSlice.js'
import createReducer from './slices/createSlice.js'
import authReducer from './slices/authSlice.js'
import playerReducer from './slices/playerSlice.js'

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    create: createReducer,
    auth: authReducer,
    player: playerReducer
  }
})
