import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const auth = createAsyncThunk('auth/auth', async ({ email, password, isLogin }) => {
  let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyBTjMah92DdVuA6Dd5Pk9zWoM-5FyS2cHM'
  if (isLogin) {
    url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyBTjMah92DdVuA6Dd5Pk9zWoM-5FyS2cHM'
  }
  const response = await axios.post(url, { email, password, returnSecureToken: true })
  return response.data
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null
  },
  reducers: {
    logout(state) {
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('expirationDate')
    },
    autoLogin(state) {
      const token = localStorage.getItem('token')
      if (!token) {
        state.token = null
        return
      }
      const expirationDate = new Date(localStorage.getItem('expirationDate'))
      if (expirationDate <= new Date()) {
        state.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('expirationDate')
      } else {
        state.token = token
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(auth.fulfilled, (state, action) => {
      const data = action.payload
      state.token = data.idToken
      const expirationDate = new Date(new Date().getTime() + data.expiresIn * 1000)
      localStorage.setItem('token', data.idToken)
      localStorage.setItem('userId', data.localId)
      localStorage.setItem('expirationDate', expirationDate)
    })
  }
})

export const { logout, autoLogin } = authSlice.actions
export default authSlice.reducer
