import React from 'react'
import { useSelector } from 'react-redux'
import classes from './Results.module.css'

function getGrade(percent) {
  if (percent >= 90) return 'Відмінно'
  if (percent >= 70) return 'Добре'
  if (percent >= 50) return 'Задовільно'
  return 'Незадовільно'
}

function Results() {
  const results = useSelector(state => state.player.results)

  return (
    <div className={classes.Results}>
      <div className={classes.ResultsCard}>
        <h1>Результати учасників</h1>
        {results.length === 0 ? (
          <p className={classes.Empty}>Ще немає результатів. Пройдіть тест!</p>
        ) : (
          <table className={classes.Table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Ім'я</th>
                <th>Прізвище</th>
                <th>Тест</th>
                <th>Результат</th>
                <th>Оцінка</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const percent = Math.round((result.score / result.total) * 100)
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{result.firstName}</td>
                    <td>{result.lastName}</td>
                    <td>{result.quizName}</td>
                    <td>{result.score} / {result.total} ({percent}%)</td>
                    <td>{getGrade(percent)}</td>
                    <td>{result.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Results
