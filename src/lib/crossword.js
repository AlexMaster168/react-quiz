import { shuffleArray } from './quizModel.js'

export function normalizeWord(s) {
  return (s || '').toUpperCase().replace(/[^\p{L}\p{N}]/gu, '')
}

export const cellKey = (r, c) => `${r},${c}`

function tryBuild(order) {
  const grid = new Map() // "r,c" -> { ch, across: bool, down: bool }
  const placed = []
  const box = { minR: 0, maxR: 0, minC: 0, maxC: 0 }

  const put = (w, r, c, dir) => {
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0
    for (let i = 0; i < w.answer.length; i++) {
      const key = cellKey(r + dr * i, c + dc * i)
      const cell = grid.get(key) || { ch: w.answer[i], across: false, down: false }
      cell[dir] = true
      grid.set(key, cell)
    }
    box.minR = Math.min(box.minR, r)
    box.minC = Math.min(box.minC, c)
    box.maxR = Math.max(box.maxR, r + dr * (w.answer.length - 1))
    box.maxC = Math.max(box.maxC, c + dc * (w.answer.length - 1))
    placed.push({ ...w, row: r, col: c, dir })
  }

  // Returns number of intersections, or -1 if the word can't go there
  const fit = (word, r, c, dir) => {
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0
    const len = word.length
    if (grid.has(cellKey(r - dr, c - dc)) || grid.has(cellKey(r + dr * len, c + dc * len))) return -1
    let crossings = 0
    for (let i = 0; i < len; i++) {
      const rr = r + dr * i
      const cc = c + dc * i
      const cell = grid.get(cellKey(rr, cc))
      if (cell) {
        if (cell.ch !== word[i] || cell[dir]) return -1
        crossings++
      } else if (grid.has(cellKey(rr + dc, cc + dr)) || grid.has(cellKey(rr - dc, cc - dr))) {
        return -1
      }
    }
    return crossings
  }

  const findSpot = word => {
    let best = null
    for (const [key, cell] of grid) {
      const [r, c] = key.split(',').map(Number)
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== cell.ch) continue
        for (const dir of ['across', 'down']) {
          if (cell[dir]) continue
          const sr = dir === 'down' ? r - i : r
          const sc = dir === 'across' ? c - i : c
          const crossings = fit(word, sr, sc, dir)
          if (crossings < 1) continue
          const endR = dir === 'down' ? sr + word.length - 1 : sr
          const endC = dir === 'across' ? sc + word.length - 1 : sc
          const area = (Math.max(box.maxR, endR) - Math.min(box.minR, sr) + 1) *
            (Math.max(box.maxC, endC) - Math.min(box.minC, sc) + 1)
          const score = crossings * 1000 - area
          if (!best || score > best.score) best = { r: sr, c: sc, dir, score }
        }
      }
    }
    return best
  }

  const [first, ...rest] = order
  put(first, 0, 0, Math.random() < 0.5 ? 'across' : 'down')
  let pending = rest
  let progress = true
  while (pending.length && progress) {
    progress = false
    const left = []
    for (const w of pending) {
      const spot = findSpot(w.answer)
      if (spot) {
        put(w, spot.r, spot.c, spot.dir)
        progress = true
      } else {
        left.push(w)
      }
    }
    pending = left
  }

  const crossings = [...grid.values()].filter(c => c.across && c.down).length
  return { placed, box, crossings }
}

function isBetter(a, b) {
  if (a.placed.length !== b.placed.length) return a.placed.length > b.placed.length
  const areaA = (a.box.maxR - a.box.minR + 1) * (a.box.maxC - a.box.minC + 1)
  const areaB = (b.box.maxR - b.box.minR + 1) * (b.box.maxC - b.box.minC + 1)
  if (areaA !== areaB) return areaA < areaB
  return a.crossings > b.crossings
}

/**
 * entries: [{ answer, clue }]
 * returns { layout: { rows, cols, words: [{ answer, clue, row, col, dir, number }] } | null, unplaced: [entry] }
 */
export function generateCrossword(entries, attempts = 40) {
  const words = entries
    .map((e, idx) => ({ answer: normalizeWord(e.answer), clue: (e.clue || '').trim(), idx }))
    .filter(w => w.answer.length >= 2)

  if (words.length === 0) return { layout: null, unplaced: entries }

  const byLength = [...words].sort((a, b) => b.answer.length - a.answer.length)
  let best = null
  for (let a = 0; a < attempts; a++) {
    const order = a === 0 ? byLength : shuffleArray(words)
    const result = tryBuild(order)
    if (!best || isBetter(result, best)) best = result
  }

  const { placed, box } = best
  const shifted = placed.map(w => ({ ...w, row: w.row - box.minR, col: w.col - box.minC }))

  // Number clues in reading order; words starting in the same cell share a number
  const starts = [...new Set(shifted.map(w => cellKey(w.row, w.col)))]
    .map(k => k.split(',').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const numbers = new Map(starts.map(([r, c], i) => [cellKey(r, c), i + 1]))

  const placedIdx = new Set(placed.map(w => w.idx))
  return {
    layout: {
      rows: box.maxR - box.minR + 1,
      cols: box.maxC - box.minC + 1,
      words: shifted
        .map(({ answer, clue, row, col, dir }) => ({
          answer, clue, row, col, dir, number: numbers.get(cellKey(row, col))
        }))
        .sort((a, b) => a.number - b.number)
    },
    unplaced: entries.filter((_, i) => !placedIdx.has(i))
  }
}

export function wordCells(word) {
  const cells = []
  for (let i = 0; i < word.answer.length; i++) {
    cells.push(word.dir === 'across' ? [word.row, word.col + i] : [word.row + i, word.col])
  }
  return cells
}

// 2D grid: null for blocks, { ch, number, across, down } where across/down are word indexes
export function buildCells(layout) {
  const cells = Array.from({ length: layout.rows }, () => Array(layout.cols).fill(null))
  layout.words.forEach((word, index) => {
    wordCells(word).forEach(([r, c], i) => {
      const cell = cells[r][c] || { ch: word.answer[i], number: null, across: null, down: null }
      cell[word.dir] = index
      if (i === 0) cell.number = word.number
      cells[r][c] = cell
    })
  })
  return cells
}

export function scoreCrossword(layout, input) {
  const wordResults = layout.words.map(word =>
    wordCells(word).every(([r, c], i) => (input[cellKey(r, c)] || '') === word.answer[i])
  )
  return {
    wordResults,
    score: wordResults.filter(Boolean).length,
    total: layout.words.length
  }
}
