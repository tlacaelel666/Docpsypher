// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Create a .env.local file in the root of your project
// and add your Firebase configuration there.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;

// Initialize Firebase only if the API key is provided
if (firebaseConfig.apiKey) {
  // We check if the app is already initialized to avoid errors during hot-reloading.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
    // If you are seeing this log, it's likely you need to create a .env.local file
    // with your Firebase credentials.
    console.log("Firebase API Key not found. Firebase is not initialized.");
}


// @ts-ignore
export { app, auth };
