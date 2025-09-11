import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "applimpieza-1e5d0.firebaseapp.com",
    projectId: "applimpieza-1e5d0",
    storageBucket: "applimpieza-1e5d0.appspot.com",
    messagingSenderId: "667447022124",
    appId: "1:667447022124:web:6c9d8868afa5c86b01b789",
    measurementId: "G-GVFZGZLQB4"
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
auth.setPersistence(browserLocalPersistence);

export default firebaseConfig;

