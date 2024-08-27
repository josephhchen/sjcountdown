// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZch3ABGafNJ98fD1MJQIypuTGoN6Tf1k",
  authDomain: "joeandserina-e8baf.firebaseapp.com",
  databaseURL: "https://joeandserina-e8baf-default-rtdb.firebaseio.com", // Add this line with your Realtime Database URL
  projectId: "joeandserina-e8baf",
  storageBucket: "joeandserina-e8baf.appspot.com",
  messagingSenderId: "669426918383",
  appId: "1:669426918383:web:5884696298787333380c1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

export { database, firestore };
