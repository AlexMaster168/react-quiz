import React, { useEffect, useRef } from 'react'
import classes from './Quiz.module.css'
import ActiveQuiz from '../../components/ActiveQuiz/ActiveQuiz.jsx'
import FinishedQuiz from '../../components/FinishedQuiz/FinishedQuiz.jsx'
import QuizStart from '../../components/QuizStart/QuizStart.jsx'
import Crossword from '../../components/Crossword/Crossword.jsx'
import Timer from '../../components/Timer/Timer.jsx'
import Button from '../../components/UI/Button/Button.jsx'
import Loader from '../../components/UI/Loader/Loader.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  fetchQuizById, startQuiz, chooseAnswer, submitAnswer, setCrosswordCell,
  finishQuiz, resetPlay, clearQuiz, cancelPendingReveal
} from '../../store/slices/quizSlice.js'
import { setPlayerInfo } from '../../store/slices/playerSlice.js'
import { saveResult } from '../../store/slices/resultsSlice.js'
import { prepareQuestions, percentOf, getGrade } from '../../lib/quizModel.js'
import { scoreCrossword, wordCells, cellKey } from '../../lib/crossword.js'

function computeScore(quiz, play) {
  if (quiz.kind === 'crossword') {
    const { score, total } = scoreCrossword(quiz.crossword.layout, play.crosswordInput)
    return { score, total }
  }
  const score = Object.values(play.answers).filter(a => a.correct).length
  return { score, total: play.questions.length }
}

function Quiz() {
  const dispatch = useDispatch()
  const { id } = useParams()

  const play = useSelector(state => state.quiz)
  const { quiz, loading, error, isFinished, startedAt } = play
  const player = useSelector(state => state.player)
  const saveError = useSelector(state => state.results.saveError)
  const savedRef = useRef(false)

  const title = quiz?.title || 'Тест'

  useEffect(() => {
    dispatch(fetchQuizById(id))
    return () => {
      dispatch(cancelPendingReveal())
      dispatch(clearQuiz())
    }
  }, [dispatch, id])

  const scoreInfo = quiz && isFinished ? computeScore(quiz, play) : null
  const timeSpent = isFinished ? (play.finishedAt - startedAt) / 1000 : 0

  useEffect(() => {
    if (!isFinished || !scoreInfo || savedRef.current) return
    savedRef.current = true
    const percent = percentOf(scoreInfo.score, scoreInfo.total)
    dispatch(saveResult({
      firstName: player.firstName,
      lastName: player.lastName,
      quizId: id,
      quizName: title,
      kind: quiz.kind,
      score: scoreInfo.score,
      total: scoreInfo.total,
      percent,
      grade: getGrade(percent),
      timeSpent: Math.round(timeSpent),
      timedOut: play.timedOut,
      timestamp: play.finishedAt,
      date: new Date(play.finishedAt).toLocaleString('uk-UA')
    }))
  })

  const handleStart = info => {
    dispatch(setPlayerInfo(info))
    savedRef.current = false
    dispatch(startQuiz(quiz.kind === 'quiz' ? prepareQuestions(quiz) : []))
  }

  const handleRetry = () => {
    dispatch(cancelPendingReveal())
    dispatch(resetPlay())
  }

  const handleFinishCrossword = () => {
    const filled = Object.values(play.crosswordInput).filter(Boolean).length
    const totalCells = new Set(
      quiz.crossword.layout.words.flatMap(w => wordCells(w).map(([r, c]) => cellKey(r, c)))
    ).size
    if (filled < totalCells && !window.confirm('Заповнено не всі клітинки. Завершити?')) return
    dispatch(finishQuiz())
  }

  const renderBody = () => {
    if (loading) return <Loader />
    if (error || !quiz) {
      return (
        <div className={classes.Message}>
          <p>{error || 'Тест не знайдено'}</p>
          <Link to="/"><Button type="light">До списку</Button></Link>
        </div>
      )
    }
    if (!startedAt) return <QuizStart quiz={quiz} title={title} onStart={handleStart} />

    if (isFinished) {
      return (
        <>
          <h1>{title}</h1>
          <FinishedQuiz
            quiz={quiz}
            questions={play.questions}
            answers={play.answers}
            crosswordInput={play.crosswordInput}
            score={scoreInfo.score}
            total={scoreInfo.total}
            timeSpent={timeSpent}
            timedOut={play.timedOut}
            saveError={saveError}
            onRetry={handleRetry}
          />
        </>
      )
    }

    return (
      <>
        <h1>{title}</h1>
        {quiz.timeLimit ? (
          <Timer
            startedAt={startedAt}
            limit={quiz.timeLimit}
            onExpire={() => {
              dispatch(cancelPendingReveal())
              dispatch(finishQuiz(true))
            }}
          />
        ) : null}
        {quiz.kind === 'crossword' ? (
          <div className={classes.CrosswordBox}>
            <Crossword
              layout={quiz.crossword.layout}
              input={play.crosswordInput}
              onCellChange={(row, col, value) => dispatch(setCrosswordCell({ row, col, value }))}
            />
            <Button type="success" onClick={handleFinishCrossword}>Завершити та перевірити</Button>
          </div>
        ) : (
          <ActiveQuiz
            question={play.questions[play.activeQuestion]}
            number={play.activeQuestion + 1}
            total={play.questions.length}
            selected={play.selected}
            revealed={play.revealed}
            onAnswerClick={answerId => dispatch(chooseAnswer(answerId))}
            onSubmit={() => dispatch(submitAnswer())}
          />
        )}
      </>
    )
  }

  const wide = quiz?.kind === 'crossword'

  return (
    <div className={classes.Quiz}>
      <div className={[classes.QuizWrapper, wide ? classes.wide : ''].join(' ')}>
        {renderBody()}
      </div>
    </div>
  )
}

export default Quiz
