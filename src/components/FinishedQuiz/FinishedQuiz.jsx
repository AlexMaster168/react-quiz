import React from 'react'
import classes from './FinishedQuiz.module.css'
import Button from '../UI/Button/Button.jsx'
import Crossword from '../Crossword/Crossword.jsx'
import { Link } from 'react-router-dom'
import { formatTime, getGrade, percentOf } from '../../lib/quizModel.js'

function answerTexts(question, ids) {
  const texts = question.answers.filter(a => ids.includes(a.id)).map(a => a.text)
  return texts.length ? texts.join(', ') : '—'
}

function QuestionsReview({ questions, answers }) {
  return (
    <ul className={classes.Review}>
      {questions.map((question, index) => {
        const answer = answers[question.id]
        const correct = !!answer?.correct
        return (
          <li key={question.id} className={correct ? classes.success : classes.error}>
            <div className={classes.ReviewHead}>
              <i className={`fa ${correct ? 'fa-check' : 'fa-times'}`} />
              <strong>{index + 1}.</strong>&nbsp;{question.text}
            </div>
            {question.image ? <img src={question.image} alt="" className={classes.Thumb} /> : null}
            {!correct ? (
              <div className={classes.ReviewDetails}>
                <div>Ваша відповідь: {answer ? answerTexts(question, answer.selected) : 'немає відповіді'}</div>
                <div>Правильна: {answerTexts(question, question.correct)}</div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function FinishedQuiz({ quiz, questions, answers, crosswordInput, score, total, timeSpent, timedOut, saveError, onRetry }) {
  const percent = percentOf(score, total)

  return (
    <div className={classes.FinishedQuiz}>
      <h2>{timedOut ? 'Час вичерпано!' : 'Завершено!'}</h2>

      <div className={classes.Summary}>
        <div className={classes.Percent}>{percent}%</div>
        <div>
          <p>Правильно {score} з {total}</p>
          <p><strong>Оцінка: {getGrade(percent)}</strong></p>
          <p>Час: {formatTime(timeSpent)}</p>
        </div>
      </div>

      {saveError ? <p className={classes.Warning}>Не вдалося зберегти результат: {saveError}</p> : null}

      {quiz.kind === 'crossword' ? (
        <Crossword layout={quiz.crossword.layout} input={crosswordInput} mode="review" />
      ) : (
        <QuestionsReview questions={questions} answers={answers} />
      )}

      <div className={classes.Actions}>
        <Button onClick={onRetry} type="primary">Пройти ще раз</Button>
        <Link to="/"><Button type="success">До списку</Button></Link>
        <Link to="/results"><Button type="light">Усі результати</Button></Link>
      </div>
    </div>
  )
}

export default FinishedQuiz
