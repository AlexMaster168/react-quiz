import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classes from './Results.module.css'
import Loader from '../../components/UI/Loader/Loader.jsx'
import { fetchResults } from '../../store/slices/resultsSlice.js'
import { formatTime, getGrade, percentOf } from '../../lib/quizModel.js'

function Results() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector(state => state.results)
  const [quizFilter, setQuizFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchResults())
  }, [dispatch])

  const quizNames = useMemo(() => [...new Set(list.map(r => r.quizName))].sort(), [list])

  const filtered = list.filter(r => {
    if (quizFilter && r.quizName !== quizFilter) return false
    const name = `${r.firstName} ${r.lastName}`.toLowerCase()
    return name.includes(search.trim().toLowerCase())
  })

  const renderTable = () => {
    if (loading && list.length === 0) return <Loader />
    if (error) return <p className={classes.Empty}>Не вдалося завантажити результати: {error}</p>
    if (list.length === 0) return <p className={classes.Empty}>Ще немає результатів. Пройдіть тест!</p>
    if (filtered.length === 0) return <p className={classes.Empty}>Нічого не знайдено</p>

    return (
      <div className={classes.TableScroll}>
        <table className={classes.Table}>
          <thead>
            <tr>
              <th>№</th>
              <th>Учасник</th>
              <th>Тест</th>
              <th>Результат</th>
              <th>Оцінка</th>
              <th>Час</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((result, index) => {
              const percent = result.percent ?? percentOf(result.score, result.total)
              return (
                <tr key={result.id}>
                  <td>{index + 1}</td>
                  <td>{result.firstName} {result.lastName}</td>
                  <td>{result.quizName}</td>
                  <td>{result.score} / {result.total} ({percent}%)</td>
                  <td>{result.grade || getGrade(percent)}</td>
                  <td>
                    {result.timeSpent != null ? formatTime(result.timeSpent) : '—'}
                    {result.timedOut ? <i className="fa fa-hourglass-end" title="Час вичерпано" /> : null}
                  </td>
                  <td>{result.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={classes.Results}>
      <div className={classes.ResultsCard}>
        <h1>Результати учасників</h1>
        {list.length ? (
          <div className={classes.Filters}>
            <select value={quizFilter} onChange={e => setQuizFilter(e.target.value)}>
              <option value="">Усі тести</option>
              {quizNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <input
              type="search"
              placeholder="Пошук за ім'ям"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        ) : null}
        {renderTable()}
      </div>
    </div>
  )
}

export default Results
