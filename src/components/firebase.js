import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"
import { getDatabase } from "firebase/database"

const app = initializeApp({
  apiKey: "AIzaSyA7_CrQWytmjnxSPFJMuqwSnwE7Dm0jT9c",
  authDomain: "todo-app-test-1a802.firebaseapp.com",
  projectId: "todo-app-test-1a802",
  storageBucket: "todo-app-test-1a802.appspot.com",
  messagingSenderId: "842734749005",
  appId: "1:842734749005:web:d8739d4232e856b5f66304",
  databaseURL: "https://todo-app-test-1a802-default-rtdb.europe-west1.firebasedatabase.app/",
})

const storage = getStorage(app)
const database = getDatabase(app)

export { storage, database }
