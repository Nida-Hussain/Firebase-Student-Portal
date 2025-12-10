import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDtaPJazLMCvB53qDQHe2dLWVCLyQH-zKA",
    authDomain: "new-fir-project.firebaseapp.com",
    projectId: "new-fir-project",
    storageBucket: "new-fir-project.firebasestorage.app",
    messagingSenderId: "63408038905",
    appId: "1:63408038905:web:973488ecbd0483e301d328",
    measurementId: "G-51H3PYC2RQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    db,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    deleteDoc, 
    doc 
}; 