import React, { useState } from 'react'
import classes from './Auth.module.css'
import Button from '../../components/UI/Button/Button.jsx'
import Input from '../../components/UI/Input/Input.jsx'
import is from 'is_js'
import { useDispatch } from 'react-redux'
import { auth } from '../../store/slices/authSlice.js'

function Auth() {
  const dispatch = useDispatch()

  const [formControls, setFormControls] = useState({
    email: {
      value: '',
      type: 'email',
      label: 'Email',
      errorMessage: 'Введіть коректний email',
      valid: false,
      touched: false,
      validation: { required: true, email: true }
    },
    password: {
      value: '',
      type: 'password',
      label: 'Пароль',
      errorMessage: 'Введіть коректний пароль',
      valid: false,
      touched: false,
      validation: { required: true, minLength: 6 }
    }
  })

  const [isFormValid, setIsFormValid] = useState(false)

  const validateControl = (value, validation) => {
    if (!validation) return true
    let isValid = true
    if (validation.required) {
      isValid = value.trim() !== '' && isValid
    }
    if (validation.email) {
      isValid = is.email(value) && isValid
    }
    if (validation.minLength) {
      isValid = value.length >= validation.minLength && isValid
    }
    return isValid
  }

  const onChangeHandler = (event, controlName) => {
    const updated = { ...formControls }
    const control = { ...updated[controlName] }
    control.value = event.target.value
    control.touched = true
    control.valid = validateControl(control.value, control.validation)
    updated[controlName] = control

    let valid = true
    Object.keys(updated).forEach(name => {
      valid = updated[name].valid && valid
    })

    setFormControls(updated)
    setIsFormValid(valid)
  }

  const loginHandler = () => {
    dispatch(auth({
      email: formControls.email.value,
      password: formControls.password.value,
      isLogin: true
    }))
  }

  const registerHandler = () => {
    dispatch(auth({
      email: formControls.email.value,
      password: formControls.password.value,
      isLogin: false
    }))
  }

  const submitHandler = event => event.preventDefault()

  const renderInputs = () => {
    return Object.keys(formControls).map((controlName, index) => {
      const control = formControls[controlName]
      return (
        <Input
          key={controlName + index}
          type={control.type}
          value={control.value}
          valid={control.valid}
          touched={control.touched}
          label={control.label}
          shouldValidate={!!control.validation}
          errorMessage={control.errorMessage}
          onChange={event => onChangeHandler(event, controlName)}
        />
      )
    })
  }

  return (
    <div className={classes.Auth}>
      <div>
        <h1>Авторизація</h1>
        <form onSubmit={submitHandler} className={classes.AuthForm}>
          {renderInputs()}
          <Button type="success" onClick={loginHandler} disabled={!isFormValid}>
            Увійти
          </Button>
          <Button type="primary" onClick={registerHandler} disabled={!isFormValid}>
            Зареєструватися
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Auth
