import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import dayjs from "dayjs"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"
import { storage, database } from "./components/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ref as refdb, set, get, remove, onValue, update, child } from "firebase/database"
import "dayjs/locale/ru"
import "./App.css"

function App() {
  //dayjs
  let advancedFormat = require("dayjs/plugin/advancedFormat")
  dayjs.extend(advancedFormat)

  const [todos, setTodos] = useState([])
  const [editTodoTitle, setEditTodoTitle] = useState("")
  const [editTodoText, setEditTodoText] = useState("")
  const [editTodoDate, setEditTodoDate] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [testInputKey, setTestInputKey] = useState()
  const [progress, setProgress] = useState(0)
  const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true)
  const [todoURL, setTodoURL] = useState(null)

  //updateData
  const updateDataAfterReturning = () => {
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
  }

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
      let filteredArr = arr.filter((todo) => {
        let todaydate = dayjs(new Date()).locale("ru").format("DD.MM.YYYY")
        return todaydate > todo.newdate
          ? update(refdb(database, `todos/${todo.id}`), {
              isDone: true,
            })
          : console.log()
      })
      setTodos(arr)
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

  //function to update todo parameters in FireBase
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

  //add new todo
  const addTodoHandler = (title, text, startDate, isDone, isEditing, attachedFileURL) => {
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

  //delete todo
  const deleteTodoHandler = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))

    remove(refdb(database, `todos/${id}`))
  }
  //delete todo pic
  const deleteTodoPic = (id) => {
    remove(refdb(database, `todos/${id}/attachedFileURL`))
    update(refdb(database, `todos/${id}/`), {
      attachedFile: "отсутствует",
    })
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
    updateDataAfterReturning()
    setTodoURL(null)
    setSelectedFile(null)
  }
  //кнопка done
  const toggleTodoHandlerDone = (id) => {
    // setTodos(
    //   todos.map((todo) => {
    //     return todo.id === id ? { ...todo, isDone: !todo.isDone, isEditing: false } : { ...todo }
    //   })
    // )
    let isDoneForDb
    todos.filter((todo) => {
      return todo.id === id ? (isDoneForDb = todo.isDone) : isDoneForDb
    })
    update(refdb(database, `todos/${id}`), {
      isDone: !isDoneForDb,
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
      />
    </div>
  )
}

export default App