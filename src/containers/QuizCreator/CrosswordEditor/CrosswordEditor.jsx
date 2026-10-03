import React from 'react'
import classes from '../QuizCreator.module.css'
import Crossword from '../../../components/Crossword/Crossword.jsx'
import Button from '../../../components/UI/Button/Button.jsx'
import { normalizeWord } from '../../../lib/crossword.js'

function CrosswordEditor({ words, layout, unplaced, onWordsChange, onGenerate }) {
  const changeWord = (index, patch) => {
    onWordsChange(words.map((w, i) => (i === index ? { ...w, ...patch } : w)))
  }

  return (
    <>
      <div className={classes.Card}>
        <div className={classes.CardHead}>
          <strong>Слова та підказки</strong>
        </div>
        <p className={classes.Help}>
          Мінімум 2 слова. Пробіли, дефіси й апострофи у відповідях ігноруються.
          Сітка будується автоматично — слова мають мати спільні літери.
        </p>
        {words.map((word, index) => (
          <div key={index} className={classes.WordRow}>
            <span className={classes.WordIndex}>{index + 1}.</span>
            <input
              type="text"
              value={word.answer}
              onChange={e => changeWord(index, { answer: e.target.value })}
              placeholder="Відповідь"
            />
            <input
              type="text"
              value={word.clue}
              onChange={e => changeWord(index, { clue: e.target.value })}
              placeholder="Підказка / питання"
            />
            <button
              type="button"
              onClick={() => onWordsChange(words.filter((_, i) => i !== index))}
              disabled={words.length <= 2}
              title="Видалити слово"
            >
              <i className="fa fa-times" />
            </button>
            {word.answer && normalizeWord(word.answer).length < 2
              ? <span className={classes.RowError}>Відповідь має містити щонайменше 2 літери</span>
              : null}
          </div>
        ))}
        <button
          type="button"
          className={classes.LinkButton}
          onClick={() => onWordsChange([...words, { answer: '', clue: '' }])}
        >
          <i className="fa fa-plus" /> Додати слово
        </button>
      </div>

      <div className={classes.Card}>
        <div className={classes.CardHead}>
          <strong>Сітка кросворду</strong>
          <Button type="primary" small onClick={onGenerate}>
            <i className="fa fa-refresh" /> {layout ? 'Перегенерувати' : 'Згенерувати'}
          </Button>
        </div>
        {layout ? (
          <div className={classes.PreviewDark}>
            <Crossword layout={layout} mode="preview" />
          </div>
        ) : (
          <p className={classes.Help}>Натисніть «Згенерувати», щоб побачити сітку. Під час збереження вона створиться автоматично.</p>
        )}
        {unplaced.length ? (
          <p className={classes.RowError}>
            Не вдалося розмістити: {unplaced.map(w => w.answer || '(порожнє)').join(', ')}.
            Спробуйте перегенерувати або змініть слова — вони не потраплять у кросворд.
          </p>
        ) : null}
      </div>
    </>
  )
}

export default CrosswordEditor
