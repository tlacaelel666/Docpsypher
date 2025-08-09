// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Create a .env.local file in the root of your project
// and add your Firebase configuration there.
const firebaseConfig = {
  apiKey: "AIzaSyBrCYuMhqmrZII7B7ErPB6A_Lwj7SD4J7o",
  authDomain: "quantum-cipher-ap6vh.firebaseapp.com",
  projectId: "quantum-cipher-ap6vh",
  storageBucket: "quantum-cipher-ap6vh.firebasestorage.app",
  messagingSenderId: "572833279461",
  appId: "1:572833279461:web:59ebc747df65196586930c",
  measurementId: "G-HSQBPLTBF1"
};

let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;


// Initialize Firebase only if the API key is provided
if (firebaseConfig.apiKey) {
  // We check if the app is already initialized to avoid errors during hot-reloading.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
    // If you are seeing this log, it's likely you need to create a .env.local file
    // with your Firebase credentials.
    console.log("Firebase API Key not found. Firebase is not initialized.");
}


// @ts-ignore
export { app, auth, googleProvider, signInWithPopup };
