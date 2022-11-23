import React from "react"
import Todo from "./Todo"

const TodoList = (props) => {
  const {
    todos,
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
    <div className="todolist">
      {!todos.length && <h3>No active todos</h3>}
      {todos.map((todo, index) => (
        <Todo
          todo={todo}
          key={todo.id}
          deleteTodo={deleteTodo}
          toggleTodo={toggleTodo}
          setEditTodoTitle={setEditTodoTitle}
          editTodoTitle={editTodoTitle}
          editTodo={editTodo}
          returnEditedTodo={returnEditedTodo}
          setEditTodoText={setEditTodoText}
          editTodoText={editTodoText}
          {...props}
        />
      ))}
    </div>
  )
}

export default TodoList
