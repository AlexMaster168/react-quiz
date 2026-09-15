import React from 'react'
import classes from './FinishedQuiz.module.css'
import Button from '../UI/Button/Button.jsx'
import { Link } from 'react-router-dom'

function getGrade(percent) {
  if (percent >= 90) return 'Відмінно'
  if (percent >= 70) return 'Добре'
  if (percent >= 50) return 'Задовільно'
  return 'Незадовільно'
}

function FinishedQuiz(props) {
  const successCount = Object.keys(props.results).reduce((total, key) => {
    if (props.results[key] === 'success') {
      total++
    }
    return total
  }, 0)

  const percent = Math.round((successCount / props.quiz.length) * 100)
  const grade = getGrade(percent)

  return (
    <div className={classes.FinishedQuiz}>
      <h2>Тест завершено!</h2>
      <ul>
        {props.quiz.map((quizItem, index) => {
          const cls = [
            'fa',
            props.results[quizItem.id] === 'error' ? 'fa-times' : 'fa-check',
            classes[props.results[quizItem.id]]
          ]

          return (
            <li key={index}>
              <strong>{index + 1}</strong>.&nbsp;
              {quizItem.question}
              <i className={cls.join(' ')} />
            </li>
          )
        })}
      </ul>

      <p>Правильно {successCount} з {props.quiz.length} ({percent}%)</p>
      <p><strong>Оцінка: {grade}</strong></p>

      <div>
        <Button onClick={props.onRetry} type="primary">Повторити</Button>
        <Link to="/">
          <Button type="success">Перейти до списку тестів</Button>
        </Link>
      </div>
    </div>
  )
}

export default FinishedQuiz
