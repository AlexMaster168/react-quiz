import React, { useState } from 'react'
import classes from './QuizCreator.module.css'
import Button from '../../components/UI/Button/Button.jsx'
import Input from '../../components/UI/Input/Input.jsx'
import Select from '../../components/UI/Select/Select.jsx'
import { createControl, validate, validateForm } from '../../form/formFramework.js'
import Auxiliary from '../../hoc/Auxiliary/Auxiliary.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { createQuizQuestion, finishCreateQuiz } from '../../store/slices/createSlice.js'

function createOptionControl(number) {
  return createControl({
    label: `Варіант ${number}`,
    errorMessage: 'Значення не може бути порожнім',
    id: number
  }, { required: true })
}

function createFormControls() {
  return {
    question: createControl({
      label: 'Введіть питання',
      errorMessage: 'Питання не може бути порожнім'
    }, { required: true }),
    option1: createOptionControl(1),
    option2: createOptionControl(2),
    option3: createOptionControl(3),
    option4: createOptionControl(4)
  }
}

function QuizCreator() {
  const dispatch = useDispatch()
  const quiz = useSelector(state => state.create.quiz)

  const [formControls, setFormControls] = useState(createFormControls())
  const [isFormValid, setIsFormValid] = useState(false)
  const [rightAnswerId, setRightAnswerId] = useState(1)

  const submitHandler = event => event.preventDefault()

  const addQuestionHandler = event => {
    event.preventDefault()
    const { question, option1, option2, option3, option4 } = formControls
    const questionItem = {
      question: question.value,
      id: quiz.length + 1,
      rightAnswerId,
      answers: [
        { text: option1.value, id: option1.id },
        { text: option2.value, id: option2.id },
        { text: option3.value, id: option3.id },
        { text: option4.value, id: option4.id }
      ]
    }
    dispatch(createQuizQuestion(questionItem))
    setFormControls(createFormControls())
    setIsFormValid(false)
    setRightAnswerId(1)
  }

  const createQuizHandler = event => {
    event.preventDefault()
    setFormControls(createFormControls())
    setIsFormValid(false)
    setRightAnswerId(1)
    dispatch(finishCreateQuiz())
  }

  const changeHandler = (value, controlName) => {
    const updated = { ...formControls }
    const control = { ...updated[controlName] }
    control.touched = true
    control.value = value
    control.valid = validate(control.value, control.validation)
    updated[controlName] = control
    setFormControls(updated)
    setIsFormValid(validateForm(updated))
  }

  const selectChangeHandler = event => {
    setRightAnswerId(+event.target.value)
  }

  const renderControls = () => {
    return Object.keys(formControls).map((controlName, index) => {
      const control = formControls[controlName]
      return (
        <Auxiliary key={controlName + index}>
          <Input
            label={control.label}
            value={control.value}
            valid={control.valid}
            shouldValidate={!!control.validation}
            touched={control.touched}
            errorMessage={control.errorMessage}
            onChange={event => changeHandler(event.target.value, controlName)}
          />
          {index === 0 ? <hr /> : null}
        </Auxiliary>
      )
    })
  }

  const select = (
    <Select
      label="Оберіть правильну відповідь"
      value={rightAnswerId}
      onChange={selectChangeHandler}
      options={[
        { text: 1, value: 1 },
        { text: 2, value: 2 },
        { text: 3, value: 3 },
        { text: 4, value: 4 }
      ]}
    />
  )

  return (
    <div className={classes.QuizCreator}>
      <div>
        <h1>Створення тесту</h1>
        <form onSubmit={submitHandler}>
          {renderControls()}
          {select}
          <Button type="primary" onClick={addQuestionHandler} disabled={!isFormValid}>
            Додати питання
          </Button>
          <Button type="success" onClick={createQuizHandler} disabled={quiz.length === 0}>
            Створити тест
          </Button>
        </form>
      </div>
    </div>
  )
}

export default QuizCreator
