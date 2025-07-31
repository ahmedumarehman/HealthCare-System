// Firebase configuration for Healthcare System
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC-7SViIpcki8ABQ5IvAT1adF_Ji4-2dl4",
    authDomain: "form-178d6.firebaseapp.com",
    databaseURL: "https://form-178d6-default-rtdb.firebaseio.com/",
    projectId: "form-178d6",
    storageBucket: "form-178d6.firebasestorage.app",
    messagingSenderId: "440551737980",
    appId: "1:440551737980:web:355bedfe19fb2054a557f9"
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
