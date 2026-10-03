import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '../UI/Button/Button.jsx'
import Input from '../UI/Input/Input.jsx'
import classes from './QuizStart.module.css'
import { KIND_LABELS, quizItemsCount, formatTime, pluralize } from '../../lib/quizModel.js'

function QuizStart({ quiz, title, onStart }) {
  const player = useSelector(state => state.player)
  const [firstName, setFirstName] = useState(player.firstName)
  const [lastName, setLastName] = useState(player.lastName)
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    firstName: !firstName.trim() ? 'Введіть ім\'я' : null,
    lastName: !lastName.trim() ? 'Введіть прізвище' : null
  }

  const handleSubmit = event => {
    event.preventDefault()
    setSubmitted(true)
    if (errors.firstName || errors.lastName) return
    onStart({ firstName: firstName.trim(), lastName: lastName.trim() })
  }

  const count = quizItemsCount(quiz)
  const countLabel = quiz.kind === 'crossword'
    ? pluralize(count, 'слово', 'слова', 'слів')
    : pluralize(count, 'питання', 'питання', 'питань')

  return (
    <div className={classes.QuizStart}>
      <h1>{title}</h1>
      {quiz.description ? <p className={classes.Description}>{quiz.description}</p> : null}
      <div className={classes.Badges}>
        <span>{KIND_LABELS[quiz.kind]}</span>
        <span>{count} {countLabel}</span>
        <span>
          <i className="fa fa-clock-o" />{' '}
          {quiz.timeLimit ? `Ліміт ${formatTime(quiz.timeLimit)}` : 'Без обмеження часу'}
        </span>
        {quiz.shuffle ? <span><i className="fa fa-random" /> Перемішування</span> : null}
      </div>

      <form onSubmit={handleSubmit} className={classes.Form} noValidate>
        <Input
          label="Ім'я"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          valid={!errors.firstName}
          shouldValidate
          touched={submitted}
          errorMessage={errors.firstName}
        />
        <Input
          label="Прізвище"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          valid={!errors.lastName}
          shouldValidate
          touched={submitted}
          errorMessage={errors.lastName}
        />
        <Button type="primary" htmlType="submit" disabled={count === 0}>
          {quiz.kind === 'crossword' ? 'Розпочати кросворд' : 'Розпочати тест'}
        </Button>
        {quiz.timeLimit ? (
          <p className={classes.Note}>Таймер запуститься одразу після натискання кнопки.</p>
        ) : null}
      </form>
    </div>
  )
}

export default QuizStart
