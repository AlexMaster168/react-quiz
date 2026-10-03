import React from 'react'
import { Link } from 'react-router-dom'
import classes from './About.module.css'

const FEATURES = [
  { icon: 'fa-list-ul', title: 'Тести', text: 'Одна або кілька правильних відповідей, до 8 варіантів' },
  { icon: 'fa-picture-o', title: 'Картинки', text: 'Ілюстрації до питань — з комп\'ютера або за посиланням' },
  { icon: 'fa-th', title: 'Кросворди', text: 'Сітка генерується автоматично зі слів і підказок' },
  { icon: 'fa-clock-o', title: 'Таймер', text: 'Необов\'язковий ліміт часу на весь тест' },
  { icon: 'fa-random', title: 'Перемішування', text: 'Інший порядок питань і відповідей для кожної спроби' },
  { icon: 'fa-bar-chart', title: 'Результати', text: 'Оцінки та час усіх учасників в одній таблиці' }
]

const STACK = ['React 18', 'Redux Toolkit', 'React Router', 'Vite', 'Firebase']

function About() {
  return (
    <div className={classes.About}>
      <div className={classes.Container}>
        <section className={classes.Hero}>
          <div className={classes.Avatar}>ОС</div>
          <div>
            <p className={classes.Eyebrow}>Автор</p>
            <h1>Олексій Сільвейструк</h1>
            <p className={classes.Lead}>
              React Quiz — конструктор тестів і кросвордів на будь-яку тему.
              Створюйте завдання за кілька хвилин і діліться посиланням.
            </p>
            <div className={classes.Links}>
              <a href="https://github.com/AlexMaster168/react-quiz" target="_blank" rel="noreferrer">
                <i className="fa fa-github" /> Код на GitHub
              </a>
              <Link to="/"><i className="fa fa-play" /> До тестів</Link>
            </div>
          </div>
        </section>

        <ul className={classes.Features}>
          {FEATURES.map(f => (
            <li key={f.title}>
              <i className={`fa ${f.icon}`} />
              <h2>{f.title}</h2>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>

        <div className={classes.Stack}>
          {STACK.map(s => <span key={s}>{s}</span>)}
        </div>
      </div>
    </div>
  )
}

export default About
