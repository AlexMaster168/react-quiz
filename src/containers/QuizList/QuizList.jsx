import React, { useEffect } from 'react'
import classes from './QuizList.module.css'
import { Link } from 'react-router-dom'
import Loader from '../../components/UI/Loader/Loader.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { fetchQuizes, removeQuiz } from '../../store/slices/quizSlice.js'
import { KIND_LABELS, formatTime, pluralize } from '../../lib/quizModel.js'

function QuizList() {
  const dispatch = useDispatch()
  const quizes = useSelector(state => state.quiz.quizes)
  const loading = useSelector(state => state.quiz.listLoading)
  const error = useSelector(state => state.quiz.listError)
  const isAuthenticated = useSelector(state => !!state.auth.token)

  useEffect(() => {
    dispatch(fetchQuizes())
  }, [dispatch])

  const handleDelete = quiz => {
    if (window.confirm(`Видалити «${quiz.title}»? Цю дію не можна скасувати.`)) {
      dispatch(removeQuiz(quiz.id))
        .unwrap()
        .catch(e => window.alert(`Не вдалося видалити: ${e.message}`))
    }
  }

  const countLabel = quiz => {
    if (quiz.count == null) return null
    return quiz.kind === 'crossword'
      ? `${quiz.count} ${pluralize(quiz.count, 'слово', 'слова', 'слів')}`
      : `${quiz.count} ${pluralize(quiz.count, 'питання', 'питання', 'питань')}`
  }

  const renderContent = () => {
    if (loading && quizes.length === 0) return <Loader />
    if (error) return <p className={classes.Empty}>Не вдалося завантажити список: {error}</p>
    if (quizes.length === 0) {
      return (
        <p className={classes.Empty}>
          Тестів ще немає.{' '}
          {isAuthenticated ? <Link to="/quiz-creator">Створіть перший!</Link> : 'Увійдіть, щоб створити перший.'}
        </p>
      )
    }
    return (
      <ul className={classes.Grid}>
        {quizes.map(quiz => (
          <li key={quiz.id} className={classes.Card}>
            <Link to={`/quiz/${quiz.id}`} className={classes.CardLink}>
              <span className={classes.Kind}>
                <i className={`fa ${quiz.kind === 'crossword' ? 'fa-th' : 'fa-list-ul'}`} /> {KIND_LABELS[quiz.kind]}
              </span>
              <h2>{quiz.title}</h2>
              {quiz.description ? <p>{quiz.description}</p> : null}
              <div className={classes.Meta}>
                {countLabel(quiz) ? <span>{countLabel(quiz)}</span> : null}
                {quiz.timeLimit ? <span><i className="fa fa-clock-o" /> {formatTime(quiz.timeLimit)}</span> : null}
              </div>
            </Link>
            {isAuthenticated ? (
              <div className={classes.Actions}>
                <Link to={`/quiz-creator/${quiz.id}`} title="Редагувати"><i className="fa fa-pencil" /></Link>
                <button type="button" onClick={() => handleDelete(quiz)} title="Видалити">
                  <i className="fa fa-trash" />
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={classes.QuizList}>
      <div className={classes.Container}>
        <h1>Тести та кросворди</h1>
        {renderContent()}
      </div>
    </div>
  )
}

export default QuizList
