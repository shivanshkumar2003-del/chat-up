
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAqnspGQ58_fhi2BLiN0KRdpkeUnCcvIFA",
  authDomain: "chat-up-real.firebaseapp.com",
  databaseURL: "https://chat-up-real-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-up-real",
  storageBucket: "chat-up-real.firebasestorage.app",
  messagingSenderId: "703901771912",
  appId: "1:703901771912:web:889723091035adedf5d73d",
  measurementId: "G-QD5W3B1623"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
export const db = getDatabase(app);
