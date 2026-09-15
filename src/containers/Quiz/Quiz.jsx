import React, { useEffect, useRef } from 'react'
import classes from './Quiz.module.css'
import ActiveQuiz from '../../components/ActiveQuiz/ActiveQuiz.jsx'
import FinishedQuiz from '../../components/FinishedQuiz/FinishedQuiz.jsx'
import Loader from '../../components/UI/Loader/Loader.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { fetchQuizById, fetchQuizes, quizAnswerClick, retryQuiz } from '../../store/slices/quizSlice.js'
import { addResult, resetPlayer } from '../../store/slices/playerSlice.js'
import { useParams } from 'react-router-dom'
import PlayerForm from '../PlayerForm/PlayerForm.jsx'

function Quiz() {
  const dispatch = useDispatch()
  const { id } = useParams()

  const results = useSelector(state => state.quiz.results)
  const isFinished = useSelector(state => state.quiz.isFinished)
  const activeQuestion = useSelector(state => state.quiz.activeQuestion)
  const answerState = useSelector(state => state.quiz.answerState)
  const quiz = useSelector(state => state.quiz.quiz)
  const loading = useSelector(state => state.quiz.loading)
  const player = useSelector(state => state.player)
  const quizes = useSelector(state => state.quiz.quizes)
  const resultSaved = useRef(false)

  const quizName = quizes.find(q => q.id === id)?.name || `Тест №${id}`

  useEffect(() => {
    if (quizes.length === 0) {
      dispatch(fetchQuizes())
    }
    dispatch(fetchQuizById(id))
    return () => {
      dispatch(retryQuiz())
      dispatch(resetPlayer())
    }
  }, [dispatch, id, quizes.length])

  useEffect(() => {
    if (isFinished && quiz && !resultSaved.current) {
      resultSaved.current = true
      const successCount = Object.keys(results).reduce((total, key) => {
        if (results[key] === 'success') total++
        return total
      }, 0)
      dispatch(addResult({
        firstName: player.firstName,
        lastName: player.lastName,
        quizName,
        score: successCount,
        total: quiz.length,
        date: new Date().toLocaleString('uk-UA')
      }))
    }
  }, [isFinished, quiz, results, dispatch, player, quizName])

  const handleAnswerClick = (answerId) => {
    dispatch(quizAnswerClick(answerId))
  }

  const handleRetry = () => {
    dispatch(retryQuiz())
    dispatch(resetPlayer())
  }

  return (
    <div className={classes.Quiz}>
      <div className={classes.QuizWrapper}>
        {!player.isRegistered ? (
          <PlayerForm />
        ) : (
          <>
            <h1>Дайте відповідь на всі питання</h1>
            {loading || !quiz ? (
              <Loader />
            ) : isFinished ? (
              <FinishedQuiz
                results={results}
                quiz={quiz}
                onRetry={handleRetry}
              />
            ) : (
              <ActiveQuiz
                answers={quiz[activeQuestion].answers}
                question={quiz[activeQuestion].question}
                onAnswerClick={handleAnswerClick}
                quizLength={quiz.length}
                answerNumber={activeQuestion + 1}
                state={answerState}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Quiz
