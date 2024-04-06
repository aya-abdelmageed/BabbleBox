const admin = require("firebase-admin");
import firebaseConfig from "../firebaseKeys.json"

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export default admin;

// Path: src/helpers/initFirebaseService.ts
