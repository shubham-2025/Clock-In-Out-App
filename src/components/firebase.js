import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCA8KvHn-yt1C4IjdaoxvCLXgmhbPDqPF8",
    authDomain: "clock-app-4586f.firebaseapp.com",
    projectId: "clock-app-4586f",
    storageBucket: "clock-app-4586f.appspot.com",
    messagingSenderId: "558863898075",
    appId: "1:558863898075:web:4815fb7e50e78d08b843fe",
    measurementId: "G-JXGT6J249D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider(); // ✅ Renamed correctly

export { auth, googleProvider, signInWithPopup, signOut, db, collection, addDoc, getDocs, updateDoc, doc };
