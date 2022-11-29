import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import dayjs from "dayjs"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"
import { storage, database } from "./components/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ref as refdb, set, get, remove, onValue, update } from "firebase/database"
import "dayjs/locale/ru"
import "./App.css"

function App() {
  //установка даты для сегодня
  const todaydate = dayjs(new Date()).locale("ru").format("DD.MM.YYYY")

  const [todos, setTodos] = useState([])
  const [editTodoTitle, setEditTodoTitle] = useState("")
  const [editTodoText, setEditTodoText] = useState("")
  const [editTodoDate, setEditTodoDate] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [testInputKey, setTestInputKey] = useState()
  const [progress, setProgress] = useState(0)
  const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true)
  const [todoURL, setTodoURL] = useState(null)

  // Firebase
  //// получение данных с firebase
  useEffect(() => {
    const todosRef = refdb(database, "todos")
    onValue(todosRef, (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      let arr = []
      Object.keys(data).forEach((key) => {
        arr.push(data[key])
      })

      const expiredTodos = arr.filter((todo) => todaydate > todo.newdate)
      expiredTodos.forEach((todo) => {
        update(refdb(database, `todos/${todo.id}`), {
          isDone: true,
        })
      })

      setTodos(arr)
      console.log(arr)
    })
  }, [setTodos])

  ////select file and upload handlers
  const selectFileHandler = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const uploadFileHandler = () => {
    if (!selectedFile) {
      return alert("Please upload an image first!")
    }
    const storageRef = ref(storage, `/files/${selectedFile.name}`)
    const uploadTask = uploadBytesResumable(storageRef, selectedFile)
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setProgress(prog)
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log("File available at", downloadURL)
          setTodoURL(downloadURL)
        })
      }
    )
    setIsSubmitButtonVisible(false)
  }

  //add new todo
  const addTodoHandler = (title, text, startDate, isDone, attachedFileURL, isEditing = false) => {
    const newdate = dayjs(startDate).locale("ru").format("DD.MM.YYYY")
    const attachedfile = selectedFile ? selectedFile.name : "отсутствует"

    const newTodo = {
      id: uuidv4(),
      isDone,
      title,
      text,
      newdate,
      isEditing,
      attachedFileURL,
      attachedFile: attachedfile,
    }
    writeUserData(newTodo)
    setSelectedFile(null)
  }

  //function to update todo parameters in FireBase after creating todo
  const writeUserData = (todo) => {
    set(refdb(database, "todos/" + todo.id), {
      id: todo.id,
      isDone: todo.isDone,
      isEditing: todo.isEditing,
      title: todo.title,
      text: todo.text,
      newdate: todo.newdate,
      attachedFile: todo.attachedFile,
      attachedFileURL: todo.attachedFileURL,
    })
  }

  //delete todo
  const deleteTodoHandler = (id) => {
    remove(refdb(database, `todos/${id}`))
    setTodos(todos.filter((todo) => todo.id !== id))
  }
  //delete todo pic
  const [deleteTodoPicHandler, setDeleteTodoPicHandler] = useState(false)
  const deleteTodoPic = (id) => {
    setDeleteTodoPicHandler(!deleteTodoPicHandler)
  }
  //кнопка edit
  const toggleTodoHandlerEdit = (id) => {
    setTodos(
      todos.map((todo) => {
        return todo.id === id ? { ...todo, isEditing: !todo.isEditing } : { ...todo, isEditing: false }
      })
    )
  }

  //кнопка save edit
  const returnEditedTodo = (id) => {
    setProgress(0)

    if (!todoURL) {
      update(refdb(database, `todos/${id}`), {
        title: editTodoTitle,
        text: editTodoText,
        newdate: editTodoDate,
      })
    }
    if (todoURL) {
      update(refdb(database, `todos/${id}`), {
        title: editTodoTitle,
        text: editTodoText,
        newdate: editTodoDate,
        attachedFileURL: todoURL,
        attachedFile: selectedFile.name,
      })
    }
    ////проверка и очистка картинки и названия после save edit
    if (deleteTodoPicHandler === true) {
      remove(refdb(database, `todos/${id}/attachedFileURL`))
      update(refdb(database, `todos/${id}/`), {
        attachedFile: "отсутствует",
      })
      setDeleteTodoPicHandler(false)
    }

    ////update todos data on clien side after saving edited todo

    get(refdb(database, `todos/`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data === null) return
        let arr = []
        Object.keys(data).forEach((key) => {
          arr.push(data[key])
        })
        setTodos(arr)
      }
    })

    ////update isDone on the server side if todayday = newdate
    get(refdb(database, `todos/${id}/newdate`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data === null) return
        if (data === todaydate) {
          get(refdb(database, `todos/${id}/isDone`)).then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val()
              if (data === null) return
              if (data === true) {
                update(refdb(database, `todos/${id}`), {
                  isDone: false,
                })
              }
            }
          })
        }
      }
    })

    ////clear attached file input
    setTestInputKey(Date.now())
    setTodoURL(null)
    setSelectedFile(null)
  }

  //кнопка done
  const toggleTodoHandlerDone = (id) => {
    const pickTodoIsDone = todos.find((todo) => todo.id === id)

    update(refdb(database, `todos/${id}`), {
      isDone: !pickTodoIsDone.isDone,
    })
  }

  return (
    <div className="app">
      <h1>Todo App</h1>
      <TodoForm
        addTodo={addTodoHandler}
        selectFileHandler={selectFileHandler}
        uploadFileHandler={uploadFileHandler}
        testInputKey={testInputKey}
        setTestInputKey={setTestInputKey}
        downloadURL={todoURL}
        progress={progress}
        isSubmitButtonVisible={isSubmitButtonVisible}
        setIsSubmitButtonVisible={setIsSubmitButtonVisible}
        setProgress={setProgress}
      />
      <TodoList
        todos={todos}
        deleteTodo={deleteTodoHandler}
        toggleTodo={toggleTodoHandlerDone}
        editTodo={toggleTodoHandlerEdit}
        setEditTodoTitle={setEditTodoTitle}
        editTodoTitle={editTodoTitle}
        returnEditedTodo={returnEditedTodo}
        setEditTodoText={setEditTodoText}
        editTodoText={editTodoText}
        selectedFile={selectedFile}
        editTodoDate={editTodoDate}
        setEditTodoDate={setEditTodoDate}
        deleteTodoPic={deleteTodoPic}
        deleteTodoPicHandler={deleteTodoPicHandler}
      />
    </div>
  )
}
export default App
