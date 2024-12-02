// File: firebaseAdminConfig.js

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./ergzz-e62ab-firebase-adminsdk-1tzgk-1da86e42eb.json");

// Ensure Firebase is initialized only once
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

module.exports = { firebaseAdmin };
