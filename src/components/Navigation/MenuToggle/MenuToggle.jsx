import React from 'react'
import classes from './MenuToggle.module.css'

function MenuToggle({ isOpen, onToggle }) {
  const cls = [classes.MenuToggle, 'fa']
  if (isOpen) {
    cls.push('fa-times')
    cls.push(classes.open)
  } else {
    cls.push('fa-bars')
  }

  return (
    <i
      className={cls.join(' ')}
      onClick={onToggle}
    />
  )
}

export default MenuToggle
