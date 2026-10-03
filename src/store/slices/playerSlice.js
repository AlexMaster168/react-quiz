import { createSlice } from '@reduxjs/toolkit'

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    firstName: '',
    lastName: ''
  },
  reducers: {
    setPlayerInfo(state, action) {
      state.firstName = action.payload.firstName
      state.lastName = action.payload.lastName
    }
  }
})

export const { setPlayerInfo } = playerSlice.actions
export default playerSlice.reducer
