import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"
//firebase
const firebaseConfig = {
  apiKey: "AIzaSyA7_CrQWytmjnxSPFJMuqwSnwE7Dm0jT9c",
  authDomain: "todo-app-test-1a802.firebaseapp.com",
  projectId: "todo-app-test-1a802",
  storageBucket: "todo-app-test-1a802.appspot.com",
  messagingSenderId: "842734749005",
  appId: "1:842734749005:web:d8739d4232e856b5f66304",
}

const app = initializeApp(firebaseConfig)

// Firebase storage reference
const storage = getStorage(firebaseConfig)
export default storage
