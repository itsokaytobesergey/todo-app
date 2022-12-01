import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import dayjs from "dayjs"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"
import { storage, database } from "./components/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ref as refdb, set, get, remove, onValue, update, push, child } from "firebase/database"
import "dayjs/locale/ru"
import "./App.css"

function App() {
  //установка даты для сегодня
  const todaydate = dayjs(new Date()).hour(0).minute(0).second(0).millisecond(0)

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

      const expiredTodos = arr.filter((todo) => todaydate > dayjs(todo.newdate))
      // console.log(expiredTodos)
      expiredTodos.forEach((todo) => {
        update(refdb(database, `todos/${todo.key}`), {
          isDone: true,
        })
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

  //add new todo
  const addTodoHandler = (title, text, startDate, isDone, attachedFileURL, isEditing = false) => {
    const newdate = dayjs(startDate).$d.toString()
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
    // console.log(newTodo)
    writeUserData(newTodo)
    setSelectedFile(null)
  }

  //function to update todo parameters in FireBase after creating todo

  const writeUserData = (todo) => {
    const newTodoKey = push(child(refdb(database), `todos/${todo.id}`)).key
    set(refdb(database, "todos/" + newTodoKey), {
      id: todo.id,
      isDone: todo.isDone,
      isEditing: todo.isEditing,
      title: todo.title,
      text: todo.text,
      newdate: todo.newdate,
      attachedFile: todo.attachedFile,
      attachedFileURL: todo.attachedFileURL,
      key: newTodoKey,
    })
  }

  //delete todo
  const deleteTodoHandler = (id) => {
    remove(refdb(database, `todos/${id}`))
    setTodos(todos.filter((todo) => todo.key !== id))
  }
  //delete todo pic
  const [deleteTodoPicHandler, setDeleteTodoPicHandler] = useState(false)
  const deleteTodoPic = (id) => {
    setDeleteTodoPicHandler(!deleteTodoPicHandler)
  }
  //кнопка edit
  const toggleTodoHandlerEdit = (id) => {
    update(refdb(database, `todos/${id}`), {
      isEditing: true,
    })
  }

  //кнопка save edit
  const returnEditedTodo = (id) => {
    setProgress(0)

    ////обновление даты в FireBase после ввода новой в инпут
    get(refdb(database, `todos/${id}/newdate`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()

        let day = editTodoDate.slice(0, 2)
        let month = editTodoDate.slice(3, 5)
        let year = editTodoDate.slice(6, 10)
        setNewDataToServer(day, month, year)

        function setNewDataToServer(day, month, year) {
          let newDataToServer = dayjs(data)
            .date(day)
            .month(month - 1)
            .year(year)
            .$d.toString()

          update(refdb(database, `todos/${id}`), {
            newdate: newDataToServer,
          })
        }
      }
    })

    if (!todoURL) {
      update(refdb(database, `todos/${id}`), {
        title: editTodoTitle,
        text: editTodoText,
      })
    }
    if (todoURL) {
      update(refdb(database, `todos/${id}`), {
        title: editTodoTitle,
        text: editTodoText,
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

    //// update isDone on the server side if todayday = newdate
    // get(refdb(database, `todos/${id}/newdate`)).then((snapshot) => {
    //   if (snapshot.exists()) {
    //     const data = snapshot.val()
    //     if (data === null) return
    //     if (dayjs(data).hour(0).minute(0).second(0).millisecond(0).$d.toString() === dayjs(todaydate).$d.toString()) {
    //       get(refdb(database, `todos/${id}/isDone`)).then((snapshot) => {
    //         if (snapshot.exists()) {
    //           const data = snapshot.val()
    //           console.log(`DATA TRUE`)
    //           if (data === null) return
    //           if (data === true) {
    //             update(refdb(database, `todos/${id}`), {
    //               isDone: false,
    //             })
    //           }
    //         }
    //       })
    //     }
    //   }
    // })

    ////clear attached file input
    setTestInputKey(Date.now())
    setTodoURL(null)
    setSelectedFile(null)

    update(refdb(database, `todos/${id}`), {
      isEditing: false,
    })
  }

  //кнопка done
  const toggleTodoHandlerDone = (id) => {
    const pickTodoIsDone = todos.find((todo) => todo.key === id)

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
