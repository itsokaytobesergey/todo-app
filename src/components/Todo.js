import React from "react"

const Todo = (props) => {
  const {
    todo,
    deleteTodo,
    toggleTodo,
    setEditTodoTitle,
    editTodoTitle,
    editTodo,
    returnEditedTodo,
    setEditTodoText,
    editTodoText,
  } = props
  return (
    <div className={`todo__item ${todo.isDone ? "isdone" : ""}`}>
      <div className="todo__text">
        <div>
          {`${!!todo.title ? "Title:" : ""}`}
          {todo.isEditing && (
            <input
              value={editTodoTitle}
              placeholder="Title"
              onChange={(e) => {
                setEditTodoTitle(e.target.value)
              }}
            />
          )}
          {!todo.isEditing && todo.title}
        </div>
        <div>
          {`${!!todo.text ? "Text:" : ""}`}
          {todo.isEditing && (
            <input
              value={editTodoText}
              placeholder="Text"
              onChange={(e) => {
                setEditTodoText(e.target.value)
              }}
            />
          )}
          {!todo.isEditing && todo.text}
        </div>
        <div>
          {`${!!todo.newdate ? "Date:" : ""}`}
          {todo.isEditing && (
            <input value={props.editTodoDate} onChange={(e) => props.setEditTodoDate(e.target.value)} />
          )}
          {!todo.isEditing && todo.newdate}
          {/* {`Data: ${todo.newdate}`} */}
        </div>
        <div>{`Прикрепленный файл: ${todo.attachedFile}`}</div>
        {todo.isEditing ? <p>To upload new pic just attach and upload new pic and click "save edit"</p> : ""}
        {todo.attachedFile !== "отсутствует" && (
          <img src={todo.attachedFileURL} style={{ width: "150px", height: "150px" }} alt="Todo pic" />
        )}
      </div>

      {todo.isEditing ? (
        <button
          className="Todo_button"
          onClick={() => {
            props.deleteTodoPic(todo.id)
          }}
        >
          DeletePic
        </button>
      ) : (
        ""
      )}
      {todo.isEditing ? (
        <button
          className="Todo_button"
          onClick={() => {
            returnEditedTodo(todo.id)
          }}
        >
          Save edit
        </button>
      ) : (
        !todo.isDone && (
          <button
            className="Todo_button"
            onClick={() => {
              setEditTodoTitle(todo.title)
              setEditTodoText(todo.text)
              props.setEditTodoDate(todo.newdate)
              editTodo(todo.id)
            }}
          >
            Edit
          </button>
        )
      )}

      <button
        className="Todo_button"
        onClick={() => {
          toggleTodo(todo.id)
        }}
      >
        Done
      </button>
      <button
        className="Todo_button"
        onClick={() => {
          deleteTodo(todo.id)
        }}
      >
        Delete
      </button>
    </div>
  )
}

export default Todo