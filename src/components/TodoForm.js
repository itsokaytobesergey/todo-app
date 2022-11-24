import React, { useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import format from "date-fns/format"
import dayjs from "dayjs"
import "react-datepicker/dist/react-datepicker.css"

const TodoForm = (props) => {
  const { addTodo, selectFileHandler, uploadFileHandler } = props
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")

  //пока файл загружается, обновляем состояние кнопки submit - визуальное изменение фона
  useEffect(() => {
    props.setIsSubmitButtonVisible(true)
  }, [props.downloadURL])

  //сабмит формы
  const onSubmitHandler = (event) => {
    event.preventDefault()
    //reset for input of attached files
    props.setTestInputKey(Date.now())

    //Check if todo is already done
    const thisDay = dayjs(new Date()).hour(0).minute(0).second(0)
    let isDone = false
    if (startDate <= thisDay) {
      isDone = true
    }
    const attachedFileURL = props.downloadURL
    let isEditing = false
    addTodo(title, text, startDate, isDone, isEditing, attachedFileURL)
    setTitle("")
    setText("")
    isDone = false

    //reset progress bar
    props.setProgress(0)
  }

  //datekeeper для наглядного отображение календаря
  const [startDate, setStartDate] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const handleChange = (e) => {
    setIsOpen(!isOpen)
    setStartDate(e)
  }
  const handleClick = (e) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }
  return (
    <>
      <form onSubmit={onSubmitHandler} className="form">
        <input
          className="form__input"
          placeholder="Title todo"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
          }}
        />
        <input
          className="form__input"
          placeholder="Text todo"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
          }}
        />
        <button className="todo__datepicker" onClick={handleClick}>
          {`Дата: ${format(startDate, "dd-MM-yyyy")}`}
        </button>
        <input
          key={props.testInputKey}
          type="file"
          accept="/image/*"
          onChange={(e) => {
            selectFileHandler(e)
          }}
        />
        <button type="button" onClick={() => uploadFileHandler()} className="form__button">
          Upload image
        </button>

        {props.isSubmitButtonVisible && (
          <button type="submit" className="form__button">
            Submit
          </button>
        )}
        {!props.isSubmitButtonVisible && (
          <div type="submit" className="form__button isNotAvailable">
            Submit
          </div>
        )}

        {props.progress !== 0 && <p>Uploading done {props.progress}%</p>}

        {isOpen && (
          <DatePicker
            selected={startDate}
            onChange={handleChange}
            inline
            popperProps={{
              positionFixed: true,
            }}
          />
        )}
      </form>
    </>
  )
}

export default TodoForm
