import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../../api/quizApi.js'

export const fetchResults = createAsyncThunk('results/fetchResults', api.fetchResults)
export const saveResult = createAsyncThunk('results/saveResult', api.saveResult)

const resultsSlice = createSlice({
  name: 'results',
  initialState: {
    list: [],
    loading: false,
    error: null,
    saveError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchResults.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(saveResult.pending, state => {
        state.saveError = null
      })
      .addCase(saveResult.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(saveResult.rejected, (state, action) => {
        state.saveError = action.error.message
      })
  }
})

export default resultsSlice.reducer
