import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCREYWwIwsnC5U49IGJJ9LlNafbRkvsqBY",
  authDomain: "chat-bot-61b95.firebaseapp.com",
  projectId: "chat-bot-61b95",
  storageBucket: "chat-bot-61b95.appspot.com",
  messagingSenderId: "1000127531969",
  appId: "1:1000127531969:web:2dfec4799304b350507d40",
  measurementId: "G-3VHK53QH9Z",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
