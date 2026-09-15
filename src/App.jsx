import React, { useEffect } from 'react'
import Layout from './hoc/Layout/Layout.jsx'
import { Route, Routes, Navigate } from 'react-router-dom'
import Quiz from './containers/Quiz/Quiz.jsx'
import QuizList from './containers/QuizList/QuizList.jsx'
import Auth from './containers/Auth/Auth.jsx'
import QuizCreator from './containers/QuizCreator/QuizCreator.jsx'
import Logout from './components/Logout/Logout.jsx'
import About from './containers/About/About.jsx'
import Results from './containers/Results/Results.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { autoLogin } from './store/slices/authSlice.js'

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(state => !!state.auth.token)

  useEffect(() => {
    dispatch(autoLogin())
  }, [dispatch])

  return (
    <Layout>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/about" element={<About />} />
            <Route path="/results" element={<Results />} />
            <Route path="/" element={<QuizList />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/quiz-creator" element={<QuizCreator />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/about" element={<About />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/results" element={<Results />} />
            <Route path="/" element={<QuizList />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Layout>
  )
}

export default App
