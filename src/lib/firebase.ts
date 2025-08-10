// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;


// Initialize Firebase only if the API key is provided
if (firebaseConfig.apiKey) {
  // We check if the app is already initialized to avoid errors during hot-reloading.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
    // If you are seeing this log, it's likely you need to create a .env.local file
    // with your Firebase credentials.
    console.warn("Firebase API Key not found. Firebase is not initialized. Please check your firebaseConfig.ts file.");
}


export { app, auth, googleProvider, signInWithPopup };
