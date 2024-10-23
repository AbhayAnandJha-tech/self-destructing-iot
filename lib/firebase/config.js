// src/firebase/config.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAJsUm2Bl7p9rV7lOLd2l_4R-RjunWtLaQ',
  authDomain: 'self-destructing-iot.firebaseapp.com',
  projectId: 'self-destructing-iot',
  storageBucket: 'self-destructing-iot.appspot.com',
  messagingSenderId: '914091653794',
  appId: '1:914091653794:web:af73f7d496528e9087b5fb',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
