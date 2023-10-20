
let admin = require("firebase-admin");
let serviceAccount = require("./key.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://system-0001-default-rtdb.firebaseio.com/'
});


firebaseCore = {
	firebase:admin,
	firestore:admin.firestore(),
	database:admin.database()
}

module.exports = firebaseCore
