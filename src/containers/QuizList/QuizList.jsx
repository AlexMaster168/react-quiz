import React, { useEffect } from 'react'
import classes from './QuizList.module.css'
import { NavLink } from 'react-router-dom'
import Loader from '../../components/UI/Loader/Loader.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { fetchQuizes } from '../../store/slices/quizSlice.js'

function QuizList() {
  const dispatch = useDispatch()
  const quizes = useSelector(state => state.quiz.quizes)
  const loading = useSelector(state => state.quiz.loading)

  useEffect(() => {
    dispatch(fetchQuizes())
  }, [dispatch])

  const renderQuizes = () => {
    return quizes.map(quiz => (
      <li key={quiz.id}>
        <NavLink to={'/quiz/' + quiz.id}>
          {quiz.name}
        </NavLink>
      </li>
    ))
  }

  return (
    <div className={classes.QuizList}>
      <div>
        <h1>Список тестів</h1>
        {loading && quizes.length !== 0
          ? <Loader />
          : <ul>{renderQuizes()}</ul>
        }
      </div>
    </div>
  )
}

export default QuizList
