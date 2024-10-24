// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDwCIm4fnwBABM96o4y8bEpYFSKIQdmtVg",
  authDomain: "self-destructing-iot-ac094.firebaseapp.com",
  projectId: "self-destructing-iot-ac094",
  storageBucket: "self-destructing-iot-ac094.appspot.com",
  messagingSenderId: "209576072023",
  appId: "1:209576072023:web:792062ca43fdf7b51e2412",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
