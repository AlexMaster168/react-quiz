import React, { useState } from 'react'
import classes from './Layout.module.css'
import MenuToggle from '../../components/Navigation/MenuToggle/MenuToggle.jsx'
import Drawer from '../../components/Navigation/Drawer/Drawer.jsx'
import { useSelector } from 'react-redux'

function Layout({ children }) {
  const [menu, setMenu] = useState(false)
  const isAuthenticated = useSelector(state => !!state.auth.token)

  const toggleMenuHandler = () => setMenu(!menu)
  const menuCloseHandler = () => setMenu(false)

  return (
    <div className={classes.Layout}>
      <Drawer
        isOpen={menu}
        onClose={menuCloseHandler}
        isAuthenticated={isAuthenticated}
      />
      <MenuToggle
        onToggle={toggleMenuHandler}
        isOpen={menu}
      />
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
