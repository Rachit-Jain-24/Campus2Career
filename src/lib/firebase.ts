import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase project configuration for Campus2Career
const firebaseConfig = {
    apiKey: "REDACTED",
    authDomain: "virtual-placement-assistant.firebaseapp.com",
    projectId: "virtual-placement-assistant",
    storageBucket: "virtual-placement-assistant.firebasestorage.app",
    messagingSenderId: "691452774636",
    appId: "1:691452774636:web:2c40b46a5570da834a3dc9",
    measurementId: "G-Q06DSVF3XV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);
