"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCxb8hayS0Sk93jKSqlsn2_LNisKVRUpRY",
  authDomain: "kora-ecommerce-platform.firebaseapp.com",
  databaseURL: "https://kora-ecommerce-platform-default-rtdb.firebaseio.com",
  projectId: "kora-ecommerce-platform",
  storageBucket: "kora-ecommerce-platform.firebasestorage.app",
  messagingSenderId: "287511723090",
  appId: "1:287511723090:web:1d1de16f23f0d643e0b38b",
  measurementId: "G-1Q5W2PM8W3",
}

// Initialize Firebase
let app
let auth
let database

// Only initialize Firebase on the client side
if (typeof window !== "undefined") {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  database = getDatabase(app)
}

export { app, auth, database }

