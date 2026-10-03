import React from 'react'
import classes from './ActiveQuiz.module.css'
import Button from '../UI/Button/Button.jsx'

function answerState(answer, question, selected, revealed) {
  const isSelected = selected.includes(answer.id)
  const isCorrect = question.correct.includes(answer.id)
  if (!revealed) return isSelected ? 'selected' : null
  if (isCorrect) return isSelected ? 'success' : 'missed'
  return isSelected ? 'error' : null
}

function ActiveQuiz({ question, number, total, selected, revealed, onAnswerClick, onSubmit }) {
  const isMultiple = question.type === 'multiple'

  return (
    <div className={classes.ActiveQuiz}>
      <div className={classes.Progress}>
        <div style={{ width: `${((number - 1) / total) * 100}%` }} />
      </div>

      <div className={classes.Question}>
        <span>
          <strong>{number}.</strong>&nbsp;{question.text}
        </span>
        <small>{number} з {total}</small>
      </div>

      {question.image ? (
        <img className={classes.Image} src={question.image} alt="Ілюстрація до питання" />
      ) : null}

      {isMultiple ? (
        <p className={classes.Hint}>Оберіть усі правильні варіанти</p>
      ) : null}

      <ul className={classes.Answers}>
        {question.answers.map(answer => {
          const state = answerState(answer, question, selected, revealed)
          const icon = isMultiple
            ? (selected.includes(answer.id) ? 'fa-check-square-o' : 'fa-square-o')
            : (selected.includes(answer.id) ? 'fa-dot-circle-o' : 'fa-circle-o')
          return (
            <li key={answer.id}>
              <button
                type="button"
                className={[classes.Answer, state ? classes[state] : ''].join(' ')}
                onClick={() => onAnswerClick(answer.id)}
                disabled={revealed}
              >
                <i className={`fa ${icon}`} />
                <span>{answer.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {isMultiple && !revealed ? (
        <Button type="success" onClick={onSubmit} disabled={selected.length === 0}>
          Відповісти
        </Button>
      ) : null}

      {revealed ? (
        <p className={classes.Feedback}>
          {question.correct.length === selected.length && selected.every(id => question.correct.includes(id))
            ? <><i className="fa fa-check" /> Правильно!</>
            : <><i className="fa fa-times" /> Неправильно</>}
        </p>
      ) : null}
    </div>
  )
}

export default ActiveQuiz
