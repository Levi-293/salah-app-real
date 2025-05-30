// Safely import Firebase modules with try/catch to handle builds where Firebase is removed
let firebaseApp = null;
let db = null;

try {
  const firebase = require('@react-native-firebase/app').default;
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getFirestore } = require('firebase/firestore');
// import analytics, {isSupported} from '@react-native-firebase/analytics';
// import { getAnalytics } from 'firebase/analytics';


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBEo6nwnUeNh49lb9jE1LIrWE-nSx0bQGI",
    authDomain: "salah-353f3.firebaseapp.com",
    projectId: "salah-353f3",
    storageBucket: "salah-353f3.appspot.com",
    messagingSenderId: "974359293027",
    appId: "1:974359293027:web:b7f3c3911758ae0996dc56",
    measurementId: "G-0LNHCXSPKS"
  };

  // Check if Firebase is already initialized to prevent duplicate initialization
  try {
    // First check if a React Native Firebase app exists
    if (firebase.apps.length === 0) {
      firebase.initializeApp();
    }
    
    // Then check if a web Firebase app exists
    const apps = getApps();
    if (apps.length === 0) {
      // No Firebase app initialized yet, create one
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      // Firebase app already initialized, get the existing one
      firebaseApp = getApp();
    }

    // Initialize Firestore
    db = getFirestore(firebaseApp);
  } catch (innerError) {
    console.log('Error during Firebase initialization:', innerError);
  }
  // const analytics = getAnalytics(firebaseApp);
} catch (error) {
  console.log('Firebase modules not available:', error);
  // Create dummy objects to prevent crashes
  firebaseApp = {};
  db = {
    collection: () => ({
      doc: () => ({}),
      where: () => ({}),
      get: async () => ({})
    }),
    doc: () => ({}),
    getDoc: async () => ({})
  };
}

export default firebaseApp;
export { db };