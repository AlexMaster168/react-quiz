import React, { useMemo, useRef, useState } from 'react'
import classes from './Crossword.module.css'
import { buildCells, cellKey, normalizeWord, wordCells } from '../../lib/crossword.js'

const OTHER_DIR = { across: 'down', down: 'across' }

/**
 * mode: 'play' — editable grid with clues
 *       'review' — read-only, wrong cells highlighted, correct answers shown
 *       'preview' — read-only, answers shown (used in the editor)
 */
function Crossword({ layout, input = {}, onCellChange, mode = 'play' }) {
  const cells = useMemo(() => buildCells(layout), [layout])
  const refs = useRef({})
  const programmaticFocus = useRef(false)
  const [active, setActive] = useState(null) // { row, col, dir }

  const editable = mode === 'play'
  const activeWordIndex = active ? cells[active.row][active.col][active.dir] : null
  const activeWord = activeWordIndex != null ? layout.words[activeWordIndex] : null
  const activeCells = new Set(activeWord ? wordCells(activeWord).map(([r, c]) => cellKey(r, c)) : [])

  const focusCell = (row, col, dir) => {
    const cell = cells[row]?.[col]
    if (!cell) return false
    const nextDir = cell[dir] != null ? dir : OTHER_DIR[dir]
    setActive({ row, col, dir: nextDir })
    const el = refs.current[cellKey(row, col)]
    if (el) {
      programmaticFocus.current = true
      el.focus()
      el.select()
      programmaticFocus.current = false
    }
    return true
  }

  const step = (row, col, dir, delta) => {
    const r = dir === 'down' ? row + delta : row
    const c = dir === 'across' ? col + delta : col
    if (cells[r]?.[c]) focusCell(r, c, dir)
  }

  const handleFocus = (row, col) => {
    if (programmaticFocus.current) return
    if (active && active.row === row && active.col === col) return
    focusCell(row, col, active?.dir || 'across')
  }

  const handleClick = (row, col) => {
    const cell = cells[row][col]
    if (active && active.row === row && active.col === col && cell.across != null && cell.down != null) {
      setActive({ row, col, dir: OTHER_DIR[active.dir] })
    }
  }

  const handleChange = (event, row, col) => {
    const letters = normalizeWord(event.target.value)
    const value = letters.slice(-1)
    onCellChange(row, col, value)
    if (value && active) step(row, col, active.dir, 1)
  }

  const handleKeyDown = (event, row, col) => {
    const dir = active?.dir || 'across'
    switch (event.key) {
      case 'Backspace':
        if (!input[cellKey(row, col)]) {
          event.preventDefault()
          const r = dir === 'down' ? row - 1 : row
          const c = dir === 'across' ? col - 1 : col
          if (cells[r]?.[c]) {
            onCellChange(r, c, '')
            focusCell(r, c, dir)
          }
        }
        break
      case 'ArrowRight': event.preventDefault(); step(row, col, 'across', 1); break
      case 'ArrowLeft': event.preventDefault(); step(row, col, 'across', -1); break
      case 'ArrowDown': event.preventDefault(); step(row, col, 'down', 1); break
      case 'ArrowUp': event.preventDefault(); step(row, col, 'down', -1); break
      default:
    }
  }

  const renderCell = (cell, row, col) => {
    if (!cell) return <div key={col} className={classes.Block} />
    const key = cellKey(row, col)
    const value = input[key] || ''
    const cls = [classes.Cell]
    if (activeCells.has(key)) cls.push(classes.inWord)
    if (active && active.row === row && active.col === col) cls.push(classes.current)
    if (mode === 'review') cls.push(value === cell.ch ? classes.right : classes.wrong)

    return (
      <div key={col} className={cls.join(' ')}>
        {cell.number ? <span className={classes.Number}>{cell.number}</span> : null}
        {editable ? (
          <input
            ref={el => { refs.current[key] = el }}
            value={value}
            onChange={e => handleChange(e, row, col)}
            onFocus={() => handleFocus(row, col)}
            onClick={() => handleClick(row, col)}
            onKeyDown={e => handleKeyDown(e, row, col)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-label={`Клітинка ${row + 1}-${col + 1}`}
          />
        ) : (
          <span className={classes.Letter}>
            {mode === 'review' && value !== cell.ch
              ? <><s>{value}</s><b>{cell.ch}</b></>
              : (mode === 'preview' ? cell.ch : value)}
          </span>
        )}
      </div>
    )
  }

  const renderClues = dir => {
    const items = layout.words
      .map((word, index) => ({ word, index }))
      .filter(({ word }) => word.dir === dir)
    if (!items.length) return null
    return (
      <div className={classes.ClueGroup}>
        <h3>{dir === 'across' ? 'По горизонталі' : 'По вертикалі'}</h3>
        <ol>
          {items.map(({ word, index }) => (
            <li
              key={index}
              className={index === activeWordIndex ? classes.activeClue : ''}
              onClick={editable ? () => focusCell(word.row, word.col, word.dir) : undefined}
            >
              <b>{word.number}.</b> {word.clue}
              {mode !== 'play' ? <em> — {word.answer}</em> : null}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className={classes.Crossword}>
      <div className={classes.GridScroll}>
        <div
          className={classes.Grid}
          style={{ gridTemplateColumns: `repeat(${layout.cols}, var(--cell))` }}
        >
          {cells.map((row, r) => row.map((cell, c) => renderCell(cell, r, c)))}
        </div>
      </div>
      <div className={classes.Clues}>
        {renderClues('across')}
        {renderClues('down')}
      </div>
    </div>
  )
}

export default Crossword
