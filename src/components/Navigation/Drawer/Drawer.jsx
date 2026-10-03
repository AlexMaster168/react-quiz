import React from 'react'
import classes from './Drawer.module.css'
import { NavLink } from 'react-router-dom'
import Backdrop from '../../UI/Backdrop/Backdrop.jsx'

function Drawer({ isOpen, onClose, isAuthenticated }) {
  const clickHandler = () => onClose()

  const links = [
    { to: '/', label: 'Список', exact: true },
    { to: '/results', label: 'Результати', exact: false }
  ]

  if (isAuthenticated) {
    links.push({ to: '/quiz-creator', label: 'Створити', exact: true })
    links.push({ to: '/about', label: 'Про додаток', exact: false })
    links.push({ to: '/logout', label: 'Вийти', exact: false })
  } else {
    links.push({ to: '/about', label: 'Про додаток', exact: false })
    links.push({ to: '/auth', label: 'Авторизація', exact: false })
  }

  const cls = [classes.Drawer]
  if (!isOpen) {
    cls.push(classes.close)
  }

  return (
    <>
      <nav className={cls.join(' ')}>
        <ul>
          {links.map((link, index) => (
            <li key={index}>
              <NavLink
                to={link.to}
                end={link.exact}
                className={({ isActive }) => isActive ? classes.active : ''}
                onClick={clickHandler}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {isOpen ? <Backdrop onClick={onClose} /> : null}
    </>
  )
}

export default Drawer
