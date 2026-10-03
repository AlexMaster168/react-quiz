import React from 'react'
import classes from './Button.module.css'

function Button(props) {
  const cls = [classes.Button, classes[props.type], props.small ? classes.small : '']

  return (
    <button
      type={props.htmlType || 'button'}
      onClick={props.onClick}
      className={cls.join(' ')}
      disabled={props.disabled}
      title={props.title}
    >
      {props.children}
    </button>
  )
}

export default Button
