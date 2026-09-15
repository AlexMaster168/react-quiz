import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPlayerInfo } from '../../store/slices/playerSlice.js'
import Button from '../../components/UI/Button/Button.jsx'
import Input from '../../components/UI/Input/Input.jsx'
import classes from './PlayerForm.module.css'

function PlayerForm() {
  const dispatch = useDispatch()
  const player = useSelector(state => state.player)

  const [firstName, setFirstName] = useState(player.firstName || '')
  const [lastName, setLastName] = useState(player.lastName || '')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!firstName.trim()) newErrors.firstName = 'Введіть ім\'я'
    if (!lastName.trim()) newErrors.lastName = 'Введіть прізвище'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      dispatch(setPlayerInfo({ firstName: firstName.trim(), lastName: lastName.trim() }))
    }
  }

  if (player.isRegistered) {
    return null
  }

  return (
    <div className={classes.PlayerForm}>
      <div className={classes.PlayerFormCard}>
        <h1>Введіть ваші дані</h1>
        <form onSubmit={handleSubmit}>
          <Input
            label="Ім'я"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            valid={!errors.firstName}
            shouldValidate={true}
            touched={!!firstName}
            errorMessage={errors.firstName}
          />
          <Input
            label="Прізвище"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            valid={!errors.lastName}
            shouldValidate={true}
            touched={!!lastName}
            errorMessage={errors.lastName}
          />
          <Button type="primary" onClick={handleSubmit}>
            Розпочати тест
          </Button>
        </form>
      </div>
    </div>
  )
}

export default PlayerForm
