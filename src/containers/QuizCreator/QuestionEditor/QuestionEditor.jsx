import React from 'react'
import classes from '../QuizCreator.module.css'
import ImagePicker from '../../../components/UI/ImagePicker/ImagePicker.jsx'
import { QUESTION_TYPES, MIN_ANSWERS, MAX_ANSWERS } from '../../../lib/quizModel.js'

function QuestionEditor({ question, index, total, onChange, onRemove, onMove }) {
  const update = patch => onChange({ ...question, ...patch })

  const changeType = type => {
    const correct = type === 'single' ? question.correct.slice(0, 1) : question.correct
    update({ type, correct })
  }

  const toggleCorrect = id => {
    if (question.type === 'single') {
      update({ correct: [id] })
    } else {
      update({
        correct: question.correct.includes(id)
          ? question.correct.filter(c => c !== id)
          : [...question.correct, id]
      })
    }
  }

  const changeAnswer = (id, text) => {
    update({ answers: question.answers.map(a => (a.id === id ? { ...a, text } : a)) })
  }

  const addAnswer = () => {
    const nextId = Math.max(0, ...question.answers.map(a => a.id)) + 1
    update({ answers: [...question.answers, { id: nextId, text: '' }] })
  }

  const removeAnswer = id => {
    update({
      answers: question.answers.filter(a => a.id !== id),
      correct: question.correct.filter(c => c !== id)
    })
  }

  return (
    <div className={classes.Card}>
      <div className={classes.CardHead}>
        <strong>Питання {index + 1}</strong>
        <div className={classes.CardTools}>
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} title="Вгору">
            <i className="fa fa-arrow-up" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} title="Вниз">
            <i className="fa fa-arrow-down" />
          </button>
          <button type="button" onClick={onRemove} title="Видалити питання">
            <i className="fa fa-trash" />
          </button>
        </div>
      </div>

      <div className={classes.Segmented}>
        {Object.entries(QUESTION_TYPES).map(([type, label]) => (
          <button
            type="button"
            key={type}
            className={question.type === type ? classes.on : ''}
            onClick={() => changeType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <label className={classes.Label}>
        Текст питання
        <textarea
          rows={2}
          value={question.text}
          onChange={e => update({ text: e.target.value })}
          placeholder="Наприклад: Що зображено на картинці?"
        />
      </label>

      <ImagePicker value={question.image} onChange={image => update({ image })} />

      <div className={classes.Label}>
        Варіанти відповіді
        <small> — позначте {question.type === 'single' ? 'правильний' : 'усі правильні'}</small>
      </div>
      {question.answers.map((answer, i) => (
        <div key={answer.id} className={classes.AnswerRow}>
          <input
            type={question.type === 'single' ? 'radio' : 'checkbox'}
            name={`correct-${question.id}`}
            checked={question.correct.includes(answer.id)}
            onChange={() => toggleCorrect(answer.id)}
            title="Правильна відповідь"
          />
          <input
            type="text"
            value={answer.text}
            onChange={e => changeAnswer(answer.id, e.target.value)}
            placeholder={`Варіант ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => removeAnswer(answer.id)}
            disabled={question.answers.length <= MIN_ANSWERS}
            title="Видалити варіант"
          >
            <i className="fa fa-times" />
          </button>
        </div>
      ))}
      {question.answers.length < MAX_ANSWERS ? (
        <button type="button" className={classes.LinkButton} onClick={addAnswer}>
          <i className="fa fa-plus" /> Додати варіант
        </button>
      ) : null}
    </div>
  )
}

export default QuestionEditor
