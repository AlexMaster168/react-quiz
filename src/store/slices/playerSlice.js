import { createSlice } from '@reduxjs/toolkit'

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    firstName: '',
    lastName: '',
    isRegistered: false,
    results: []
  },
  reducers: {
    setPlayerInfo(state, action) {
      state.firstName = action.payload.firstName
      state.lastName = action.payload.lastName
      state.isRegistered = true
    },
    addResult(state, action) {
      state.results.push(action.payload)
    },
    resetPlayer(state) {
      state.firstName = ''
      state.lastName = ''
      state.isRegistered = false
    }
  }
})

export const { setPlayerInfo, addResult, resetPlayer } = playerSlice.actions
export default playerSlice.reducer
